package com.school.dao;

import com.school.model.ExamResult;
import com.school.util.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class ExamResultDAO {

    public void saveResult(ExamResult r) throws Exception {
        String sql = "INSERT INTO exam_results (exam_id, student_id, subject_id, marks_obtained, max_marks, grade) "
                + "VALUES (?,?,?,?,?,?) "
                + "ON DUPLICATE KEY UPDATE marks_obtained = VALUES(marks_obtained), max_marks = VALUES(max_marks), grade = VALUES(grade)";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, r.getExamId());
            ps.setInt(2, r.getStudentId());
            ps.setInt(3, r.getSubjectId());
            ps.setDouble(4, r.getMarksObtained());
            ps.setDouble(5, r.getMaxMarks());
            ps.setString(6, r.getGrade());
            ps.executeUpdate();
        }
    }

    public List<ExamResult> resultsByExam(int examId) throws Exception {
        String sql = "SELECT r.*, CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) AS student_name, su.subject_name "
                + "FROM exam_results r "
                + "JOIN students s ON s.student_id = r.student_id "
                + "JOIN subjects su ON su.subject_id = r.subject_id "
                + "WHERE r.exam_id = ? ORDER BY s.student_id, su.subject_id";
        List<ExamResult> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, examId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(map(rs));
                }
            }
        }
        return list;
    }

    public List<ExamResult> resultsByExamStudent(int examId, int studentId) throws Exception {
        String sql = "SELECT r.*, CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) AS student_name, su.subject_name "
                + "FROM exam_results r "
                + "JOIN students s ON s.student_id = r.student_id "
                + "JOIN subjects su ON su.subject_id = r.subject_id "
                + "WHERE r.exam_id = ? AND r.student_id = ? ORDER BY su.subject_id";
        List<ExamResult> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, examId);
            ps.setInt(2, studentId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(map(rs));
                }
            }
        }
        return list;
    }

    public List<ExamResult> resultsByStudent(int studentId) throws Exception {
        String sql = "SELECT r.*, CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) AS student_name, su.subject_name, e.exam_name "
                + "FROM exam_results r "
                + "JOIN students s ON s.student_id = r.student_id "
                + "JOIN subjects su ON su.subject_id = r.subject_id "
                + "JOIN exams e ON e.exam_id = r.exam_id "
                + "WHERE r.student_id = ? ORDER BY e.exam_date DESC, su.subject_id";
        List<ExamResult> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(map(rs));
                }
            }
        }
        return list;
    }

    public boolean deleteByExam(int examId) throws Exception {
        String sql = "DELETE FROM exam_results WHERE exam_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, examId);
            ps.executeUpdate();
        }
        return true;
    }

    public static String gradeFor(double marks, double maxMarks) {
        if (maxMarks <= 0) {
            return "-";
        }
        double pct = (marks / maxMarks) * 100.0;
        if (pct >= 90) {
            return "A+";
        } else if (pct >= 80) {
            return "A";
        } else if (pct >= 70) {
            return "B+";
        } else if (pct >= 60) {
            return "B";
        } else if (pct >= 50) {
            return "C";
        } else if (pct >= 40) {
            return "D";
        } else {
            return "F";
        }
    }

    private ExamResult map(ResultSet rs) throws Exception {
        ExamResult r = new ExamResult();
        r.setResultId(rs.getInt("result_id"));
        r.setExamId(rs.getInt("exam_id"));
        r.setStudentId(rs.getInt("student_id"));
        r.setSubjectId(rs.getInt("subject_id"));
        r.setMarksObtained(rs.getDouble("marks_obtained"));
        r.setMaxMarks(rs.getDouble("max_marks"));
        r.setGrade(rs.getString("grade"));
        try {
            r.setStudentName(rs.getString("student_name"));
        } catch (Exception e) {
            r.setStudentName(null);
        }
        try {
            r.setSubjectName(rs.getString("subject_name"));
        } catch (Exception e) {
            r.setSubjectName(null);
        }
        try {
            r.setExamName(rs.getString("exam_name"));
        } catch (Exception e) {
            r.setExamName(null);
        }
        return r;
    }
}