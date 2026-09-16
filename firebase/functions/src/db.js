const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const admin = require('firebase-admin');

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;
  const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (credentialPath) {
    admin.initializeApp({
      projectId,
      credential: admin.credential.cert(credentialPath),
    });
  } else {
    admin.initializeApp({ projectId });
  }
}

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

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
  SESSIONS: 'sessions',
};

module.exports = { admin, db, COLLECTIONS };