const express = require('express');
const {
  allExams, examById, studentsByClass, subjectsWithTeacher,
  resultsByExam, resultsByExamStudent, saveResult, resultsByStudent,
  deleteResultsByExam, studentById, allActiveStudents,
} = require('../data');
const { CLASSES, SECTIONS } = require('../util');

const router = express.Router();

router.get('/marks', async (req, res, next) => {
  try {
    const examId = Number(req.query.examId) || 0;
    const className = (req.query.className || '').trim();
    const section = (req.query.section || '').trim();
    const exams = await allExams();
    const selected = await examById(examId);
    const students = className ? await studentsByClass(className, section) : [];
    const subjects = className ? await subjectsWithTeacher(className) : [];
    let results = [];
    if (examId) results = await resultsByExam(examId);
    res.render('admin/marks', {
      pageTitle: 'Marks & Results',
      active: 'marks',
      exams, selected, students, subjects, results,
      filterExam: examId, filterClass: className, filterSection: section,
      CLASSES, SECTIONS,
    });
  } catch (e) { next(e); }
});

router.post('/result/save', async (req, res, next) => {
  try {
    const examId = Number(req.body.examId) || 0;
    const studentId = Number(req.body.studentId) || 0;
    const subjectId = Number(req.body.subjectId) || 0;
    const marks = Number(req.body.marksObtained || 0);
    const maxMarks = Number(req.body.maxMarks || 0) || 100;
    if (!examId || !studentId || !subjectId) throw new Error('Exam, student and subject are required.');
    await saveResult(examId, studentId, subjectId, marks, maxMarks);
    req.flash('success', 'Marks saved for student #' + studentId + '.');
    res.redirect('/marks?examId=' + examId +
      '&className=' + encodeURIComponent(req.body.className || '') +
      '&section=' + encodeURIComponent(req.body.section || ''));
  } catch (e) { next(e); }
});

router.get('/report', async (req, res, next) => {
  try {
    const examId = Number(req.query.examId) || 0;
    const studentId = Number(req.query.studentId) || 0;
    const exam = await examById(examId);
    const student = await studentById(studentId);
    if (!exam || !student) return res.status(404).render('error', { message: 'Report card not found.' });
    const rows = await resultsByExamStudent(examId, studentId);
    const totalMarks = rows.reduce((s, r) => s + Number(r.marksObtained || 0), 0);
    const totalSubjects = rows.length;
    const maxMarks = rows.reduce((s, r) => s + Number(r.maxMarks || 0), 0);
    const percent = maxMarks ? Math.round((totalMarks / maxMarks) * 100) : 0;
    const grade = percent >= 90 ? 'A+' : percent >= 80 ? 'A' : percent >= 70 ? 'B+' :
                  percent >= 60 ? 'B' : percent >= 50 ? 'C' : percent >= 40 ? 'D' : 'F';
    const pass = totalSubjects > 0 && rows.every((r) => (r.grade || 'F') !== 'F');
    res.render('report-card', {
      pageTitle: 'Report Card',
      active: 'report',
      exam, student, rows, totalMarks, totalSubjects, maxMarks, percent, grade, pass,
    });
  } catch (e) { next(e); }
});

module.exports = router;