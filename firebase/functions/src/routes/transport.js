const express = require('express');
const { allRoutes, saveRoute, assignRoute, removeAssignment, allStudentRoutes } = require('../data');

const router = express.Router();

router.get('/transport', async (req, res, next) => {
  try {
    const [routes, assignments] = await Promise.all([allRoutes(), allStudentRoutes()]);
    res.render('admin/transport', {
      pageTitle: 'Transport',
      active: 'transport',
      routes,
      assignments,
    });
  } catch (e) {
    next(e);
  }
});

router.post('/route/save', async (req, res, next) => {
  try {
    const routeName = (req.body.routeName || '').trim();
    if (!routeName) throw new Error('Route name is required.');
    await saveRoute({
      routeName,
      vehicleNo: (req.body.vehicleNo || '').trim(),
      driverName: (req.body.driverName || '').trim(),
      driverPhone: (req.body.driverPhone || '').trim(),
      fare: Number(req.body.fare || 0),
    });
    res.redirect('/transport');
  } catch (e) {
    next(e);
  }
});

router.get('/transport/students', async (req, res, next) => {
  try {
    const [rows, routes] = await Promise.all([allStudentRoutes(), allRoutes()]);
    res.render('admin/transport-students', {
      pageTitle: 'Student Transport List',
      active: 'transport',
      rows,
      routes,
    });
  } catch (e) {
    next(e);
  }
});

router.post('/transport/assign', async (req, res, next) => {
  try {
    const studentId = Number(req.body.studentId) || 0;
    const routeId = Number(req.body.routeId) || 0;
    if (!studentId || !routeId) throw new Error('Student and route are required.');
    await assignRoute(studentId, routeId);
    req.flash('success', 'Student assigned to route.');
    res.redirect('/transport/students');
  } catch (e) {
    next(e);
  }
});

router.get('/transport/remove', async (req, res, next) => {
  try {
    await removeAssignment(Number(req.query.studentId) || 0);
    req.flash('success', 'Assignment removed.');
    res.redirect('/transport/students');
  } catch (e) {
    next(e);
  }
});

module.exports = router;
