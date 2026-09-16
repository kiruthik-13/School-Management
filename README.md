# School Management System

A school administration web app for admissions, students, teachers, attendance,
examinations, fees, transport, and parent communication.

There are two implementations in this repo:

| App | Location | Stack | Status |
|-----|----------|-------|--------|
| **Firebase/Firestore** | `firebase/` | Node.js 20 + Express + EJS + Firestore (NoSQL) | Active, smoke-tested |
| **Java/MySQL (legacy)** | `SchoolManagementSystem/` | JSP/Servlet + JDBC + MySQL 8 | Kept for reference |

The Firebase app replaces the Java + MySQL stack with Firestore (NoSQL) and the
Firebase emulator suite for local development.

---

## Firebase / Firestore app

### Layout

```
firebase/
├── firebase.json           emulator ports, functions, hosting, rules, indexes
├── firestore.rules         security rules (dev-open; tighten for production)
├── firestore.indexes.json  composite indexes
├── public/                 static hosting
└── functions/
    ├── src/
    │   ├── index.js        Express app + session + route mounting
    │   ├── db.js           env-driven Firestore connection
    │   ├── data.js         Firestore CRUD/data layer (all queries live here)
    │   ├── util.js         CLASSES/SECTIONS/PAYMENT_MODES, hashing, counters
    │   ├── session-store.js express-session backed by Firestore
    │   ├── middleware.js   loadUser + requireAuth (role gate)
    │   ├── routes/         auth, dashboard, students, teachers, subjects,
    │   │                   exams, attendance, results, fees, transport, messages, reports
    │   └── views/          EJS templates + partials
    ├── seed.js             wipes + reseeds all demo data (npm run seed)
    ├── smoke-test.js       end-to-end route/CRUD smoke test
    └── .env.example        copy to .env with your real credentials
```

### Setup

1. Install the Firebase CLI (requires Java for the emulators):
   ```bash
   npm i -g firebase-tools
   ```
2. Install dependencies and create your env file:
   ```bash
   cd firebase/functions
   npm install
   copy .env.example .env       # then fill in real values when you have them
   cd ..
   ```
3. Configure `firebase/.firebaserc` with your project ID (default `demo-school`
   runs fully in emulators without any Google credentials).

### Start everything locally (no credentials needed)

```bash
cd firebase
firebase emulators:start      # functions :5001 | hosting :5000 | auth :9099 | ui :4000
```

Open http://localhost:5000 or http://localhost:5001.

### Seed the database (only the Firestore emulator needs to be running)

```bash
cd firebase
firebase emulators:exec --only firestore "npm --prefix functions run seed"
```

Or, if the emulators are already running:

```bash
cd firebase/functions
set FIRESTORE_EMULATOR_HOST=127.0.0.1:8085
npm run seed
```

### Run the smoke test

```bash
cd firebase/functions
set FIRESTORE_EMULATOR_HOST=127.0.0.1:8085
npm test
```

The smoke test re-seeds Firestore, boots the Express app, and verifies all main
routes + a student create/read flow return correctly.

### Verify route imports

```bash
cd firebase
node check-imports.js
```

### Demo logins (seeded by `seed.js`)

| Role    | Username | Password    |
|---------|----------|-------------|
| Admin   | admin    | admin123    |
| Teacher | teacher1 | teacher123  |
| Parent  | parent1  | parent123   |

### Environment variables (`firebase/functions/.env`)

| Var | Required? | Notes |
|-----|-----------|-------|
| `FIREBASE_PROJECT_ID` | for prod | empty → uses `demo-school` emulator |
| `GOOGLE_APPLICATION_CREDENTIALS` | for prod | path to service-account JSON |
| `FIREBASE_EMULATOR` | optional | set `1` to force emulator mode |
| `SESSION_SECRET` | optional | defaults to `school-demo-secret` |
| `PORT` | optional | functions emulator uses its own port |

### Data model (Firestore collections)

Users, Students, Teachers, Subjects, Attendance, Exams, ExamResults, FeeStructures,
FeePayments, TransportRoutes, StudentTransport, Messages, Sessions, Counters.
Auto-increment IDs are maintained in the `Counters` collection so IDs stay in sync
with the original MySQL schema.

---

## Java / MySQL app (legacy, kept for reference)

### Tech Stack

| Layer          | Technology                                   |
|----------------|----------------------------------------------|
| Language       | Java 8 (JDK 8+)                              |
| Web Server     | Apache Tomcat 9.x                            |
| Presentation   | JSP + JSTL + Bootstrap 5 + Chart.js (CDN)    |
| Business Logic | Servlets (Controllers)                       |
| Data Access    | JDBC / DAO pattern (`PreparedStatement`)     |
| Database       | MySQL 8.0                                    |
| Build          | Maven (bundled with NetBeans)                |
| Security       | PBKDF2 password hashing + `AuthFilter` roles |

> **Compatibility note:** this project targets **JDK 8 + Tomcat 9** and therefore uses
> the `javax.servlet.*` API (Servlet 4.0), NOT Jakarta. Do not deploy on Tomcat 10+
> without converting imports to `jakarta.*`.

### Project Layout

```
SchoolManagementSystem/
└── src/main/
    ├── java/com/school/
    │   ├── model/        POJOs (Student, Teacher, User, ExamResult, ...)
    │   ├── dao/          JDBC DAOs (one per module)
    │   ├── controller/   Servlets (login, dashboards, module CRUD)
    │   ├── filter/       AuthFilter (role-based) + encoding filter
    │   └── util/         DBConnection, PasswordUtil, Constants
    └── webapp/
        ├── index.jsp, login.jsp, error.jsp
        ├── WEB-INF/web.xml, WEB-INF/includes/*.jspf
        ├── admin/        Admin views
        ├── teacher/      Teacher views
        └── parent/       Parent portal views
database/schema.sql       Full schema + seed data
```

### Java app setup

#### 1. Create the database

Edit `database/schema.sql` if needed, then run:

```bash
mysql -u root -p -P 8090 < database/schema.sql
```

(Change `8090` to your MySQL port. The schema uses `DROP DATABASE IF EXISTS` so it
re-creates the DB from scratch. Passwords are PBKDF2 hashes so `users.password`
contains no plain text.)

#### 2. Configure DB credentials

Edit `src/main/java/com/school/util/DBConnection.java`:

```java
private static final String HOST = "localhost";
private static final String PORT = "8090";   // your MySQL port
private static final String USER = "root";
private static final String PASS = "root";   // your MySQL password
```

Or override at runtime without editing code (JVM system properties):
`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`.
E.g. deploy with `JAVA_OPTS="-DDB_PORT=3306 -DDB_PASS=secret"`.

#### 3. Build & run

**Option A - NetBeans (recommended):**
1. File > Open Project > select the `SchoolManagementSystem` folder.
2. Register your Tomcat 9 server in NetBeans (Services > Servers).
3. Right-click project > Run. Maven resolves `javax.servlet-api`, `jstl`,
   and `mysql-connector-java` automatically.

**Option B - Maven CLI:**
```bash
mvn clean package
mvn tomcat7:run -Dmaven.tomcat.port=8099     # embedded quick run
```
Then open http://localhost:8099/school

#### 4. Login

| Role    | Username | Password    |
|---------|----------|-------------|
| Admin   | admin    | admin123    |
| Teacher | teacher1 | teacher123  |
| Parent  | parent1  | parent123   |

### Java app modules

| Module       | Admin | Teacher | Parent |
|--------------|-------|---------|--------|
| Admission/Students | CRUD, search, parent-link | - | - |
| Teachers          | CRUD + auto login account | - | - |
| Class & Subjects  | Assign subjects to teachers | view | - |
| Attendance        | Mark/view + summary      | mark today | view child's |
| Examination       | Schedule exams           | enter marks | view grades |
| Report Card       | Auto grades, print       | view       | - |
| Fees              | Structure + payments     | -          | view dues |
| Transport         | Routes + assignments     | -          | view route |
| Messages          | Compose/inbox            | compose/inbox | compose/inbox |

Default passwords for auto-created accounts: parent `parent123`, teacher `teacher123`.

### Java app notes for extension

- To add PDF receipts/report cards, add `itextpdf` dependency and a report servlet.
- BCrypt can replace `PasswordUtil` (PBKDF2-with-HMAC-SHA1) if a library is added.
- The `attendance` table maps `marked_by` to `teachers.teacher_id` (null for admin).
- All SQL uses `PreparedStatement`; `AuthFilter` enforces a role matrix over **every**
  module servlet and view path (admin-only CRUD for students/teachers/subjects/exams/
  fees/payments/transport/reports, teacher+admin for attendance/marks/report card,
  any logged-in user for messages). Anonymous users are redirected to `/login`.
- `exam_results` has a `UNIQUE KEY (exam_id, student_id, subject_id)` so re-saving a
  report card updates the existing row instead of inserting a duplicate.