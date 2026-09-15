# School Management System

A JSP/Servlet (MVC) web application for digitizing school administration:
admissions, students, teachers, attendance, examinations, fees, transport,
and parent communication.

## Tech Stack

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

## Project Layout

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

## Setup

### 1. Create the database

Edit `database/schema.sql` if needed, then run:

```bash
mysql -u root -p -P 8090 < database/schema.sql
```

(Change `8090` to your MySQL port. The schema uses `DROP DATABASE IF EXISTS` so it
re-creates the DB from scratch. Passwords are PBKDF2 hashes so `users.password`
contains no plain text.)

### 2. Configure DB credentials

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

### 3. Build & run

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

### 4. Login

| Role    | Username | Password    |
|---------|----------|-------------|
| Admin   | admin    | admin123    |
| Teacher | teacher1 | teacher123  |
| Parent  | parent1  | parent123   |

## Modules

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

## Notes for Extension

- To add PDF receipts/report cards, add `itextpdf` dependency and a report servlet.
- BCrypt can replace `PasswordUtil` (PBKDF2-with-HMAC-SHA1) if a library is added.
- The `attendance` table maps `marked_by` to `teachers.teacher_id` (null for admin).
- All SQL uses `PreparedStatement`; `AuthFilter` enforces a role matrix over **every**
  module servlet and view path (admin-only CRUD for students/teachers/subjects/exams/
  fees/payments/transport/reports, teacher+admin for attendance/marks/report card,
  any logged-in user for messages). Anonymous users are redirected to `/login`.
- `exam_results` has a `UNIQUE KEY (exam_id, student_id, subject_id)` so re-saving a
  report card updates the existing row instead of inserting a duplicate.

## End-to-end verification

The application was built and smoke-tested against a live Tomcat + MySQL deployment:

- All admin/teacher/parent pages return 200 with expected data (students, subjects,
  exams, marks grid, report card, fees, payments, transport, reports, messages).
- Security matrix verified: anonymous → redirect to login; wrong-role access → 403.
- Write flows verified end-to-end (student/teacher/subject/exam/fee/payment/route/
  assignment/message/marks POSTs all persist in MySQL).
- Marks re-save updates the existing row (no duplicate), grades auto-computed.
- Attendance POST saves and class-summary badges render; parent portal shows child
  marks/dues with transport route.