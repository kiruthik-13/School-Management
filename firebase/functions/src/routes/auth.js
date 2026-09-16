const express = require('express');
const {
  authenticate,
  userByUsernameOrEmail,
  usersByEmail,
  resetPassword,
} = require('../data');

const router = express.Router();

function home(role) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'TEACHER') return '/teacher';
  if (role === 'STUDENT') return '/student';
  return '/parent';
}

router.get('/login', (req, res) => {
  if (req.user) return res.redirect(home(req.user.role));
  res.render('login', {
    pageTitle: 'Login',
    error: null,
    info: req.query.logout === 'success' ? 'You have been logged out.' : null,
  });
});

router.post('/login', async (req, res, next) => {
  try {
    const username = (req.body.username || '').trim();
    const password = req.body.password || '';
    if (!username || !password) {
      return res.status(400).render('login', {
        pageTitle: 'Login',
        error: 'Username/email and password are required.',
        info: null,
      });
    }
    const user = await authenticate(username, password);
    if (!user) {
      return res.status(401).render('login', {
        pageTitle: 'Login',
        error: 'Invalid username/email or password.',
        info: null,
      });
    }
    req.session.userId = user.userId;
    req.flash('success', 'Welcome back, ' + user.username + '!');
    res.redirect(home(user.role));
  } catch (e) {
    next(e);
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login?logout=success'));
});

router.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { pageTitle: 'Forgot Password' });
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const identifier = (req.body.username || '').trim();
    const password = req.body.password || '';
    const confirmPassword = req.body.confirmPassword || '';

    if (!identifier) {
      req.flash('danger', 'Enter your username or email.');
      return res.redirect('/forgot-password');
    }
    const user = await userByUsernameOrEmail(identifier);
    if (!user) {
      req.flash('danger', 'No account found with that username or email.');
      return res.redirect('/forgot-password');
    }
    if (password.length < 6) {
      req.flash('danger', 'New password must be at least 6 characters.');
      return res.redirect('/forgot-password');
    }
    if (password !== confirmPassword) {
      req.flash('danger', 'Passwords do not match.');
      return res.redirect('/forgot-password');
    }

    await resetPassword(user.userId, password);
    req.flash('success', 'Password reset for "' + user.username + '". You can now sign in.');
    res.redirect('/login');
  } catch (e) {
    next(e);
  }
});

router.get('/forgot-username', (req, res) => {
  res.render('forgot-username', { pageTitle: 'Forgot Username', matches: null, searched: null });
});

router.post('/forgot-username', async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim();
    if (!email) {
      req.flash('danger', 'Enter the email address to recover your username.');
      return res.redirect('/forgot-username');
    }
    const matches = await usersByEmail(email);
    res.render('forgot-username', {
      pageTitle: 'Forgot Username',
      matches,
      searched: email,
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;