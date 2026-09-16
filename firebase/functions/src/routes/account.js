const express = require('express');
const {
  userById,
  updateUserProfile,
  resetPassword,
} = require('../data');
const { verifyPassword, uniqueUsername } = require('../util');

const router = express.Router();

router.get('/settings', (req, res) => {
  res.render('settings', { pageTitle: 'Account Settings', active: '' });
});

router.post('/settings/identity', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const username = uniqueUsername(req.body.username);
    if (username === 'user') throw new Error('Username must be letters and numbers only.');
    const email = (req.body.email || '').trim() || (req.user.email || '');
    await updateUserProfile(userId, { username, email });
    req.flash('success', 'Username updated.');
    res.redirect('/settings');
  } catch (e) {
    req.flash('danger', e.message);
    res.redirect('/settings');
  }
});

router.post('/settings/password', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const current = await userById(userId);
    if (!current || !verifyPassword(req.body.currentPassword || '', current.password)) {
      throw new Error('Current password is incorrect.');
    }
    const password = req.body.password || '';
    if (password.length < 6) throw new Error('New password must be at least 6 characters.');
    if (password !== req.body.confirmPassword) throw new Error('Passwords do not match.');

    await resetPassword(userId, password);
    req.flash('success', 'Password changed successfully.');
    res.redirect('/settings');
  } catch (e) {
    req.flash('danger', e.message);
    res.redirect('/settings');
  }
});

module.exports = router;