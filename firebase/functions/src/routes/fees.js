const express = require('express');
const {
  allFeeStructures, feeStructuresByClass, saveFeeStructure, deleteFeeStructure,
  allPayments, savePayment, duesByStudent, collectedByClass, totalCollected,
  allActiveStudents, studentById,
} = require('../data');
const { CLASSES, SECTIONS, PAYMENT_MODES } = require('../util');

const router = express.Router();

router.get('/fees', async (req, res, next) => {
  try {
    const className = (req.query.className || '').trim();
    const list = className ? await feeStructuresByClass(className) : await allFeeStructures();
    res.render('admin/fees', {
      pageTitle: 'Fee Structures',
      active: 'fees',
      feeStructures: list,
      filterClass: className,
      CLASSES,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/fees/payments', async (req, res, next) => {
  try {
    const studentId = Number(req.query.studentId) || 0;
    const payments = await allPayments();
    const students = await allActiveStudents();
    const feeStructures = await allFeeStructures();
    const filtered = studentId ? payments.filter((p) => Number(p.studentId) === studentId) : payments;
    const summary = {
      totalCollected: await totalCollected(),
      byClass: await collectedByClass(),
    };
    res.render('admin/payments', {
      pageTitle: 'Fee Payments',
      active: 'fees',
      payments: filtered,
      allPayments: payments,
      students,
      feeStructures,
      studentId,
      summary,
      PAYMENT_MODES,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/fee/edit', async (req, res, next) => {
  try {
    const id = Number(req.query.id) || 0;
    const list = await feeStructuresByClass((req.query.className || '').trim());
    res.render('admin/fee-form', {
      pageTitle: 'Edit Fee',
      active: 'fees',
      feeStructure: list.find((f) => Number(f.feeStructureId) === id) || null,
      className: (req.query.className || '').trim(),
      CLASSES,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/fee/delete', async (req, res, next) => {
  try {
    await deleteFeeStructure(Number(req.query.id) || 0);
    req.flash('success', 'Fee structure deleted.');
    res.redirect('/fees');
  } catch (e) {
    next(e);
  }
});

router.post('/fee/save', async (req, res, next) => {
  try {
    const className = (req.body.className || '').trim();
    const feeType = (req.body.feeType || '').trim();
    const amount = Number(req.body.amount || 0);
    if (!className || !feeType || !(amount > 0)) throw new Error('Class, fee type and amount are required.');
    await saveFeeStructure({
      className,
      feeType,
      amount,
      dueDate: (req.body.dueDate || '').trim() || null,
    });
    req.flash('success', 'Fee structure saved.');
    res.redirect('/fees?className=' + encodeURIComponent(className));
  } catch (e) {
    next(e);
  }
});

router.post('/payment/save', async (req, res, next) => {
  try {
    const studentId = Number(req.body.studentId) || 0;
    const feeStructureId = Number(req.body.feeStructureId) || 0;
    const amountPaid = Number(req.body.amountPaid || 0);
    if (!studentId || !feeStructureId || !(amountPaid > 0)) throw new Error('Student, fee type and amount are required.');
    await savePayment({
      studentId,
      feeStructureId,
      amountPaid,
      paymentMode: (req.body.paymentMode || '').trim(),
      paymentDate: (req.body.paymentDate || '').trim() || new Date().toISOString().slice(0, 10),
      receivedBy: req.user.id,
    });
    req.flash('success', 'Payment recorded.');
    res.redirect('/fees/payments?studentId=' + studentId);
  } catch (e) {
    next(e);
  }
});

module.exports = router;