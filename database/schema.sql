-- =====================================================================
-- School Management System - MySQL 8 schema + seed data
-- Import:  mysql -u root -p -P 8090 < schema.sql
-- Note:    change the port if your MySQL runs on 3306.
-- =====================================================================

DROP DATABASE IF EXISTS school_management;
CREATE DATABASE school_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE school_management;

-- ---------------------------------------------------------------------
-- Users & Roles (login for Admin/Teacher/Parent)
-- Passwords are PBKDF2 hashes (iterations$salt$hash). Seeds:
--   admin    / admin123
--   teacher1 / teacher123
--   parent1  / parent123   (xxxx = 1..3)
-- ---------------------------------------------------------------------
CREATE TABLE users (
    user_id    INT AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(50) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,
    role       ENUM('ADMIN','TEACHER','PARENT') NOT NULL,
    email      VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admission / Student
CREATE TABLE students (
    student_id     INT AUTO_INCREMENT PRIMARY KEY,
    admission_no   VARCHAR(20) UNIQUE NOT NULL,
    first_name     VARCHAR(50) NOT NULL,
    last_name      VARCHAR(50),
    dob            DATE,
    gender         ENUM('M','F','O'),
    class_name     VARCHAR(20),
    section        VARCHAR(10),
    parent_id      INT,
    address        VARCHAR(255),
    phone          VARCHAR(15),
    admission_date DATE DEFAULT (CURRENT_DATE),
    status         ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
    FOREIGN KEY (parent_id) REFERENCES users(user_id)
);
CREATE INDEX idx_students_class ON students(class_name, section);
CREATE INDEX idx_students_status ON students(status);

-- Teacher
CREATE TABLE teachers (
    teacher_id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id              INT,
    first_name           VARCHAR(50) NOT NULL,
    last_name            VARCHAR(50),
    subject_specialization VARCHAR(100),
    phone                VARCHAR(15),
    email                VARCHAR(100),
    joining_date         DATE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
CREATE INDEX idx_teachers_user ON teachers(user_id);

-- Class/Subject mapping
CREATE TABLE subjects (
    subject_id  INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(50) NOT NULL,
    class_name  VARCHAR(20),
    teacher_id  INT,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id)
);
CREATE INDEX idx_subjects_class ON subjects(class_name);

-- Attendance
CREATE TABLE attendance (
    attendance_id  INT AUTO_INCREMENT PRIMARY KEY,
    student_id     INT NOT NULL,
    attendance_date DATE NOT NULL,
    status         ENUM('PRESENT','ABSENT','LEAVE') NOT NULL,
    marked_by      INT,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (marked_by)  REFERENCES teachers(teacher_id),
    UNIQUE KEY uq_attendance (student_id, attendance_date)
);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);

-- Examination
CREATE TABLE exams (
    exam_id   INT AUTO_INCREMENT PRIMARY KEY,
    exam_name VARCHAR(50) NOT NULL,
    class_name VARCHAR(20),
    exam_date DATE
);

CREATE TABLE exam_results (
    result_id      INT AUTO_INCREMENT PRIMARY KEY,
    exam_id        INT NOT NULL,
    student_id     INT NOT NULL,
    subject_id     INT NOT NULL,
    marks_obtained DECIMAL(5,2),
    max_marks      DECIMAL(5,2) DEFAULT 100,
    grade          VARCHAR(5),
    FOREIGN KEY (exam_id)    REFERENCES exams(exam_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
    UNIQUE KEY uq_result (exam_id, student_id, subject_id)
);
CREATE INDEX idx_result_exam ON exam_results(exam_id, student_id);

-- Fees
CREATE TABLE fee_structure (
    fee_structure_id INT AUTO_INCREMENT PRIMARY KEY,
    class_name       VARCHAR(20),
    fee_type         VARCHAR(50),
    amount           DECIMAL(10,2),
    due_date         DATE
);

CREATE TABLE fee_payments (
    payment_id       INT AUTO_INCREMENT PRIMARY KEY,
    student_id       INT NOT NULL,
    fee_structure_id INT NOT NULL,
    amount_paid      DECIMAL(10,2),
    payment_date     DATE DEFAULT (CURRENT_DATE),
    payment_mode     ENUM('CASH','ONLINE','CHEQUE'),
    status           ENUM('PAID','PARTIAL','PENDING') DEFAULT 'PENDING',
    FOREIGN KEY (student_id)       REFERENCES students(student_id),
    FOREIGN KEY (fee_structure_id) REFERENCES fee_structure(fee_structure_id)
);
CREATE INDEX idx_payments_student ON fee_payments(student_id);

-- Transport
CREATE TABLE transport_routes (
    route_id   INT AUTO_INCREMENT PRIMARY KEY,
    route_name VARCHAR(50),
    vehicle_no VARCHAR(20),
    driver_name VARCHAR(50),
    fare       DECIMAL(8,2)
);

CREATE TABLE student_transport (
    student_id INT PRIMARY KEY,
    route_id   INT,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (route_id)   REFERENCES transport_routes(route_id)
);

-- Parent-Teacher communication
CREATE TABLE messages (
    message_id  INT AUTO_INCREMENT PRIMARY KEY,
    sender_id   INT NOT NULL,
    receiver_id INT NOT NULL,
    student_id  INT,
    subject     VARCHAR(100),
    message_body TEXT,
    sent_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id)   REFERENCES users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES users(user_id),
    FOREIGN KEY (student_id)  REFERENCES students(student_id)
);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);

-- =====================================================================
-- SEED DATA
-- =====================================================================
INSERT INTO users (user_id, username, password, role, email) VALUES
(1, 'admin',    '10000$B95DEB37B337558760AFFC37D62F8CC3$53E40C0CF81F0485CAB3A694FC663B54B1CB7090784826F04351770980EFFDF5', 'ADMIN',   'admin@school.com'),
(2, 'teacher1', '10000$137D6CF8E012EBD30764E75E29B4B21E$7A8C8EE185CD53FCDD0E413CB01389879A4A0BE08B33E2B946B2A449F69BB121', 'TEACHER', 'teacher1@school.com'),
(3, 'teacher2', '10000$6B4C64131CF00CD49B1C4ADCAAA4894E$304331EFEDF0EBD6FE35887E830F86340DD978A4E054BFA628D27A40B688121A', 'TEACHER', 'teacher2@school.com'),
(4, 'parent1',  '10000$4B211B30EA2949DFD306201961DF683A$DA6D7389438FDCBF7425B67AEAFB1B9BFEF33CB824A8CD0225FF9D5941E6751C', 'PARENT',  'parent1@example.com'),
(5, 'parent2',  '10000$79E38F4EF3CBA1FAA9BB73F649AC8E5E$9F9880BFB76819F94C017AF8851498080E9564E443EAEF0303025490BD212ACE', 'PARENT',  'parent2@example.com'),
(6, 'parent3',  '10000$EC6C6CDFB98339E6047C7C583EE52950$1A3EA2938BFA098306C6F2C94E6F540F2C44FF88511BEDAA0C7EA75F5E00D99C', 'PARENT',  'parent3@example.com');

INSERT INTO students (student_id, admission_no, first_name, last_name, dob, gender, class_name, section, parent_id, address, phone, admission_date, status) VALUES
(1, 'SM001', 'Rahul',  'Sharma', '2014-05-12', 'M', 'Class 5', 'A', 4, '12 MG Road, Pune',  '9812345001', '2023-06-01', 'ACTIVE'),
(2, 'SM002', 'Priya',  'Verma',  '2014-08-23', 'F', 'Class 5', 'A', 4, '12 MG Road, Pune',  '9812345001', '2023-06-01', 'ACTIVE'),
(3, 'SM003', 'Arjun',  'Mehta',  '2013-01-30', 'M', 'Class 6', 'B', 5, '45 FC Road, Pune',  '9822345002', '2022-06-01', 'ACTIVE'),
(4, 'SM004', 'Sneha',  'Patil',  '2013-11-17', 'F', 'Class 6', 'B', 5, '45 FC Road, Pune',  '9822345002', '2022-06-01', 'ACTIVE'),
(5, 'SM005', 'Vikram', 'Singh',  '2012-03-05', 'M', 'Class 7', 'A', 6, '78 Baner Road, Pune','9832345003', '2021-06-01', 'ACTIVE');

INSERT INTO teachers (teacher_id, user_id, first_name, last_name, subject_specialization, phone, email, joining_date) VALUES
(1, 2, 'Anita',   'Deshpande', 'Mathematics', '9844044001', 'teacher1@school.com', '2020-04-15'),
(2, 3, 'Rajesh',  'Kulkarni',  'Science',     '9844044002', 'teacher2@school.com', '2019-08-01');

INSERT INTO subjects (subject_name, class_name, teacher_id) VALUES
('Mathematics',   'Class 5', 1),
('Science',       'Class 5', 1),
('English',       'Class 5', 1),
('Social Science','Class 5', 1),
('Mathematics',   'Class 6', 2),
('Science',       'Class 6', 2),
('English',       'Class 6', 2),
('Social Science','Class 6', 2),
('Mathematics',   'Class 7', 1),
('Science',       'Class 7', 2),
('English',       'Class 7', 1),
('Social Science','Class 7', 2);

INSERT INTO attendance (student_id, attendance_date, status, marked_by) VALUES
(1, '2026-09-01', 'PRESENT', 1), (2, '2026-09-01', 'PRESENT', 1),
(3, '2026-09-01', 'ABSENT',  2), (4, '2026-09-01', 'PRESENT', 2),
(5, '2026-09-01', 'PRESENT', 1),
(1, '2026-09-02', 'PRESENT', 1), (2, '2026-09-02', 'LEAVE',   1),
(3, '2026-09-02', 'PRESENT', 2), (4, '2026-09-02', 'PRESENT', 2),
(5, '2026-09-02', 'ABSENT',  1),
(1, '2026-09-03', 'PRESENT', 1), (2, '2026-09-03', 'PRESENT', 1),
(3, '2026-09-03', 'PRESENT', 2), (4, '2026-09-03', 'ABSENT',  2),
(5, '2026-09-03', 'PRESENT', 1);

INSERT INTO exams (exam_name, class_name, exam_date) VALUES
('Mid Term 1', 'Class 5', '2026-07-10'),
('Mid Term 1', 'Class 6', '2026-07-10'),
('Mid Term 1', 'Class 7', '2026-07-10'),
('Final Exam', 'Class 5', '2026-11-25');

INSERT INTO exam_results (exam_id, student_id, subject_id, marks_obtained, max_marks, grade) VALUES
(1, 1, 1, 92, 100, 'A+'), (1, 1, 2, 78, 100, 'B'),
(1, 1, 3, 85, 100, 'B+'), (1, 1, 4, 88, 100, 'B+'),
(1, 2, 1, 67, 100, 'C+'), (1, 2, 2, 74, 100, 'B'),
(1, 2, 3, 81, 100, 'B+'), (1, 2, 4, 59, 100, 'C');

INSERT INTO fee_structure (class_name, fee_type, amount, due_date) VALUES
('Class 5', 'Tuition',      2000.00, '2026-07-05'),
('Class 5', 'Transport',     300.00, '2026-07-05'),
('Class 5', 'Sports',        200.00, '2026-07-05'),
('Class 6', 'Tuition',      2200.00, '2026-07-05'),
('Class 6', 'Transport',     300.00, '2026-07-05'),
('Class 7', 'Tuition',      2400.00, '2026-07-05'),
('Class 7', 'Transport',     300.00, '2026-07-05');

INSERT INTO fee_payments (student_id, fee_structure_id, amount_paid, payment_date, payment_mode, status) VALUES
(1, 1, 2000.00, '2026-07-01', 'ONLINE', 'PAID'),
(1, 2,  300.00, '2026-07-01', 'CASH',   'PAID'),
(2, 1, 2000.00, '2026-07-03', 'CASH',   'PAID'),
(3, 4, 2200.00, '2026-07-02', 'ONLINE', 'PAID'),
(4, 4, 1000.00, '2026-07-10', 'CHEQUE', 'PARTIAL');

INSERT INTO transport_routes (route_name, vehicle_no, driver_name, fare) VALUES
('Route A', 'MH-12-AB-1234', 'Ram Singh',    300.00),
('Route B', 'MH-12-CD-5678', 'Shyam Yadav',  350.00),
('Route C', 'MH-12-EF-9012', 'Ganesh Kumar', 400.00);

INSERT INTO student_transport (student_id, route_id) VALUES
(1, 1), (2, 1), (3, 2), (5, 3);

INSERT INTO messages (sender_id, receiver_id, student_id, subject, message_body) VALUES
(4, 1, 1, 'Homework query', 'Rahul has been missing his Maths homework submissions lately.'),
(1, 4, 1, 'Re: Homework query', 'Thank you, we will look into it.'),
(5, 1, 3, 'Bus pickup', 'Can Arjun be picked up 10 minutes late on Wednesdays?'),
(2, 5, 3, 'Science project', 'Please make sure Sneha brings her model to class on Friday.');