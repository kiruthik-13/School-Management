/* End-to-end smoke test: seeds Firestore, boots the Express app, and exercises
 * the main routes + CRUD flow. Intended to run under `firebase emulators:exec`.
 */
const { runSeed } = require('./seed');
const app = require('./src/index');
const { userByUsername } = require('./src/data');

let base;
let cookieHeader;

function req(path, { method = 'GET', form } = {}) {
  return fetch(base + path, {
    method,
    redirect: 'manual',
    headers: {
      ...(form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body: form ? new URLSearchParams(form).toString() : undefined,
  });
}

function assert(cond, msg) {
  if (!cond) throw new Error('ASSERT FAILED: ' + msg);
  console.log('  ok -', msg);
}

async function main() {
  let server;
  try {
    console.log('Seeding Firestore...');
    await runSeed();

    server = await new Promise((res) => {
      const s = app.listen(0, () => res(s));
    });
    base = `http://127.0.0.1:${server.address().port}`;

  let r = await req('/login');
  assert(r.status === 200, 'GET /login returns 200');

  r = await req('/login', { method: 'POST', form: { username: 'admin', password: 'admin123' } });
  assert(r.status === 302 && /\/admin$/.test(r.headers.get('location')), 'POST /login (admin) redirects to /admin');
  cookieHeader = r.headers.get('set-cookie').split(';')[0];

  r = await req('/admin');
  assert(r.status === 200 && (await r.text()).includes('Admin Dashboard'), 'GET /admin renders dashboard');

  r = await req('/students');
  assert(r.status === 200, 'GET /students returns 200');

  r = await req('/student/profile?id=1');
  assert(r.status === 200 && (await r.text()).includes('Attendance'), 'GET /student/profile renders a student profile');

  r = await req('/teachers');
  assert(r.status === 200, 'GET /teachers returns 200');

  r = await req('/subjects');
  assert(r.status === 200, 'GET /subjects returns 200');

  r = await req('/exams');
  assert(r.status === 200, 'GET /exams returns 200');

  r = await req('/marks?examId=1&className=Class+5');
  assert(r.status === 200, 'GET /marks?examId=1 returns 200');

  r = await req('/report?examId=1&studentId=1');
  assert(r.status === 200, 'GET /report renders report card');

  r = await req('/attendance?className=Class+5&section=A');
  assert(r.status === 200, 'GET /attendance returns 200');

  r = await req('/attendance/save', {
    method: 'POST',
    form: { date: '2026-09-04', className: 'Class 5', section: 'A', status_1: 'PRESENT', status_2: 'ABSENT' },
  });
  assert(r.status === 302, 'POST /attendance/save persists');

  r = await req('/fees');
  assert(r.status === 200, 'GET /fees returns 200');

  r = await req('/fees/payments');
  assert(r.status === 200, 'GET /fees/payments returns 200');

  r = await req('/transport');
  assert(r.status === 200, 'GET /transport returns 200');

  r = await req('/transport/students');
  assert(r.status === 200, 'GET /transport/students returns 200');

  r = await req('/reports');
  assert(r.status === 200, 'GET /reports returns 200');

  r = await req('/messages');
  assert(r.status === 200, 'GET /messages returns 200');

  console.log('STUDENT CRUD: create -> read -> deactivate');
  r = await req('/student/save', {
    method: 'POST',
    form: { firstName: 'Test', lastName: 'Kid', className: 'Class 5', section: 'A', dob: '2015-01-01', gender: 'M' },
  });
  assert(r.status === 302, 'POST /student/save creates a student');
  const newAdm = await (await req('/students')).text();
  assert(newAdm.includes('Test Kid'), 'new student appears on /students');

  console.log('USER CRUD: create -> login -> guards -> delete');
  r = await req('/users');
  assert(r.status === 200, 'GET /users returns 200');

  r = await req('/user/save', {
    method: 'POST',
    form: { role: 'PARENT', username: 'smoketest', fullName: 'Smoke Test', email: 'smoke@example.com', password: 'secret123', confirmPassword: 'secret123' },
  });
  assert(r.status === 302, 'POST /user/save creates a user');
  assert((await userByUsername('smoketest')) !== null, 'new user exists in Firestore');
  assert((await (await req('/users')).text()).includes('smoketest'), 'new user appears on /users');

  r = await req('/login', { method: 'POST', form: { username: 'smoketest', password: 'secret123' } });
  assert(r.status === 302 && /\/parent$/.test(r.headers.get('location')), 'new user can log in (redirects to /parent)');

  r = await req('/login', { method: 'POST', form: { username: 'admin', password: 'admin123' } });
  cookieHeader = r.headers.get('set-cookie').split(';')[0];

  const selfAdmin = await userByUsername('admin');
  r = await req('/user/delete?id=' + selfAdmin.userId);
  assert(r.status === 302 && (await userByUsername('admin')) !== null, 'self-delete of admin is blocked');

  const smoketest = await userByUsername('smoketest');
  r = await req('/user/delete?id=' + smoketest.userId);
  assert(r.status === 302 && (await userByUsername('smoketest')) === null, 'deleting a user removes the login account');
  assert(!(await (await req('/users')).text()).includes('>smoketest<'), 'deleted user no longer on /users');

  r = await req('/login', { method: 'POST', form: { username: 'teacher1@school.com', password: 'teacher123' } });
  assert(r.status === 302 && /\/teacher$/.test(r.headers.get('location')), 'login with email redirects to /teacher');

  r = await req('/forgot-password');
  assert(r.status === 200, 'GET /forgot-password renders');

  r = await req('/forgot-username');
  assert(r.status === 200, 'GET /forgot-username renders');

  r = await req('/forgot-username', { method: 'POST', form: { email: 'admin@school.com' } });
  assert(r.status === 200 && (await r.text()).includes('>admin<'), 'POST /forgot-username recovers username for admin email');

  r = await req('/login', { method: 'POST', form: { username: 'admin', password: 'admin123' } });
  cookieHeader = r.headers.get('set-cookie').split(';')[0];

  r = await req('/settings');
  assert(r.status === 200, 'GET /settings renders');

  r = await req('/settings/identity', { method: 'POST', form: { username: 'adminnew', email: 'adminnew@school.com' } });
  assert(r.status === 302, 'POST /settings/identity updates username and email');
  r = await req('/login', { method: 'POST', form: { username: 'adminnew', password: 'admin123' } });
  assert(r.status === 302 && /\/admin$/.test(r.headers.get('location')), 'login with new username works');
  cookieHeader = r.headers.get('set-cookie').split(';')[0];

  r = await req('/settings/password', { method: 'POST', form: { currentPassword: 'admin123', password: 'pass1234', confirmPassword: 'pass1234' } });
  assert(r.status === 302, 'POST /settings/password changes password');
  r = await req('/login', { method: 'POST', form: { username: 'adminnew', password: 'pass1234' } });
  assert(r.status === 302 && /\/admin$/.test(r.headers.get('location')), 'login with new password works');
  cookieHeader = r.headers.get('set-cookie').split(';')[0];

  r = await req('/forgot-password', { method: 'POST', form: { username: 'adminnew', password: 'admin123', confirmPassword: 'admin123' } });
  assert(r.status === 302, 'POST /forgot-password resets back to original password');
  r = await req('/login', { method: 'POST', form: { username: 'adminnew', password: 'admin123' } });
  assert(r.status === 302 && /\/admin$/.test(r.headers.get('location')), 'login after forgot-password reset works');
  cookieHeader = r.headers.get('set-cookie').split(';')[0];

  console.log('SMOKE TEST PASSED');
  } catch (err) {
    console.error(err.message || err);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    setTimeout(() => process.exit(process.exitCode || 0), 300);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});