package com.school.dao;

import com.school.model.Teacher;
import com.school.util.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class TeacherDAO {

    public boolean addTeacher(Teacher t) throws Exception {
        String sql = "INSERT INTO teachers (user_id, first_name, last_name, subject_specialization, phone, email, joining_date) VALUES (?,?,?,?,?,?,?)";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, t.getUserId());
            ps.setString(2, t.getFirstName());
            ps.setString(3, t.getLastName());
            ps.setString(4, t.getSubjectSpecialization());
            ps.setString(5, t.getPhone());
            ps.setString(6, t.getEmail());
            ps.setDate(7, t.getJoiningDate());
            return ps.executeUpdate() > 0;
        }
    }

    public boolean updateTeacher(Teacher t) throws Exception {
        String sql = "UPDATE teachers SET first_name=?, last_name=?, subject_specialization=?, phone=?, email=?, joining_date=? WHERE teacher_id=?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, t.getFirstName());
            ps.setString(2, t.getLastName());
            ps.setString(3, t.getSubjectSpecialization());
            ps.setString(4, t.getPhone());
            ps.setString(5, t.getEmail());
            ps.setDate(6, t.getJoiningDate());
            ps.setInt(7, t.getTeacherId());
            return ps.executeUpdate() > 0;
        }
    }

    public boolean deleteTeacher(int teacherId) throws Exception {
        String sql = "DELETE FROM teachers WHERE teacher_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, teacherId);
            return ps.executeUpdate() > 0;
        }
    }

    public List<Teacher> getAllTeachers() throws Exception {
        String sql = "SELECT t.*, u.username FROM teachers t JOIN users u ON u.user_id = t.user_id ORDER BY t.first_name";
        List<Teacher> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(map(rs));
            }
        }
        return list;
    }

    public Teacher findById(int teacherId) throws Exception {
        String sql = "SELECT t.*, u.username FROM teachers t JOIN users u ON u.user_id = t.user_id WHERE t.teacher_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, teacherId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return map(rs);
                }
            }
        }
        return null;
    }

    public Teacher findByUserId(int userId) throws Exception {
        String sql = "SELECT t.*, u.username FROM teachers t JOIN users u ON u.user_id = t.user_id WHERE t.user_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return map(rs);
                }
            }
        }
        return null;
    }

    public int count() throws Exception {
        String sql = "SELECT COUNT(*) FROM teachers";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                return rs.getInt(1);
            }
        }
        return 0;
    }

    private Teacher map(ResultSet rs) throws Exception {
        Teacher t = new Teacher();
        t.setTeacherId(rs.getInt("teacher_id"));
        t.setUserId(rs.getInt("user_id"));
        t.setUsername(rs.getString("username"));
        t.setFirstName(rs.getString("first_name"));
        t.setLastName(rs.getString("last_name"));
        t.setSubjectSpecialization(rs.getString("subject_specialization"));
        t.setPhone(rs.getString("phone"));
        t.setEmail(rs.getString("email"));
        t.setJoiningDate(rs.getDate("joining_date"));
        return t;
    }
}