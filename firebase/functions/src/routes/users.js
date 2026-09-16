const express = require('express');
const {
  allUsers,
  userById,
  usernameExists,
  createUser,
  resetPassword,
  deleteUser,
  usersByRole,
} = require('../data');
const { uniqueUsername } = require('../util');

const router = express.Router();

const ROLES = ['ADMIN', 'TEACHER', 'PARENT', 'STUDENT'];

router.get('/users', async (req, res, next) => {
  try {
    const roleFilter = ROLES.includes(req.query.role) ? req.query.role : '';
    const users = roleFilter
      ? await usersByRole(roleFilter)
      : await allUsers();
    res.render('admin/users', {
      pageTitle: 'Users',
      active: 'users',
      users,
      roleFilter,
      ROLES,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/user/form', async (req, res, next) => {
  try {
    const resetUser = req.query.reset ? await userById(req.query.reset) : null;
    if (req.query.reset && !resetUser) throw new Error('User not found.');
    res.render('admin/user-form', {
      pageTitle: resetUser ? 'Reset Password' : 'Add User',
      active: 'users',
      user: resetUser,
      ROLES,
    });
  } catch (e) {
    next(e);
  }
});

router.post('/user/save', async (req, res, next) => {
  try {
    const body = req.body;
    const role = (body.role || '').toUpperCase();
    if (!ROLES.includes(role)) throw new Error('Invalid role selected.');

    const username = uniqueUsername(body.username);
    if (!username || username === 'user') throw new Error('Username is required (letters and numbers only).');
    if (await usernameExists(username)) throw new Error('That username is already taken.');

    const password = body.password || '';
    if (password.length < 6) throw new Error('Password must be at least 6 characters.');
    if (password !== body.confirmPassword) throw new Error('Passwords do not match.');

    await createUser(
      username,
      password,
      role,
      (body.email || '').trim() || null,
      (body.fullName || '').trim() || null
    );
    req.flash('success', `User "${username}" created as ${role}.`);
    res.redirect('/users');
  } catch (e) {
    req.flash('danger', e.message);
    res.redirect('/user/form');
  }
});

router.post('/user/reset', async (req, res, next) => {
  try {
    const target = await userById(req.body.userId);
    if (!target) throw new Error('User not found.');
    const password = req.body.password || '';
    if (password.length < 6) throw new Error('Password must be at least 6 characters.');
    if (password !== req.body.confirmPassword) throw new Error('Passwords do not match.');

    await resetPassword(target.userId, password);
    req.flash('success', `Password reset for "${target.username}".`);
    res.redirect('/users');
  } catch (e) {
    req.flash('danger', e.message);
    res.redirect('/user/form?reset=' + encodeURIComponent(req.body.userId || ''));
  }
});

router.get('/user/delete', async (req, res, next) => {
  try {
    const target = await userById(req.query.id);
    if (!target) throw new Error('User not found.');

    if (Number(target.userId) === Number(req.user.userId)) {
      throw new Error('You cannot delete your own account.');
    }
    if (target.role === 'ADMIN') {
      const admins = await usersByRole('ADMIN');
      if (admins.length <= 1) throw new Error('Cannot delete the last administrator account.');
    }

    await deleteUser(target.userId);
    req.flash('success', `User "${target.username}" deleted.`);
    res.redirect('/users');
  } catch (e) {
    req.flash('danger', e.message);
    res.redirect('/users');
  }
});

module.exports = router;