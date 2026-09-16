const express = require('express');
const {
  countByClass,
  countTeachers,
  countByStatusOnDate,
  totalCollected,
  teacherByUserId,
  studentByUserId,
  subjectsWithTeacher,
  studentsByParent,
  studentById,
  attendanceStatsByStudent,
  duesByStudent,
  transportForStudent,
  paymentsByStudent,
  resultsByStudent,
  attendanceByStudent,
} = require('../data');

const router = express.Router();
const today = new Date().toISOString().slice(0, 10);

router.get('/admin', async (req, res, next) => {
  try {
    const classCounts = await countByClass();
    const studentCount = classCounts.reduce((sum, c) => sum + c.count, 0);
    const [teacherCount, presentToday, absentToday, feeCollected] = await Promise.all([
      countTeachers(),
      countByStatusOnDate('PRESENT', today),
      countByStatusOnDate('ABSENT', today),
      totalCollected(),
    ]);
    res.render('admin/dashboard', {
      pageTitle: 'Admin Dashboard',
      active: 'dashboard',
      studentCount,
      teacherCount,
      presentToday,
      absentToday,
      feeCollected,
      classCounts,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/teacher', async (req, res, next) => {
  try {
    const teacher = await teacherByUserId(req.user.userId);
    if (!teacher) {
      return res.status(500).render('error', {
        pageTitle: 'Error',
        message: 'No teacher profile linked to this account.',
      });
    }
    const subjects = await subjectsWithTeacher();
    const subjectCount = subjects.filter((s) => Number(s.teacherId) === Number(teacher.teacherId)).length;
    res.render('teacher/dashboard', {
      pageTitle: 'Teacher Dashboard',
      active: 'dashboard',
      teacher,
      subjectCount,
      subjects,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/parent', async (req, res, next) => {
  try {
    const children = await studentsByParent(req.user.userId);
    if (children.length === 0) {
      return res.render('parent/dashboard', {
        pageTitle: 'Parent Portal',
        active: 'dashboard',
        children: [],
        child: null,
        message: 'No student record is linked to your account yet. Contact the school office.',
      });
    }
    const child = children[0];
    const [
      attendanceStats,
      dues,
      transport,
      payments,
      marks,
      recentAttendance,
    ] = await Promise.all([
      attendanceStatsByStudent(child.studentId),
      duesByStudent(child.studentId),
      transportForStudent(child.studentId),
      paymentsByStudent(child.studentId),
      resultsByStudent(child.studentId),
      attendanceByStudent(child.studentId),
    ]);
    res.render('parent/dashboard', {
      pageTitle: 'Parent Portal',
      active: 'dashboard',
      children,
      child,
      attendanceStats,
      dues,
      transport,
      payments,
      marks,
      recentAttendance,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/student', async (req, res, next) => {
  try {
    const student = await studentByUserId(req.user.userId);
    if (!student) {
      return res.status(500).render('error', {
        pageTitle: 'Error',
        message: 'No student profile linked to this account. Contact the school office.',
      });
    }
    const [
      attendanceStats,
      dues,
      transport,
      payments,
      marks,
      recentAttendance,
    ] = await Promise.all([
      attendanceStatsByStudent(student.studentId),
      duesByStudent(student.studentId),
      transportForStudent(student.studentId),
      paymentsByStudent(student.studentId),
      resultsByStudent(student.studentId),
      attendanceByStudent(student.studentId),
    ]);
    res.render('student/dashboard', {
      pageTitle: 'Student Portal',
      active: 'dashboard',
      student,
      attendanceStats,
      dues,
      transport,
      payments,
      marks,
      recentAttendance,
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;