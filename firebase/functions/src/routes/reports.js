const express = require('express');
const {
  countByClass,
  countTeachers,
  countByStatusOnDate,
  totalCollected,
  collectedByClass,
  allExams,
  resultsByExam,
} = require('../data');

const router = express.Router();

router.get('/reports', async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [classCounts, teacherCount, presentToday, absentToday, feeTotal, feeByClass, exams] =
      await Promise.all([
        countByClass(),
        countTeachers(),
        countByStatusOnDate('PRESENT', today),
        countByStatusOnDate('ABSENT', today),
        totalCollected(),
        collectedByClass(),
        allExams(),
      ]);

    const examSummaries = [];
    for (const e of exams) {
      const rows = await resultsByExam(e.examId);
      if (!rows.length) continue;
      const total = rows.reduce((s, r) => s + Number(r.marksObtained || 0), 0);
      const max = rows.reduce((s, r) => s + Number(r.maxMarks || 0), 0);
      const passes = rows.filter((r) => (r.grade || 'F') !== 'F').length;
      const studentIds = new Set(rows.map((r) => String(r.studentId)));
      examSummaries.push({
        examId: e.examId,
        examName: e.examName,
        className: e.className,
        examDate: e.examDate,
        total: Math.round(total * 100) / 100,
        max,
        percent: max ? Math.round((total / max) * 100) : 0,
        passes,
        fails: rows.length - passes,
        studentCount: studentIds.size,
        passPercent: rows.length ? Math.round((passes / rows.length) * 100) : 0,
      });
    }

    res.render('admin/reports', {
      pageTitle: 'Reports',
      active: 'reports',
      classCounts,
      teacherCount,
      presentToday,
      absentToday,
      feeTotal,
      feeByClass,
      examSummaries,
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;