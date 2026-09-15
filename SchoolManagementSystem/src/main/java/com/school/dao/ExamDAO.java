package com.school.dao;

import com.school.model.Exam;
import com.school.util.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class ExamDAO {

    public boolean addExam(Exam e) throws Exception {
        String sql = "INSERT INTO exams (exam_name, class_name, exam_date) VALUES (?,?,?)";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, e.getExamName());
            ps.setString(2, e.getClassName());
            ps.setDate(3, e.getExamDate());
            return ps.executeUpdate() > 0;
        }
    }

    public boolean deleteExam(int examId) throws Exception {
        String sql = "DELETE FROM exams WHERE exam_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, examId);
            return ps.executeUpdate() > 0;
        }
    }

    public List<Exam> getAllExams() throws Exception {
        String sql = "SELECT * FROM exams ORDER BY exam_date DESC, exam_id";
        List<Exam> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(map(rs));
            }
        }
        return list;
    }

    public Exam findById(int examId) throws Exception {
        String sql = "SELECT * FROM exams WHERE exam_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, examId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return map(rs);
                }
            }
        }
        return null;
    }

    private Exam map(ResultSet rs) throws Exception {
        Exam e = new Exam();
        e.setExamId(rs.getInt("exam_id"));
        e.setExamName(rs.getString("exam_name"));
        e.setClassName(rs.getString("class_name"));
        e.setExamDate(rs.getDate("exam_date"));
        return e;
    }
}