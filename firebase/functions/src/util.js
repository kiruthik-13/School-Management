const crypto = require('crypto');
const { db, COLLECTIONS } = require('./db');

const ITERATIONS = 10000;
const KEY_LEN = 32;
const DIGEST = 'sha1';

const CLASSES = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
];

const SECTIONS = ['A', 'B', 'C'];

const PAYMENT_MODES = ['CASH', 'ONLINE', 'CHEQUE'];

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex').toUpperCase();
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST)
    .toString('hex').toUpperCase();
  return `${ITERATIONS}$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  try {
    if (!stored || stored.indexOf('$') === -1) return false;
    const [iterStr, salt, hash] = stored.split('$');
    const iterations = parseInt(iterStr, 10);
    const check = crypto.pbkdf2Sync(password, salt, iterations, KEY_LEN, DIGEST)
      .toString('hex').toUpperCase();
    const a = Buffer.from(hash);
    const b = Buffer.from(check);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (e) {
    return false;
  }
}

async function nextId(collection, buffer = 10) {
  const ref = db.collection(COLLECTIONS.COUNTERS).doc(collection);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const next = (snap.exists ? snap.data().value : 0) + 1;
    tx.set(ref, { value: next });
    return next;
  });
}

function todayStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function gradeFor(marks, maxMarks) {
  if (!maxMarks || maxMarks <= 0) return '-';
  const pct = (marks / maxMarks) * 100;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 40) return 'D';
  return 'F';
}

function uniqueUsername(base) {
  const cleaned = String(base || '')
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  return cleaned || 'user';
}

function fullName(first, last) {
  return `${first || ''}${last ? ' ' + last : ''}`.trim();
}

module.exports = {
  hashPassword,
  verifyPassword,
  nextId,
  todayStr,
  gradeFor,
  uniqueUsername,
  fullName,
  CLASSES,
  SECTIONS,
  PAYMENT_MODES,
};