const express = require('express');
const { subjectsWithTeacher, saveSubject, deleteSubject, allTeachers } = require('../data');
const { CLASSES } = require('../util');

const router = express.Router();

router.get('/subjects', async (req, res, next) => {
  try {
    const [subjects, teachers] = await Promise.all([subjectsWithTeacher(), allTeachers()]);
    res.render('admin/subjects', {
      pageTitle: 'Class & Subjects',
      active: 'subjects',
      subjects,
      teachers,
      CLASSES,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/subject/delete', async (req, res, next) => {
  try {
    await deleteSubject(req.query.id);
    req.flash('success', 'Subject deleted.');
    res.redirect('/subjects');
  } catch (e) {
    next(e);
  }
});

router.post('/subject/save', async (req, res, next) => {
  try {
    const subjectName = (req.body.subjectName || '').trim();
    if (!subjectName) throw new Error('Subject name is required.');
    const teacherId = req.body.teacherId ? Number(req.body.teacherId) : 0;
    await saveSubject({
      subjectName,
      className: (req.body.className || '').trim(),
      teacherId: teacherId > 0 ? teacherId : 0,
    });
    req.flash('success', 'Subject saved.');
    res.redirect('/subjects');
  } catch (e) {
    next(e);
  }
});

module.exports = router;