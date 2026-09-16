const { db, COLLECTIONS } = require('./db');

const ADMIN_ONLY_PATHS = [
  /^\/teachers$/, /^\/teacher\/(save|edit|delete)$/,
  /^\/students$/, /^\/students\/...$/, /^\/student\/(?!profile$)/,
  /^\/subjects$/, /^\/subject\//,
  /^\/exams$/, /^\/exam\//,
  /^\/fees$/, /^\/fee\//,
  /^\/payments$/, /^\/payment\//,
  /^\/transport$/, /^\/transport\//,
  /^\/reports$/,
  /^\/users$/, /^\/user\//,
];

const TEACHER_ADMIN_PATHS = [
  /^\/attendance$/, /^\/marks$/, /^\/result\//, /^\/report$/, /^\/student\/profile$/,
];

const MESSAGE_PATHS = [/^\/messages$/, /^\/message\//];

function isPath(path, patterns) {
  return patterns.some((re) => re.test(path));
}

function loadUser(req, res, next) {
  if (req.session && req.session.userId) {
    db.collection(COLLECTIONS.USERS).doc(String(req.session.userId)).get()
      .then((snap) => {
        if (snap.exists) {
          req.user = Object.assign({ id: snap.id }, snap.data());
          res.locals.user = req.user;
        } else {
          req.session.destroy(() => {});
        }
        next();
      })
      .catch((e) => next(e));
  } else {
    res.locals.user = null;
    next();
  }
}

function requireAuth(req, res, next) {
  const path = req.path;
  const user = req.user;

  if (!user) {
    return res.redirect('/login');
  }

  if (path.startsWith('/admin')) {
    if (user.role !== 'ADMIN') return res.status(403).render('error', { message: 'Access denied' });
    return next();
  }
  if (path.startsWith('/parent')) {
    if (user.role !== 'PARENT') return res.status(403).render('error', { message: 'Access denied' });
    return next();
  }
  if (isPath(path, ADMIN_ONLY_PATHS)) {
    if (user.role !== 'ADMIN') return res.status(403).render('error', { message: 'Access denied' });
    return next();
  }
  if (path.startsWith('/teacher') && !isPath(path, ADMIN_ONLY_PATHS)) {
    if (user.role !== 'TEACHER') return res.status(403).render('error', { message: 'Access denied' });
    return next();
  }
  if (isPath(path, TEACHER_ADMIN_PATHS)) {
    if (!['TEACHER', 'ADMIN'].includes(user.role)) return res.status(403).render('error', { message: 'Access denied' });
    return next();
  }
  if (path.startsWith('/student')) {
    if (user.role !== 'STUDENT') return res.status(403).render('error', { message: 'Access denied' });
    return next();
  }
  if (isPath(path, MESSAGE_PATHS)) {
    return next();
  }

  if (['ADMIN', 'TEACHER', 'PARENT', 'STUDENT'].includes(user.role)) return next();
  return res.status(403).render('error', { message: 'Access denied' });
}

module.exports = { requireAuth, loadUser };