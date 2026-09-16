const express = require('express');
const { studentsByClass, attendanceByClassDate, saveAttendance, countByStatusOnDate, attendanceSummaryByClass } = require('../data');
const { CLASSES, SECTIONS } = require('../util');

const router = express.Router();

router.get('/attendance', async (req, res, next) => {
  try {
    const className = (req.query.className || '').trim();
    const section = (req.query.section || '').trim();
    const date = (req.query.date || '').trim() || new Date().toISOString().slice(0, 10);
    const students = await studentsByClass(className, section);
    const records = await attendanceByClassDate(className, section, date);
    const present = await countByStatusOnDate('PRESENT', date);
    const absent = await countByStatusOnDate('ABSENT', date);
    res.render('admin/attendance', {
      pageTitle: 'Attendance',
      active: 'attendance',
      students,
      records,
      present,
      absent,
      filterClass: className,
      filterSection: section,
      filterDate: date,
      CLASSES,
      SECTIONS,
    });
  } catch (e) {
    next(e);
  }
});

router.post('/attendance/save', async (req, res, next) => {
  try {
    const date = (req.body.date || '').trim();
    const className = (req.body.className || '').trim();
    const section = (req.body.section || '').trim();
    const records = [];
    for (const key of Object.keys(req.body)) {
      if (key.startsWith('status_')) {
        const studentId = Number(key.slice(7));
        const status = (req.body[key] || '').trim();
        if (studentId && status) {
          records.push({ studentId, attendanceDate: date, status, markedBy: req.user.userId });
        }
      }
    }
    await saveAttendance(records);
    req.flash('success', 'Attendance saved for ' + (className || 'All classes') + (section ? ' - ' + section : '') + '.');
    res.redirect('/attendance?className=' + encodeURIComponent(className) + '&section=' + encodeURIComponent(section) + '&date=' + encodeURIComponent(date));
  } catch (e) {
    next(e);
  }
});

module.exports = router;