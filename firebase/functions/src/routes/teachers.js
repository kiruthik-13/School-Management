const express = require('express');
const {
  allTeachers,
  teacherById,
  saveTeacher,
  deleteTeacher,
  createUser,
  uniqueUsernameFor,
} = require('../data');

const router = express.Router();

router.get('/teachers', async (req, res, next) => {
  try {
    const teachers = await allTeachers();
    res.render('admin/teachers', {
      pageTitle: 'Teachers',
      active: 'teachers',
      teachers,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/teacher/edit', async (req, res, next) => {
  try {
    const teacher = await teacherById(req.query.id);
    res.render('admin/teacher-form', {
      pageTitle: 'Edit Teacher',
      active: 'teachers',
      teacher,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/teacher/delete', async (req, res, next) => {
  try {
    await deleteTeacher(req.query.id);
    req.flash('success', 'Teacher deleted.');
    res.redirect('/teachers');
  } catch (e) {
    next(e);
  }
});

router.post('/teacher/save', async (req, res, next) => {
  try {
    const body = req.body;
    const isUpdate = !!(body.teacherId && String(body.teacherId).trim());

    const first = (body.firstName || '').trim();
    if (!first) throw new Error('First name is required.');

    const email = (body.email || '').trim();
    if (!isUpdate && !email) throw new Error('Email is required to create the login account.');

    const data = {
      teacherId: isUpdate ? Number(body.teacherId) : undefined,
      firstName: first,
      lastName: (body.lastName || '').trim(),
      subjectSpecialization: (body.subjectSpecialization || '').trim() || null,
      phone: (body.phone || '').trim() || null,
      email: email || null,
      joiningDate: body.joiningDate || null,
    };

    if (isUpdate) {
      const existing = await teacherById(data.teacherId);
      data.userId = existing ? existing.userId : undefined;
      await saveTeacher(data);
    } else {
      const username = await uniqueUsernameFor(email);
      data.userId = await createUser(username, 'teacher123', 'TEACHER', email);
      await saveTeacher(data);
    }
    req.flash('success', isUpdate ? 'Teacher updated.' : 'Teacher added with login account.');
    res.redirect('/teachers');
  } catch (e) {
    next(e);
  }
});

module.exports = router;