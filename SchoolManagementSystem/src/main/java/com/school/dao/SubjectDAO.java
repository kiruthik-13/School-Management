package com.school.dao;

import com.school.model.Subject;
import com.school.util.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class SubjectDAO {

    public boolean addSubject(Subject s) throws Exception {
        String sql = "INSERT INTO subjects (subject_name, class_name, teacher_id) VALUES (?,?,?)";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, s.getSubjectName());
            ps.setString(2, s.getClassName());
            if (s.getTeacherId() > 0) {
                ps.setInt(3, s.getTeacherId());
            } else {
                ps.setNull(3, java.sql.Types.INTEGER);
            }
            return ps.executeUpdate() > 0;
        }
    }

    public boolean deleteSubject(int subjectId) throws Exception {
        String sql = "DELETE FROM subjects WHERE subject_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, subjectId);
            return ps.executeUpdate() > 0;
        }
    }

    public List<Subject> getAllSubjects() throws Exception {
        String sql = "SELECT s.*, CONCAT(t.first_name, ' ', COALESCE(t.last_name, '')) AS teacher_name "
                + "FROM subjects s LEFT JOIN teachers t ON t.teacher_id = s.teacher_id ORDER BY s.class_name, s.subject_name";
        List<Subject> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(map(rs));
            }
        }
        return list;
    }

    public List<Subject> subjectsByClass(String className) throws Exception {
        String sql = "SELECT s.*, CONCAT(t.first_name, ' ', COALESCE(t.last_name, '')) AS teacher_name "
                + "FROM subjects s LEFT JOIN teachers t ON t.teacher_id = s.teacher_id WHERE s.class_name = ? ORDER BY s.subject_name";
        List<Subject> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, className);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(map(rs));
                }
            }
        }
        return list;
    }

    public Subject findById(int subjectId) throws Exception {
        String sql = "SELECT s.*, CONCAT(t.first_name, ' ', COALESCE(t.last_name, '')) AS teacher_name "
                + "FROM subjects s LEFT JOIN teachers t ON t.teacher_id = s.teacher_id WHERE s.subject_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, subjectId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return map(rs);
                }
            }
        }
        return null;
    }

    private Subject map(ResultSet rs) throws Exception {
        Subject s = new Subject();
        s.setSubjectId(rs.getInt("subject_id"));
        s.setSubjectName(rs.getString("subject_name"));
        s.setClassName(rs.getString("class_name"));
        s.setTeacherId(rs.getInt("teacher_id"));
        s.setTeacherName(rs.getString("teacher_name"));
        return s;
    }
}