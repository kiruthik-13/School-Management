const { db, COLLECTIONS } = require('./db');
const { nextId, gradeFor, uniqueUsername: cleanUsername } = require('./util');

function day(dateLike) {
  if (!dateLike) return null;
  if (typeof dateLike === 'string') return dateLike.slice(0, 10);
  if (dateLike.toDate) return dateLike.toDate().toISOString().slice(0, 10);
  if (dateLike instanceof Date) return dateLike.toISOString().slice(0, 10);
  return String(dateLike).slice(0, 10);
}

function fullName(d) {
  return `${d.firstName || ''}${d.lastName ? ' ' + d.lastName : ''}`.trim();
}

function money(n) {
  if (n === null || n === undefined || isNaN(n)) return 0;
  return Math.round(n * 100) / 100;
}

async function allDocs(collection) {
  const snap = await db.collection(collection).orderBy('__name__').get();
  return snap.docs.map((d) => Object.assign({ id: d.id }, d.data()));
}

async function getDoc(collection, id) {
  const snap = await db.collection(collection).doc(String(id)).get();
  return snap.exists ? Object.assign({ id: snap.id }, snap.data()) : null;
}

async function setDoc(collection, id, data) {
  await db.collection(collection).doc(String(id)).set(data, { merge: true });
  return data;
}

async function delDoc(collection, id) {
  await db.collection(collection).doc(String(id)).delete();
}

/* ------------------------------ Users ------------------------------ */

async function userById(id) {
  return getDoc(COLLECTIONS.USERS, id);
}

async function userByUsername(username) {
  const snap = await db.collection(COLLECTIONS.USERS)
    .where('username', '==', username).limit(1).get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return Object.assign({ id: d.id }, d.data());
}

async function userByUsernameOrEmail(identifier) {
  const u = await userByUsername(identifier);
  if (u) return u;
  const needle = String(identifier || '').trim().toLowerCase();
  if (!needle) return null;
  const all = await allDocs(COLLECTIONS.USERS);
  return all.find((x) => String(x.email || '').trim().toLowerCase() === needle) || null;
}

async function authenticate(username, password) {
  const { verifyPassword } = require('./util');
  const u = await userByUsernameOrEmail(username);
  if (u && verifyPassword(password, u.password)) return u;
  return null;
}

async function usernameExists(username) {
  return (await userByUsername(username)) !== null;
}

async function uniqueUsernameFor(email) {
  const base = cleanUsername(email);
  let username = base;
  let n = 1;
  while (await usernameExists(username)) {
    username = base + (n++);
  }
  return username;
}

async function createUser(username, password, role, email, fullName) {
  const { hashPassword } = require('./util');
  const userId = await nextId(COLLECTIONS.USERS);
  const data = {
    userId,
    username,
    password: hashPassword(password),
    role,
    email: email || null,
    fullName: fullName || null,
    createdAt: new Date(),
  };
  await setDoc(COLLECTIONS.USERS, userId, data);
  return userId;
}

async function usersByRole(role) {
  const all = await allDocs(COLLECTIONS.USERS);
  return all
    .filter((u) => u.role === role)
    .sort((a, b) => String(a.username).localeCompare(String(b.username)));
}

async function allUsers() {
  const all = await allDocs(COLLECTIONS.USERS);
  const teachers = new Map(
    (await allDocs(COLLECTIONS.TEACHERS)).map((t) => [String(t.userId), t])
  );
  const students = new Map(
    (await allDocs(COLLECTIONS.STUDENTS)).map((s) => [String(s.parentId), s])
  );
  const studentsByUid = new Map(
    (await allDocs(COLLECTIONS.STUDENTS)).filter((s) => s.userId).map((s) => [String(s.userId), s])
  );
  return all
    .sort((a, b) =>
      String(a.role).localeCompare(String(b.role)) ||
      String(a.username).localeCompare(String(b.username))
    )
    .map((u) => {
      u.fullName = u.fullName || fullName(u);
      const t = teachers.get(String(u.userId));
      u.linkedName = t ? fullName(t) : null;
      const child = students.get(String(u.userId));
      if (!u.linkedName && child) u.linkedName = 'Parent of ' + fullName(child);
      const self = studentsByUid.get(String(u.userId));
      if (!u.linkedName && self) u.linkedName = fullName(self);
      return u;
    });
}

async function resetPassword(userId, password) {
  const { hashPassword } = require('./util');
  const u = await userById(userId);
  if (!u) throw new Error('User not found.');
  await setDoc(COLLECTIONS.USERS, userId, { password: hashPassword(password) });
  return u;
}

async function deleteUser(userId) {
  if (userId === null || userId === undefined) return false;
  const u = await userById(userId);
  if (!u) return false;
  await delDoc(COLLECTIONS.USERS, userId);
  return u;
}

async function updateUserProfile(userId, { username, email }) {
  const u = await userById(userId);
  if (!u) throw new Error('User not found.');
  const name = String(username || '').trim();
  if (!name) throw new Error('Username is required.');
  const all = await allDocs(COLLECTIONS.USERS);
  const nameTaken = all.some((x) =>
    String(x.userId) !== String(userId) &&
    String(x.username).toLowerCase() === name.toLowerCase()
  );
  if (nameTaken) throw new Error('That username is already taken.');
  const mail = String(email || '').trim();
  if (mail) {
    const mailTaken = all.some((x) =>
      String(x.userId) !== String(userId) &&
      String(x.email || '').trim().toLowerCase() === mail.toLowerCase()
    );
    if (mailTaken) throw new Error('That email is already in use.');
  }
  const data = { username: name, email: mail || null };
  await setDoc(COLLECTIONS.USERS, userId, data);
  return Object.assign({}, u, data);
}

async function usersByEmail(email) {
  const needle = String(email || '').trim().toLowerCase();
  if (!needle) return [];
  const all = await allDocs(COLLECTIONS.USERS);
  return all
    .filter((x) => String(x.email || '').trim().toLowerCase() === needle)
    .map((x) => ({ userId: x.userId, username: x.username, role: x.role, fullName: x.fullName }));
}

/* ----------------------------- Students ---------------------------- */

async function studentsSearch({ className, section, status } = {}) {
  const all = await allDocs(COLLECTIONS.STUDENTS);
  const list = all
    .filter((s) => !className || s.className === className)
    .filter((s) => !section || s.section === section)
    .filter((s) => !status || s.status === status)
    .sort((a, b) =>
      String(a.className).localeCompare(String(b.className)) ||
      String(a.section).localeCompare(String(b.section)) ||
      Number(a.studentId) - Number(b.studentId)
    );
  const parents = await usersByRole('PARENT');
  const byId = new Map(parents.map((p) => [String(p.userId), p]));
  return list.map((s) => {
    s.fullName = fullName(s);
    const p = byId.get(String(s.parentId));
    s.parentUsername = p ? p.username : null;
    return s;
  });
}

async function studentsByClass(className, section) {
  return studentsSearch({ className, section, status: 'ACTIVE' });
}

async function allActiveStudents() {
  return studentsSearch({ status: 'ACTIVE' });
}

async function studentById(id) {
  const s = await getDoc(COLLECTIONS.STUDENTS, id);
  if (!s) return null;
  s.fullName = fullName(s);
  return s;
}

async function studentsByParent(parentId) {
  const all = await allDocs(COLLECTIONS.STUDENTS);
  return all
    .filter((s) => s.status === 'ACTIVE' && Number(s.parentId) === Number(parentId))
    .map((s) => {
      s.fullName = fullName(s);
      return s;
    });
}

async function studentByUserId(userId) {
  const all = await allDocs(COLLECTIONS.STUDENTS);
  const s = all.find((x) => x.status === 'ACTIVE' && Number(x.userId) === Number(userId));
  if (!s) return null;
  s.fullName = fullName(s);
  return s;
}

async function generatedAdmissionNo() {
  const all = await allDocs(COLLECTIONS.STUDENTS);
  const n = all.length + 1;
  return 'SM' + String(n).padStart(3, '0');
}

async function countByClass() {
  const all = await allDocs(COLLECTIONS.STUDENTS);
  const groups = new Map();
  for (const s of all) {
    const key = `${s.className}||${s.section || ''}`;
    if (s.status === 'ACTIVE') {
      groups.set(key, (groups.get(key) || 0) + 1);
    }
  }
  return [...groups.entries()]
    .map(([key, count]) => {
      const [className, section] = key.split('||');
      return { className, section, count };
    })
    .sort((a, b) => String(a.className).localeCompare(String(b.className)));
}

async function saveStudent(data) {
  if (data.studentId) {
    await setDoc(COLLECTIONS.STUDENTS, data.studentId, data);
    return data.studentId;
  }
  const studentId = await nextId(COLLECTIONS.STUDENTS);
  data.studentId = studentId;
  await setDoc(COLLECTIONS.STUDENTS, studentId, data);
  return studentId;
}

async function deactivateStudent(id) {
  const s = await studentById(id);
  if (s) await setDoc(COLLECTIONS.STUDENTS, id, Object.assign({}, s, { status: 'INACTIVE' }));
}

/* ----------------------------- Teachers ---------------------------- */

async function allTeachers() {
  const all = await allDocs(COLLECTIONS.TEACHERS);
  const users = new Map((await allDocs(COLLECTIONS.USERS)).map((u) => [String(u.userId), u]));
  return all
    .sort((a, b) => String(a.firstName).localeCompare(String(b.firstName)))
    .map((t) => {
      t.fullName = fullName(t);
      const u = users.get(String(t.userId));
      t.username = u ? u.username : null;
      return t;
    });
}

async function teacherById(id) {
  const t = await getDoc(COLLECTIONS.TEACHERS, id);
  if (!t) return null;
  t.fullName = fullName(t);
  return t;
}

async function teacherByUserId(userId) {
  const snap = await db.collection(COLLECTIONS.TEACHERS)
    .where('userId', '==', Number(userId)).limit(1).get();
  if (snap.empty) return null;
  const t = Object.assign({ id: snap.docs[0].id }, snap.docs[0].data());
  t.fullName = fullName(t);
  return t;
}

async function countTeachers() {
  const snap = await db.collection(COLLECTIONS.TEACHERS).get();
  return snap.size;
}

async function saveTeacher(data) {
  if (data.teacherId) {
    await setDoc(COLLECTIONS.TEACHERS, data.teacherId, data);
    return data.teacherId;
  }
  const teacherId = await nextId(COLLECTIONS.TEACHERS);
  data.teacherId = teacherId;
  await setDoc(COLLECTIONS.TEACHERS, teacherId, data);
  return teacherId;
}

async function deleteTeacher(id) {
  const t = await teacherById(id);
  if (!t) return;
  await delDoc(COLLECTIONS.TEACHERS, id);
  if (t.userId) await delDoc(COLLECTIONS.USERS, t.userId);
}

/* ----------------------------- Subjects ---------------------------- */

async function subjectsWithTeacher(className) {
  const all = await allDocs(COLLECTIONS.SUBJECTS);
  const teachers = new Map((await allDocs(COLLECTIONS.TEACHERS)).map((t) => [String(t.teacherId), t]));
  const list = all
    .filter((s) => !className || s.className === className)
    .sort((a, b) =>
      String(a.className).localeCompare(String(b.className)) ||
      String(a.subjectName).localeCompare(String(b.subjectName))
    )
    .map((s) => {
      const t = teachers.get(String(s.teacherId));
      s.teacherName = t ? fullName(t) : null;
      return s;
    });
  return list;
}

async function saveSubject(data) {
  const subjectId = data.subjectId || (await nextId(COLLECTIONS.SUBJECTS));
  data.subjectId = subjectId;
  await setDoc(COLLECTIONS.SUBJECTS, subjectId, data);
  return subjectId;
}

async function deleteSubject(id) {
  await delDoc(COLLECTIONS.SUBJECTS, id);
}

/* ----------------------------- Exams ------------------------------- */

async function allExams() {
  const all = await allDocs(COLLECTIONS.EXAMS);
  return all.sort((a, b) =>
    String(b.examDate || '').localeCompare(String(a.examDate || '')) ||
    Number(a.examId) - Number(b.examId)
  );
}

async function examById(id) {
  return getDoc(COLLECTIONS.EXAMS, id);
}

async function saveExam(data) {
  const examId = data.examId || (await nextId(COLLECTIONS.EXAMS));
  data.examId = examId;
  await setDoc(COLLECTIONS.EXAMS, examId, data);
  return examId;
}

async function deleteExam(id) {
  await delDoc(COLLECTIONS.EXAMS, id);
}

/* --------------------------- Exam results -------------------------- */

function resultKey(examId, studentId, subjectId) {
  return `${examId}_${studentId}_${subjectId}`;
}

async function saveResult(examId, studentId, subjectId, marks, maxMarks) {
  const data = {
    examId: Number(examId),
    studentId: Number(studentId),
    subjectId: Number(subjectId),
    marksObtained: money(marks),
    maxMarks: money(maxMarks),
    grade: gradeFor(Number(marks), Number(maxMarks)),
  };
  await db.collection(COLLECTIONS.EXAM_RESULTS).doc(resultKey(examId, studentId, subjectId)).set(data);
  return data;
}

async function resultsByExam(examId) {
  const snap = await db.collection(COLLECTIONS.EXAM_RESULTS)
    .where('examId', '==', Number(examId)).get();
  const students = new Map((await allDocs(COLLECTIONS.STUDENTS)).map((s) => [String(s.studentId), s]));
  const subjects = new Map((await allDocs(COLLECTIONS.SUBJECTS)).map((s) => [String(s.subjectId), s]));
  return snap.docs
    .map((d) => Object.assign({ id: d.id }, d.data()))
    .sort((a, b) => Number(a.studentId) - Number(b.studentId) || Number(a.subjectId) - Number(b.subjectId))
    .map((r) => {
      const st = students.get(String(r.studentId));
      const su = subjects.get(String(r.subjectId));
      r.studentName = st ? fullName(st) : null;
      r.subjectName = su ? su.subjectName : null;
      return r;
    });
}

async function resultsByExamStudent(examId, studentId) {
  const snap = await db.collection(COLLECTIONS.EXAM_RESULTS)
    .where('examId', '==', Number(examId))
    .where('studentId', '==', Number(studentId))
    .get();
  const students = new Map((await allDocs(COLLECTIONS.STUDENTS)).map((s) => [String(s.studentId), s]));
  const subjects = new Map((await allDocs(COLLECTIONS.SUBJECTS)).map((s) => [String(s.subjectId), s]));
  return snap.docs
    .map((d) => Object.assign({ id: d.id }, d.data()))
    .sort((a, b) => Number(a.subjectId) - Number(b.subjectId))
    .map((r) => {
      const st = students.get(String(r.studentId));
      const su = subjects.get(String(r.subjectId));
      r.studentName = st ? fullName(st) : null;
      r.subjectName = su ? su.subjectName : null;
      return r;
    });
}

async function resultsByStudent(studentId) {
  const snap = await db.collection(COLLECTIONS.EXAM_RESULTS)
    .where('studentId', '==', Number(studentId)).get();
  const subjects = new Map((await allDocs(COLLECTIONS.SUBJECTS)).map((s) => [String(s.subjectId), s]));
  const exams = new Map((await allDocs(COLLECTIONS.EXAMS)).map((e) => [String(e.examId), e]));
  return snap.docs
    .map((d) => Object.assign({ id: d.id }, d.data()))
    .sort((a, b) => {
      const da = exams.get(String(a.examId)).examDate || '';
      const dbx = exams.get(String(b.examId)).examDate || '';
      return String(dbx).localeCompare(String(da)) || Number(a.subjectId) - Number(b.subjectId);
    })
    .map((r) => {
      const su = subjects.get(String(r.subjectId));
      const e = exams.get(String(r.examId));
      r.subjectName = su ? su.subjectName : null;
      r.examName = e ? e.examName : null;
      return r;
    });
}

async function deleteResultsByExam(examId) {
  const snap = await db.collection(COLLECTIONS.EXAM_RESULTS)
    .where('examId', '==', Number(examId)).get();
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

/* ---------------------------- Attendance --------------------------- */

async function attendanceByClassDate(className, section, date) {
  const students = await studentsByClass(className, section);
  const ids = students.map((s) => Number(s.studentId));
  const records = await attendanceForDate(date);
  const byStudent = new Map(records.map((r) => [Number(r.studentId), r]));
  return students.map((s) => {
    const r = byStudent.get(Number(s.studentId));
    return r ? Object.assign({}, r, { studentName: s.fullName }) : {
      studentId: s.studentId,
      attendanceDate: date,
      status: null,
      markedBy: 0,
      studentName: s.fullName,
    };
  });
}

async function attendanceForDate(date) {
  const snap = await db.collection(COLLECTIONS.ATTENDANCE)
    .where('attendanceDate', '==', date).get();
  return snap.docs.map((d) => Object.assign({ id: d.id }, d.data()));
}

async function attendanceByStudent(studentId) {
  const snap = await db.collection(COLLECTIONS.ATTENDANCE)
    .where('studentId', '==', Number(studentId))
    .orderBy('attendanceDate', 'desc')
    .get();
  const students = new Map((await allDocs(COLLECTIONS.STUDENTS)).map((s) => [String(s.studentId), s]));
  return snap.docs.map((d) => {
    const r = Object.assign({ id: d.id }, d.data());
    const st = students.get(String(studentId));
    r.studentName = st ? fullName(st) : null;
    return r;
  });
}

async function saveAttendance(records) {
  const batch = db.batch();
  for (const r of records) {
    const ref = db.collection(COLLECTIONS.ATTENDANCE)
      .doc(`${r.studentId}_${r.attendanceDate}`);
    batch.set(ref, {
      studentId: Number(r.studentId),
      attendanceDate: r.attendanceDate,
      status: r.status,
      markedBy: Number(r.markedBy) || 0,
    });
  }
  await batch.commit();
}

async function countByStatusOnDate(status, date) {
  const records = await attendanceForDate(date);
  return records.filter((r) => r.status === status).length;
}

async function attendanceStatsByStudent(studentId) {
  const records = await attendanceByStudent(studentId);
  const total = records.length;
  const present = records.filter((r) => r.status === 'PRESENT').length;
  const absent = records.filter((r) => r.status === 'ABSENT').length;
  const leave = total - present - absent;
  return {
    total,
    present,
    absent,
    leave,
    percentage: total === 0 ? 0 : Math.round((present / total) * 100),
  };
}

async function attendanceSummaryByClass(className, section, date) {
  const records = await attendanceByClassDate(className, section, date);
  const map = new Map();
  for (const r of records) {
    if (r.status) map.set(r.status, (map.get(r.status) || 0) + 1);
  }
  return [...map.entries()].map(([status, count]) => ({ status, count }));
}

/* ------------------------------ Fees ------------------------------- */

async function allFeeStructures() {
  const all = await allDocs(COLLECTIONS.FEE_STRUCTURE);
  return all.sort((a, b) =>
    String(a.className).localeCompare(String(b.className)) ||
    String(a.feeType).localeCompare(String(b.feeType))
  );
}

async function feeStructureById(id) {
  return getDoc(COLLECTIONS.FEE_STRUCTURE, id);
}

async function feeStructuresByClass(className) {
  const all = await allFeeStructures();
  return all.filter((f) => f.className === className);
}

async function saveFeeStructure(data) {
  const id = data.feeStructureId || (await nextId(COLLECTIONS.FEE_STRUCTURE));
  data.feeStructureId = id;
  await setDoc(COLLECTIONS.FEE_STRUCTURE, id, data);
  return id;
}

async function deleteFeeStructure(id) {
  await delDoc(COLLECTIONS.FEE_STRUCTURE, id);
}

async function paymentsByStudent(studentId) {
  const snap = await db.collection(COLLECTIONS.FEE_PAYMENTS)
    .where('studentId', '==', Number(studentId))
    .orderBy('paymentDate', 'desc')
    .get();
  return decoratePayments(snap.docs.map((d) => Object.assign({ id: d.id }, d.data())));
}

async function allPayments() {
  const all = await allDocs(COLLECTIONS.FEE_PAYMENTS);
  return decoratePayments(all.sort((a, b) => String(b.paymentDate).localeCompare(String(a.paymentDate))));
}

async function decoratePayments(payments) {
  const students = new Map((await allDocs(COLLECTIONS.STUDENTS)).map((s) => [String(s.studentId), s]));
  const fees = new Map((await allDocs(COLLECTIONS.FEE_STRUCTURE)).map((f) => [String(f.feeStructureId), f]));
  return payments.map((p) => {
    const st = students.get(String(p.studentId));
    const f = fees.get(String(p.feeStructureId));
    p.studentName = st ? fullName(st) : null;
    p.className = st ? st.className : null;
    p.feeType = f ? f.feeType : null;
    return p;
  });
}

async function savePayment(data) {
  const paymentId = data.paymentId || (await nextId(COLLECTIONS.FEE_PAYMENTS));
  data.paymentId = paymentId;
  await setDoc(COLLECTIONS.FEE_PAYMENTS, paymentId, data);
  return paymentId;
}

async function duesByStudent(studentId) {
  const student = await studentById(studentId);
  if (!student) return [];
  const structures = await feeStructuresByClass(student.className);
  const payments = await paymentsByStudent(studentId);
  const paidByFee = new Map();
  for (const p of payments) {
    const key = String(p.feeStructureId);
    paidByFee.set(key, money((paidByFee.get(key) || 0) + Number(p.amountPaid)));
  }
  return structures
    .sort((a, b) => String(a.feeType).localeCompare(String(b.feeType)))
    .map((f) => {
      const paid = money(paidByFee.get(String(f.feeStructureId)) || 0);
      const remaining = money(Number(f.amount) - paid);
      const status = remaining <= 0 ? 'PAID' : paid > 0 ? 'PARTIAL' : 'PENDING';
      return {
        feeStructureId: f.feeStructureId,
        feeType: f.feeType,
        amount: Number(f.amount),
        dueDate: f.dueDate || null,
        paid,
        remaining,
        status,
      };
    });
}

async function totalCollected() {
  const all = await allDocs(COLLECTIONS.FEE_PAYMENTS);
  return money(all.reduce((sum, p) => sum + Number(p.amountPaid || 0), 0));
}

async function collectedByClass() {
  const payments = await allPayments();
  const map = new Map();
  for (const p of payments) {
    const key = p.className || 'Unknown';
    map.set(key, {
      className: key,
      total: money((map.get(key) ? map.get(key).total : 0) + Number(p.amountPaid || 0)),
      count: (map.get(key) ? map.get(key).count : 0) + 1,
    });
  }
  return [...map.values()].sort((a, b) => String(a.className).localeCompare(String(b.className)));
}

/* ---------------------------- Transport ---------------------------- */

async function allRoutes() {
  const all = await allDocs(COLLECTIONS.TRANSPORT_ROUTES);
  return all.sort((a, b) => String(a.routeName).localeCompare(String(b.routeName)));
}

async function saveRoute(data) {
  const routeId = data.routeId || (await nextId(COLLECTIONS.TRANSPORT_ROUTES));
  data.routeId = routeId;
  await setDoc(COLLECTIONS.TRANSPORT_ROUTES, routeId, data);
  return routeId;
}

async function assignRoute(studentId, routeId) {
  await setDoc(COLLECTIONS.STUDENT_TRANSPORT, studentId, {
    studentId: Number(studentId),
    routeId: Number(routeId),
  });
}

async function removeAssignment(studentId) {
  await delDoc(COLLECTIONS.STUDENT_TRANSPORT, studentId);
}

async function allStudentRoutes() {
  const students = await allActiveStudents();
  const routes = new Map((await allRoutes()).map((r) => [String(r.routeId), r]));
  const assignments = new Map(
    (await allDocs(COLLECTIONS.STUDENT_TRANSPORT)).map((a) => [String(a.studentId), a])
  );
  return students
    .sort((a, b) =>
      String(a.className).localeCompare(String(b.className)) ||
      Number(a.studentId) - Number(b.studentId)
    )
    .map((s) => {
      const a = assignments.get(String(s.studentId));
      const r = a ? routes.get(String(a.routeId)) : null;
      return {
        studentId: s.studentId,
        studentName: s.fullName,
        className: s.className,
        section: s.section || '',
        routeName: r ? r.routeName : '-',
        vehicleNo: r ? r.vehicleNo : '-',
        driverName: r ? r.driverName : '-',
        fare: r ? Number(r.fare) : 0,
      };
    });
}

async function transportForStudent(studentId) {
  const a = await getDoc(COLLECTIONS.STUDENT_TRANSPORT, studentId);
  if (!a) return { routeName: '-', vehicleNo: '-', driverName: '-', fare: 0 };
  const r = await getDoc(COLLECTIONS.TRANSPORT_ROUTES, a.routeId);
  if (!r) return { routeName: '-', vehicleNo: '-', driverName: '-', fare: 0 };
  return {
    routeName: r.routeName || '-',
    vehicleNo: r.vehicleNo || '-',
    driverName: r.driverName || '-',
    fare: Number(r.fare || 0),
  };
}

/* ---------------------------- Messages ----------------------------- */

async function sendMessage(data) {
  const messageId = await nextId(COLLECTIONS.MESSAGES);
  const doc = {
    messageId,
    senderId: Number(data.senderId),
    receiverId: Number(data.receiverId),
    studentId: data.studentId ? Number(data.studentId) : 0,
    subject: data.subject,
    messageBody: data.messageBody,
    sentAt: new Date(),
  };
  await setDoc(COLLECTIONS.MESSAGES, messageId, doc);
  return messageId;
}

async function decorateMessages(list) {
  const users = new Map((await allDocs(COLLECTIONS.USERS)).map((u) => [String(u.userId), u]));
  const students = new Map((await allDocs(COLLECTIONS.STUDENTS)).map((s) => [String(s.studentId), s]));
  return list.map((m) => {
    const sender = users.get(String(m.senderId));
    const st = students.get(String(m.studentId));
    m.senderName = sender ? sender.username : 'Unknown';
    m.senderRole = sender ? sender.role : '';
    m.studentName = st ? fullName(st) : null;
    return m;
  });
}

async function conversation(userId) {
  const all = await allDocs(COLLECTIONS.MESSAGES);
  const mine = all.filter((m) =>
    Number(m.senderId) === Number(userId) || Number(m.receiverId) === Number(userId)
  );
  return decorateMessages(mine.sort((a, b) => b.sentAt - a.sentAt));
}

async function allMessages() {
  const all = await allDocs(COLLECTIONS.MESSAGES);
  return decorateMessages(all.sort((a, b) => b.sentAt - a.sentAt));
}

module.exports = {
  day,
  fullName,
  money,
  userById,
  userByUsername,
  authenticate,
  usernameExists,
  uniqueUsernameFor,
  createUser,
  usersByRole,
  userByUsernameOrEmail,
  allUsers,
  resetPassword,
  deleteUser,
  updateUserProfile,
  usersByEmail,
  studentsSearch,
  studentsByClass,
  allActiveStudents,
  studentById,
  studentsByParent,
  studentByUserId,
  generatedAdmissionNo,
  countByClass,
  saveStudent,
  deactivateStudent,
  allTeachers,
  teacherById,
  teacherByUserId,
  countTeachers,
  saveTeacher,
  deleteTeacher,
  subjectsWithTeacher,
  saveSubject,
  deleteSubject,
  allExams,
  examById,
  saveExam,
  deleteExam,
  saveResult,
  resultsByExam,
  resultsByExamStudent,
  resultsByStudent,
  deleteResultsByExam,
  attendanceByClassDate,
  attendanceForDate,
  attendanceByStudent,
  saveAttendance,
  countByStatusOnDate,
  attendanceStatsByStudent,
  attendanceSummaryByClass,
  allFeeStructures,
  feeStructureById,
  feeStructuresByClass,
  saveFeeStructure,
  deleteFeeStructure,
  paymentsByStudent,
  allPayments,
  savePayment,
  duesByStudent,
  totalCollected,
  collectedByClass,
  allRoutes,
  saveRoute,
  assignRoute,
  removeAssignment,
  allStudentRoutes,
  transportForStudent,
  sendMessage,
  conversation,
  allMessages,
};