/* eslint-disable no-console */
/*
 * Firestore seed script for the School Management App.
 *
 * Mirrors database/schema.sql so the emulator / Firestore has the same demo
 * data the JSP app ships with.
 *
 *   Run against the emulator:
 *     cd firebase/functions
 *     firebase emulators:exec --only firestore "npm run seed"
 *
 *   Run against a real project (after GOOGLE_APPLICATION_CREDENTIALS is set):
 *     cd firebase/functions
 *     npm run seed
 *
 * The script is idempotent: it wipes the seeded collections and re-writes them.
 */
const { db } = require('./src/db');
const { hashPassword } = require('./src/util');

const COLLECTIONS = {
  USERS: 'users',
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  SUBJECTS: 'subjects',
  ATTENDANCE: 'attendance',
  EXAMS: 'exams',
  EXAM_RESULTS: 'exam_results',
  FEE_STRUCTURE: 'fee_structures',
  FEE_PAYMENTS: 'fee_payments',
  TRANSPORT_ROUTES: 'transport_routes',
  STUDENT_TRANSPORT: 'student_transport',
  MESSAGES: 'messages',
  COUNTERS: 'counters',
};

const SEED_COLLECTIONS = [
  'messages', 'student_transport', 'transport_routes', 'fee_payments',
  'fee_structures', 'attendance', 'exam_results', 'exams', 'subjects',
  'teachers', 'students', 'users', 'counters',
];

const admin = {
  userId: 1,
  username: 'admin',
  password: hashPassword('admin123'),
  role: 'ADMIN',
  email: 'admin@school.com',
  fullName: 'System Administrator',
  createdAt: new Date(),
};

function user(id, username, role, email, fullName, password) {
  return {
    userId: id,
    username,
    password: password || hashPassword(getDefaultPassword(role)),
    role,
    email,
    fullName,
    createdAt: new Date(),
  };
}

function getDefaultPassword(role) {
  if (role === 'TEACHER') return 'teacher123';
  if (role === 'PARENT') return 'parent123';
  if (role === 'STUDENT') return 'student123';
  return 'admin123';
}

function student(id, admissionNo, firstName, lastName, dob, gender, className, section, parentId, address, phone, userId) {
  return {
    studentId: id,
    admissionNo,
    firstName,
    lastName,
    dob,
    gender,
    className,
    section,
    parentId,
    userId: userId || 0,
    address,
    phone,
    admissionDate: '2023-06-01',
    status: 'ACTIVE',
  };
}

function teacher(id, userId, firstName, lastName, subjectSpecialization, phone, email, joiningDate) {
  return {
    teacherId: id,
    userId,
    firstName,
    lastName,
    subjectSpecialization,
    phone,
    email,
    joiningDate,
  };
}

function runWithRetries(fn, attempts = 5) {
  return fn().catch((err) => {
    if (attempts <= 1) throw err;
    console.log('  retrying after error:', err.message);
    return new Promise((resolve) => setTimeout(resolve, 1000))
      .then(() => runWithRetries(fn, attempts - 1));
  });
}

async function wipeCollection(name) {
  const snap = await db.collection(name).get();
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  return snap.size;
}

async function runSeed() {
  console.log('Connecting to Firestore...');
  const emulator = process.env.FIRESTORE_EMULATOR_HOST
    || (process.env.FIREBASE_EMULATOR === '1')
    || process.env.GCLOUD_PROJECT === 'demo-school';

  if (!emulator) {
    console.warn(
      'NOTE: FIRESTORE_EMULATOR_HOST is not set. If you have not configured ' +
      'GOOGLE_APPLICATION_CREDENTIALS this will fail at the first write.'
    );
  }

  console.log('Wiping existing seed collections...');
  for (const name of SEED_COLLECTIONS) {
    const removed = await runWithRetries(() => wipeCollection(name));
    console.log(`  cleared ${name} (${removed} docs)`);
  }

  console.log('Writing users...');
  const users = [
    admin,
    user(2, 'teacher1', 'TEACHER', 'teacher1@school.com', 'Anita Deshpande'),
    user(3, 'teacher2', 'TEACHER', 'teacher2@school.com', 'Rajesh Kulkarni'),
    user(4, 'parent1', 'PARENT', 'parent1@example.com', 'Rahul Sharma Parent'),
    user(5, 'parent2', 'PARENT', 'parent2@example.com', 'Arjun Mehta Parent'),
    user(6, 'parent3', 'PARENT', 'parent3@example.com', 'Vikram Singh Parent'),
    user(7, 'Kiruthik', 'ADMIN', 'kiruthik@school.com', 'Kiruthik', hashPassword('130706')),
    user(8, 'student1', 'STUDENT', 'rahul@student.school.com', 'Rahul Sharma'),
    user(9, 'student2', 'STUDENT', 'priya@student.school.com', 'Priya Verma'),
    user(10, 'student3', 'STUDENT', 'arjun@student.school.com', 'Arjun Mehta'),
    user(11, 'student4', 'STUDENT', 'sneha@student.school.com', 'Sneha Patil'),
    user(12, 'student5', 'STUDENT', 'vikram@student.school.com', 'Vikram Singh'),
  ];
  for (const u of users) await db.collection(COLLECTIONS.USERS).doc(String(u.userId)).set(u);

  console.log('Writing students...');
  const students = [
    student(1, 'SM001', 'Rahul', 'Sharma', '2014-05-12', 'M', 'Class 5', 'A', 4, '12 MG Road, Pune', '9812345001', 8),
    student(2, 'SM002', 'Priya', 'Verma', '2014-08-23', 'F', 'Class 5', 'A', 4, '12 MG Road, Pune', '9812345001', 9),
    student(3, 'SM003', 'Arjun', 'Mehta', '2013-01-30', 'M', 'Class 6', 'B', 5, '45 FC Road, Pune', '9822345002', 10),
    student(4, 'SM004', 'Sneha', 'Patil', '2013-11-17', 'F', 'Class 6', 'B', 5, '45 FC Road, Pune', '9822345002', 11),
    student(5, 'SM005', 'Vikram', 'Singh', '2012-03-05', 'M', 'Class 7', 'A', 6, '78 Baner Road, Pune', '9832345003', 12),
  ];
  for (const s of students) await db.collection(COLLECTIONS.STUDENTS).doc(String(s.studentId)).set(s);

  console.log('Writing teachers...');
  const teachers = [
    teacher(1, 2, 'Anita', 'Deshpande', 'Mathematics', '9844044001', 'teacher1@school.com', '2020-04-15'),
    teacher(2, 3, 'Rajesh', 'Kulkarni', 'Science', '9844044002', 'teacher2@school.com', '2019-08-01'),
  ];
  for (const t of teachers) await db.collection(COLLECTIONS.TEACHERS).doc(String(t.teacherId)).set(t);

  console.log('Writing subjects...');
  const subjectRows = [
    ['Mathematics', 'Class 5', 1], ['Science', 'Class 5', 1], ['English', 'Class 5', 1], ['Social Science', 'Class 5', 1],
    ['Mathematics', 'Class 6', 2], ['Science', 'Class 6', 2], ['English', 'Class 6', 2], ['Social Science', 'Class 6', 2],
    ['Mathematics', 'Class 7', 1], ['Science', 'Class 7', 2], ['English', 'Class 7', 1], ['Social Science', 'Class 7', 2],
  ];
  const subjects = subjectRows.map(([subjectName, className, teacherId], i) => ({
    subjectId: i + 1,
    subjectName,
    className,
    teacherId,
  }));
  for (const s of subjects) await db.collection(COLLECTIONS.SUBJECTS).doc(String(s.subjectId)).set(s);

  console.log('Writing attendance...');
  const attendance = [
    [1, '2026-09-01', 'PRESENT', 1], [2, '2026-09-01', 'PRESENT', 1], [3, '2026-09-01', 'ABSENT', 2],
    [4, '2026-09-01', 'PRESENT', 2], [5, '2026-09-01', 'PRESENT', 1],
    [1, '2026-09-02', 'PRESENT', 1], [2, '2026-09-02', 'LEAVE', 1], [3, '2026-09-02', 'PRESENT', 2],
    [4, '2026-09-02', 'PRESENT', 2], [5, '2026-09-02', 'ABSENT', 1],
    [1, '2026-09-03', 'PRESENT', 1], [2, '2026-09-03', 'PRESENT', 1], [3, '2026-09-03', 'PRESENT', 2],
    [4, '2026-09-03', 'ABSENT', 2], [5, '2026-09-03', 'PRESENT', 1],
  ];
  for (const [studentId, attendanceDate, status, markedBy] of attendance) {
    await db.collection(COLLECTIONS.ATTENDANCE)
      .doc(`${studentId}_${attendanceDate}`)
      .set({ studentId, attendanceDate, status, markedBy });
  }

  console.log('Writing exams...');
  const exams = [
    { examId: 1, examName: 'Mid Term 1', examType: 'Mid Term 1', className: 'Class 5', examDate: '2026-07-10' },
    { examId: 2, examName: 'Mid Term 1', examType: 'Mid Term 1', className: 'Class 6', examDate: '2026-07-10' },
    { examId: 3, examName: 'Mid Term 1', examType: 'Mid Term 1', className: 'Class 7', examDate: '2026-07-10' },
    { examId: 4, examName: 'Final Exam', examType: 'Final Exam', className: 'Class 5', examDate: '2026-11-25' },
  ];
  for (const e of exams) await db.collection(COLLECTIONS.EXAMS).doc(String(e.examId)).set(e);

  console.log('Writing exam results...');
  const results = [
    [1, 1, 1, 92, 100, 'A+'], [1, 1, 2, 78, 100, 'B'], [1, 1, 3, 85, 100, 'B+'], [1, 1, 4, 88, 100, 'B+'],
    [1, 2, 1, 67, 100, 'C'], [1, 2, 2, 74, 100, 'B'], [1, 2, 3, 81, 100, 'B+'], [1, 2, 4, 59, 100, 'C'],
  ];
  for (const [examId, studentId, subjectId, marksObtained, maxMarks, grade] of results) {
    await db.collection(COLLECTIONS.EXAM_RESULTS)
      .doc(`${examId}_${studentId}_${subjectId}`)
      .set({ examId, studentId, subjectId, marksObtained, maxMarks, grade });
  }

  console.log('Writing fee structures...');
  const feeStructures = [
    { feeStructureId: 1, className: 'Class 5', feeType: 'Tuition', amount: 2000.0, dueDate: '2026-07-05' },
    { feeStructureId: 2, className: 'Class 5', feeType: 'Transport', amount: 300.0, dueDate: '2026-07-05' },
    { feeStructureId: 3, className: 'Class 5', feeType: 'Sports', amount: 200.0, dueDate: '2026-07-05' },
    { feeStructureId: 4, className: 'Class 6', feeType: 'Tuition', amount: 2200.0, dueDate: '2026-07-05' },
    { feeStructureId: 5, className: 'Class 6', feeType: 'Transport', amount: 300.0, dueDate: '2026-07-05' },
    { feeStructureId: 6, className: 'Class 7', feeType: 'Tuition', amount: 2400.0, dueDate: '2026-07-05' },
    { feeStructureId: 7, className: 'Class 7', feeType: 'Transport', amount: 300.0, dueDate: '2026-07-05' },
  ];
  for (const f of feeStructures) await db.collection(COLLECTIONS.FEE_STRUCTURE).doc(String(f.feeStructureId)).set(f);

  console.log('Writing fee payments...');
  const payments = [
    { paymentId: 1, studentId: 1, feeStructureId: 1, amountPaid: 2000.0, paymentDate: '2026-07-01', paymentMode: 'ONLINE', status: 'PAID' },
    { paymentId: 2, studentId: 1, feeStructureId: 2, amountPaid: 300.0, paymentDate: '2026-07-01', paymentMode: 'CASH', status: 'PAID' },
    { paymentId: 3, studentId: 2, feeStructureId: 1, amountPaid: 2000.0, paymentDate: '2026-07-03', paymentMode: 'CASH', status: 'PAID' },
    { paymentId: 4, studentId: 3, feeStructureId: 4, amountPaid: 2200.0, paymentDate: '2026-07-02', paymentMode: 'ONLINE', status: 'PAID' },
    { paymentId: 5, studentId: 4, feeStructureId: 4, amountPaid: 1000.0, paymentDate: '2026-07-10', paymentMode: 'CHEQUE', status: 'PARTIAL' },
  ];
  for (const p of payments) await db.collection(COLLECTIONS.FEE_PAYMENTS).doc(String(p.paymentId)).set(p);

  console.log('Writing transport routes...');
  const routes = [
    { routeId: 1, routeName: 'Route A', vehicleNo: 'MH-12-AB-1234', driverName: 'Ram Singh', fare: 300.0 },
    { routeId: 2, routeName: 'Route B', vehicleNo: 'MH-12-CD-5678', driverName: 'Shyam Yadav', fare: 350.0 },
    { routeId: 3, routeName: 'Route C', vehicleNo: 'MH-12-EF-9012', driverName: 'Ganesh Kumar', fare: 400.0 },
  ];
  for (const r of routes) await db.collection(COLLECTIONS.TRANSPORT_ROUTES).doc(String(r.routeId)).set(r);

  console.log('Writing student transport assignments...');
  const assignments = [[1, 1], [2, 1], [3, 2], [5, 3]];
  for (const [studentId, routeId] of assignments) {
    await db.collection(COLLECTIONS.STUDENT_TRANSPORT)
      .doc(String(studentId))
      .set({ studentId, routeId });
  }

  console.log('Writing messages...');
  const messages = [
    { messageId: 1, senderId: 4, receiverId: 1, studentId: 1, subject: 'Homework query', messageBody: 'Rahul has been missing his Maths homework submissions lately.', sentAt: new Date() },
    { messageId: 2, senderId: 1, receiverId: 4, studentId: 1, subject: 'Re: Homework query', messageBody: 'Thank you, we will look into it.', sentAt: new Date() },
    { messageId: 3, senderId: 5, receiverId: 1, studentId: 3, subject: 'Bus pickup', messageBody: 'Can Arjun be picked up 10 minutes late on Wednesdays?', sentAt: new Date() },
    { messageId: 4, senderId: 2, receiverId: 5, studentId: 3, subject: 'Science project', messageBody: 'Please make sure Sneha brings her model to class on Friday.', sentAt: new Date() },
  ];
  for (const m of messages) await db.collection(COLLECTIONS.MESSAGES).doc(String(m.messageId)).set(m);

  console.log('Writing counters (for auto-increment ids)...');
  const counters = {
    users: 12,
    students: 5,
    teachers: 2,
    subjects: 12,
    exams: 4,
    fee_structures: 7,
    fee_payments: 5,
    transport_routes: 3,
    messages: 4,
  };
  for (const [name, value] of Object.entries(counters)) {
    await db.collection(COLLECTIONS.COUNTERS).doc(name).set({ value });
  }

  console.log('Done. Seed data is ready.');
  console.log('Login with: admin/admin123, teacher1/teacher123, parent1/parent123, student1/student123, Kiruthik/130706');
}

module.exports = { runSeed };

if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}