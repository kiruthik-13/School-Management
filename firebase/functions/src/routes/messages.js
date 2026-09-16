const express = require('express');
const {
  allTeachers, allActiveStudents, usersByRole, studentsByParent, studentById,
  sendMessage, conversation, allMessages, allStudentRoutes,
} = require('../data');

const router = express.Router();

const MESSAGE_ROLE_LABELS = { ADMIN: 'Admin', TEACHER: 'Teacher', PARENT: 'Parent' };

function sanitizeList(list) {
  return (list || []).map((u) => ({
    userId: Number(u.userId),
    username: String(u.username || ''),
    fullName: String(u.fullName || ''),
    role: String(u.role || ''),
  }));
}

router.get('/messages', async (req, res, next) => {
  try {
    const role = String(req.user.role || '');
    const userId = Number(req.user.userId || 0);
    let recipients = [];
    let students = [];

    if (role === 'ADMIN') {
      const [teachers, parents] = await Promise.all([
        allTeachers(),
        usersByRole('PARENT'),
      ]);
      recipients = sanitizeList(teachers.concat(parents.map((p) => ({
        userId: p.userId, username: p.username, fullName: p.fullName,
        role: 'PARENT',
      }))));
      students = await allActiveStudents();
    } else if (role === 'TEACHER') {
      const [parents, admins] = await Promise.all([
        usersByRole('PARENT'),
        usersByRole('ADMIN'),
      ]);
      recipients = sanitizeList(parents.concat(admins));
      students = await allActiveStudents();
    } else if (role === 'PARENT') {
      const children = await studentsByParent(userId);
      const [teachers, admins] = await Promise.all([
        allTeachers(),
        usersByRole('ADMIN'),
      ]);
      recipients = sanitizeList(teachers.concat(admins));
      students = children;
    }

    const conv = await conversation(userId);
    res.render('messages', {
      pageTitle: 'Messages',
      active: 'messages',
      recipients,
      students,
      conversation: conv,
      MESSAGE_ROLE_LABELS,
    });
  } catch (e) {
    next(e);
  }
});

router.post('/message/send', async (req, res, next) => {
  try {
    const senderId = Number(req.user.userId || 0);
    const receiverId = Number(req.body.receiverId) || 0;
    const studentId = Number(req.body.studentId) || 0;
    const subject = (req.body.subject || '').trim();
    const messageBody = (req.body.messageBody || '').trim();
    if (!receiverId || !messageBody) throw new Error('Recipient and message are required.');
    await sendMessage({ senderId, receiverId, studentId: studentId || null, subject: subject || null, messageBody });
    req.flash('success', 'Message sent.');
    res.redirect('/messages');
  } catch (e) {
    next(e);
  }
});

module.exports = router;