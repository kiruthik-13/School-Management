const express = require('express');
const {
  studentsSearch,
  studentById,
  saveStudent,
  deactivateStudent,
  generatedAdmissionNo,
  usersByRole,
  createUser,
  uniqueUsernameFor,
  attendanceByStudent,
  attendanceStatsByStudent,
  resultsByStudent,
  duesByStudent,
  paymentsByStudent,
  transportForStudent,
  userById,
} = require('../data');
const { CLASSES, SECTIONS, gradeFor } = require('../util');

const router = express.Router();

router.get('/students', async (req, res, next) => {
  try {
    const className = (req.query.className || '').trim();
    const section = (req.query.section || '').trim();
    const students = await studentsSearch({ className, section, status: 'ACTIVE' });
    res.render('admin/students', {
      pageTitle: 'Students',
      active: 'students',
      students,
      filterClass: className,
      filterSection: section,
      CLASSES,
      SECTIONS,
    });
  } catch (e) {
    next(e);
  }
});

function formData(student, parents) {
  return {
    pageTitle: student ? 'Edit Student' : 'Add Student',
    active: 'students',
    student,
    parents,
    CLASSES,
    SECTIONS,
  };
}

router.get('/student/form', async (req, res, next) => {
  try {
    const student = req.query.id ? await studentById(req.query.id) : null;
    const parents = await usersByRole('PARENT');
    if (req.query.id && !student) return res.redirect('/students');
    res.render('admin/student-form', formData(student, parents));
  } catch (e) {
    next(e);
  }
});

router.get('/student/edit', async (req, res, next) => {
  try {
    const student = await studentById(req.query.id);
    if (!student) return res.redirect('/students');
    const parents = await usersByRole('PARENT');
    res.render('admin/student-form', formData(student, parents));
  } catch (e) {
    next(e);
  }
});

router.get('/student/delete', async (req, res, next) => {
  try {
    await deactivateStudent(req.query.id);
    req.flash('success', 'Student deactivated.');
    res.redirect('/students');
  } catch (e) {
    next(e);
  }
});

router.get('/student/profile', async (req, res, next) => {
  try {
    const student = await studentById(req.query.id);
    if (!student) throw new Error('Student not found.');

    const [attendance, attendanceStats, results, dues, payments, transport] = await Promise.all([
      attendanceByStudent(student.studentId),
      attendanceStatsByStudent(student.studentId),
      resultsByStudent(student.studentId),
      duesByStudent(student.studentId),
      paymentsByStudent(student.studentId),
      transportForStudent(student.studentId),
    ]);
    const parent = student.parentId ? await userById(student.parentId) : null;

    const byExam = new Map();
    for (const r of results) {
      if (!byExam.has(r.examId)) {
        byExam.set(r.examId, { examId: r.examId, examName: r.examName, rows: [] });
      }
      const rows = byExam.get(r.examId).rows;
      r.grade = r.maxMarks ? gradeFor(r.marksObtained, r.maxMarks) : '-';
      r.percent = r.maxMarks ? Math.round((r.marksObtained / r.maxMarks) * 100) : 0;
      rows.push(r);
    }
    const examResults = [...byExam.values()].map((g) => {
      const totalObtained = g.rows.reduce((s, r) => s + Number(r.marksObtained || 0), 0);
      const totalMax = g.rows.reduce((s, r) => s + Number(r.maxMarks || 0), 0);
      g.totalObtained = totalObtained;
      g.totalMax = totalMax;
      g.percent = totalMax ? Math.round((totalObtained / totalMax) * 100) : 0;
      g.grade = gradeFor(totalObtained, totalMax);
      return g;
    });

    const totalPaid = payments.reduce((s, p) => s + Number(p.amountPaid || 0), 0);
    const totalDue = dues.reduce((s, d) => s + Number(d.remaining || 0), 0);

    res.render('admin/student-profile', {
      pageTitle: student.fullName,
      active: 'students',
      student,
      parent,
      attendance: attendance.slice(0, 12),
      attendanceStats,
      dues,
      payments,
      examResults,
      transport,
      totalPaid,
      totalDue,
    });
  } catch (e) {
    next(e);
  }
});

router.post('/student/save', async (req, res, next) => {
  try {
    const body = req.body;
    const isUpdate = !!(body.studentId && String(body.studentId).trim());

    const data = {
      studentId: isUpdate ? Number(body.studentId) : undefined,
      admissionNo: isUpdate ? body.admissionNo : await generatedAdmissionNo(),
      firstName: (body.firstName || '').trim(),
      lastName: (body.lastName || '').trim(),
      dob: body.dob || null,
      gender: body.gender || null,
      className: (body.className || '').trim(),
      section: (body.section || '').trim(),
      address: (body.address || '').trim(),
      phone: (body.phone || '').trim(),
      status: 'ACTIVE',
    };

    if (!data.firstName || !data.className) {
      throw new Error('First name and class are required.');
    }

    if (body.parentChoice === 'new') {
      const name = (body.newParentName || '').trim();
      const email = (body.newParentEmail || '').trim();
      if (!name || !email) {
        throw new Error('Parent name and email are required to create a new parent account.');
      }
      const username = await uniqueUsernameFor(email);
      data.parentId = await createUser(username, 'parent123', 'PARENT', email, name);
    } else {
      data.parentId = body.parentId ? Number(body.parentId) : 0;
    }

    await saveStudent(data);
    req.flash('success', isUpdate ? 'Student updated.' : 'Student ' + data.admissionNo + ' admitted.');
    res.redirect('/students');
  } catch (e) {
    next(e);
  }
});

module.exports = router;