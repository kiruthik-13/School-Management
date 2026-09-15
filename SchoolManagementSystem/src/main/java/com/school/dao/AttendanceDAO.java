package com.school.dao;

import com.school.model.Attendance;
import com.school.util.DBConnection;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class AttendanceDAO {

    public void saveRecords(List<Attendance> records) throws Exception {
        String sql = "INSERT INTO attendance (student_id, attendance_date, status, marked_by) VALUES (?,?,?,?) "
                + "ON DUPLICATE KEY UPDATE status = VALUES(status), marked_by = VALUES(marked_by)";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            for (Attendance a : records) {
                ps.setInt(1, a.getStudentId());
                ps.setDate(2, a.getAttendanceDate());
                ps.setString(3, a.getStatus());
                if (a.getMarkedBy() > 0) {
                    ps.setInt(4, a.getMarkedBy());
                } else {
                    ps.setNull(4, java.sql.Types.INTEGER);
                }
                ps.addBatch();
            }
            ps.executeBatch();
        }
    }

    public List<Attendance> getByClassDate(String className, String section, Date date) throws Exception {
        String sql = "SELECT a.*, CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) AS student_name "
                + "FROM attendance a JOIN students s ON s.student_id = a.student_id "
                + "WHERE s.class_name = ? AND s.section = ? AND a.attendance_date = ? "
                + "ORDER BY s.student_id";
        List<Attendance> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, className);
            ps.setString(2, section);
            ps.setDate(3, date);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(map(rs));
                }
            }
        }
        return list;
    }

    public List<Attendance> getByStudent(int studentId) throws Exception {
        String sql = "SELECT a.*, CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) AS student_name "
                + "FROM attendance a JOIN students s ON s.student_id = a.student_id "
                + "WHERE a.student_id = ? ORDER BY a.attendance_date DESC";
        List<Attendance> list = new ArrayList<>();
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

    public int countByStatusOnDate(String status, Date date) throws Exception {
        String sql = "SELECT COUNT(*) FROM attendance WHERE status = ? AND attendance_date = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setDate(2, date);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }
        return 0;
    }

    public Map<String, Object> statsByStudent(int studentId) throws Exception {
        String sql = "SELECT COUNT(*) AS total, SUM(status='PRESENT') AS present, SUM(status='ABSENT') AS absent "
                + "FROM attendance WHERE student_id = ?";
        Map<String, Object> stats = new LinkedHashMap<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    int total = rs.getInt("total");
                    int present = rs.getInt("present");
                    int absent = rs.getInt("absent");
                    stats.put("total", total);
                    stats.put("present", present);
                    stats.put("absent", absent);
                    stats.put("leave", total - present - absent);
                    stats.put("percentage", total == 0 ? 0 : Math.round(((double) present / total) * 100.0));
                }
            }
        }
        return stats;
    }

    public List<Map<String, Object>> attendanceSummaryByClass(String className, String section, Date date) throws Exception {
        String sql = "SELECT a.status, COUNT(*) AS cnt FROM attendance a JOIN students s ON s.student_id = a.student_id "
                + "WHERE s.class_name = ? AND s.section = ? AND a.attendance_date = ? GROUP BY a.status";
        List<Map<String, Object>> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, className);
            ps.setString(2, section);
            ps.setDate(3, date);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("status", rs.getString("status"));
                    m.put("count", rs.getInt("cnt"));
                    list.add(m);
                }
            }
        }
        return list;
    }

    private Attendance map(ResultSet rs) throws Exception {
        Attendance a = new Attendance();
        a.setAttendanceId(rs.getInt("attendance_id"));
        a.setStudentId(rs.getInt("student_id"));
        a.setStudentName(rs.getString("student_name"));
        a.setAttendanceDate(rs.getDate("attendance_date"));
        a.setStatus(rs.getString("status"));
        a.setMarkedBy(rs.getInt("marked_by"));
        return a;
    }
}