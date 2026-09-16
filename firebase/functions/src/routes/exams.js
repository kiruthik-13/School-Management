const express = require('express');
const { allExams, saveExam, deleteExam } = require('../data');
const { CLASSES } = require('../util');

const router = express.Router();

router.get('/exams', async (req, res, next) => {
  try {
    const className = (req.query.className || '').trim();
    const list = await allExams();
    res.render('admin/exams', {
      pageTitle: 'Exams',
      active: 'exams',
      exams: className ? list.filter((e) => e.className === className) : list,
      filterClass: className,
      CLASSES,
    });
  } catch (e) {
    next(e);
  }
});

router.post('/exam/save', async (req, res, next) => {
  try {
    const examName = (req.body.examName || '').trim();
    if (!examName) throw new Error('Exam name is required.');
    await saveExam({
      examName,
      examType: (req.body.examType || '').trim(),
      className: (req.body.className || '').trim(),
      examDate: (req.body.examDate || '').trim(),
    });
    req.flash('success', 'Exam scheduled.');
    res.redirect('/exams');
  } catch (e) {
    next(e);
  }
});

router.get('/exam/delete', async (req, res, next) => {
  try {
    await deleteExam(req.query.id);
    req.flash('success', 'Exam deleted.');
    res.redirect('/exams');
  } catch (e) {
    next(e);
  }
});

module.exports = router;