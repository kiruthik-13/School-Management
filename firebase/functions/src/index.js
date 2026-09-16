const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const session = require('express-session');
const { onRequest } = require('firebase-functions/v2/https');
const { db } = require('./db');
const { COLLECTIONS } = require('./db');
const { FirestoreStore, SESSION_TTL_MS } = require('./session-store');
const { loadUser, requireAuth } = require('./middleware');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const studentRoutes = require('./routes/students');
const teacherRoutes = require('./routes/teachers');
const subjectRoutes = require('./routes/subjects');
const examRoutes = require('./routes/exams');
const attendanceRoutes = require('./routes/attendance');
const resultRoutes = require('./routes/results');
const feeRoutes = require('./routes/fees');
const transportRoutes = require('./routes/transport');
const messageRoutes = require('./routes/messages');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');
const accountRoutes = require('./routes/account');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
  store: new FirestoreStore({ collection: COLLECTIONS.SESSIONS, ttl: SESSION_TTL_MS }),
  secret: process.env.SESSION_SECRET || 'school-demo-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: SESSION_TTL_MS },
}));

app.use(loadUser);

app.use((req, res, next) => {
  const flashes = (req.session && req.session.flashes) || [];
  res.locals.flashes = flashes;
  if (req.session) req.session.flashes = [];
  req.flash = (type, message) => {
    if (!req.session.flashes) req.session.flashes = [];
    req.session.flashes.push({ type, message });
  };
  next();
});

app.use('/', authRoutes);

app.use(requireAuth);

app.use('/', dashboardRoutes);
app.use('/', studentRoutes);
app.use('/', teacherRoutes);
app.use('/', subjectRoutes);
app.use('/', examRoutes);
app.use('/', attendanceRoutes);
app.use('/', resultRoutes);
app.use('/', feeRoutes);
app.use('/', transportRoutes);
app.use('/', messageRoutes);
app.use('/', reportRoutes);
app.use('/', userRoutes);
app.use('/', accountRoutes);

app.use((req, res) => {
  res.status(404).render('error', { pageTitle: 'Not Found', message: 'Page not found.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).render('error', {
    pageTitle: 'Error',
    message: err.message || 'Something went wrong.',
  });
});

module.exports = app;
module.exports.app = onRequest(app);