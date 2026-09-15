package com.school.dao;

import com.school.model.Student;
import com.school.util.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class StudentDAO {

    public boolean addStudent(Student s) throws Exception {
        String sql = "INSERT INTO students (admission_no, first_name, last_name, dob, gender, class_name, section, parent_id, address, phone) VALUES (?,?,?,?,?,?,?,?,?,?)";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, s.getAdmissionNo());
            ps.setString(2, s.getFirstName());
            ps.setString(3, s.getLastName());
            ps.setDate(4, s.getDob());
            ps.setString(5, s.getGender());
            ps.setString(6, s.getClassName());
            ps.setString(7, s.getSection());
            if (s.getParentId() > 0) {
                ps.setInt(8, s.getParentId());
            } else {
                ps.setNull(8, java.sql.Types.INTEGER);
            }
            ps.setString(9, s.getAddress());
            ps.setString(10, s.getPhone());
            return ps.executeUpdate() > 0;
        }
    }

    public boolean updateStudent(Student s) throws Exception {
        String sql = "UPDATE students SET first_name=?, last_name=?, dob=?, gender=?, class_name=?, section=?, parent_id=?, address=?, phone=? WHERE student_id=?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, s.getFirstName());
            ps.setString(2, s.getLastName());
            ps.setDate(3, s.getDob());
            ps.setString(4, s.getGender());
            ps.setString(5, s.getClassName());
            ps.setString(6, s.getSection());
            if (s.getParentId() > 0) {
                ps.setInt(7, s.getParentId());
            } else {
                ps.setNull(7, java.sql.Types.INTEGER);
            }
            ps.setString(8, s.getAddress());
            ps.setString(9, s.getPhone());
            ps.setInt(10, s.getStudentId());
            return ps.executeUpdate() > 0;
        }
    }

    public List<Student> getAllStudents() throws Exception {
        return search(null, null, "ACTIVE");
    }

    public List<Student> getAllStudentsIncludeInactive() throws Exception {
        return search(null, null, null);
    }

    public List<Student> studentsByClass(String className, String section) throws Exception {
        return search(className, section, "ACTIVE");
    }

    public List<Student> search(String className, String section, String status) throws Exception {
        StringBuilder sql = new StringBuilder(
                "SELECT s.*, u.username AS parent_username FROM students s "
                + "LEFT JOIN users u ON u.user_id = s.parent_id WHERE 1=1");
        if (className != null && !className.trim().isEmpty()) {
            sql.append(" AND s.class_name = ?");
        }
        if (section != null && !section.trim().isEmpty()) {
            sql.append(" AND s.section = ?");
        }
        if (status != null) {
            sql.append(" AND s.status = ?");
        }
        sql.append(" ORDER BY s.class_name, s.section, s.student_id");

        List<Student> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql.toString())) {
            int i = 1;
            if (className != null && !className.trim().isEmpty()) {
                ps.setString(i++, className);
            }
            if (section != null && !section.trim().isEmpty()) {
                ps.setString(i++, section);
            }
            if (status != null) {
                ps.setString(i, status);
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(map(rs));
                }
            }
        }
        return list;
    }

    public Student findById(int id) throws Exception {
        String sql = "SELECT s.*, u.username AS parent_username FROM students s "
                + "LEFT JOIN users u ON u.user_id = s.parent_id WHERE s.student_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return map(rs);
                }
            }
        }
        return null;
    }

    public boolean deleteStudent(int id) throws Exception {
        String sql = "UPDATE students SET status = 'INACTIVE' WHERE student_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }

    public Student findByParentId(int parentId) throws Exception {
        String sql = "SELECT s.*, u.username AS parent_username FROM students s "
                + "LEFT JOIN users u ON u.user_id = s.parent_id "
                + "WHERE s.parent_id = ? AND s.status = 'ACTIVE' LIMIT 1";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, parentId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return map(rs);
                }
            }
        }
        return null;
    }

    public List<Student> findByParentIdAll(int parentId) throws Exception {
        String sql = "SELECT s.*, u.username AS parent_username FROM students s "
                + "LEFT JOIN users u ON u.user_id = s.parent_id "
                + "WHERE s.parent_id = ? AND s.status = 'ACTIVE'";
        List<Student> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, parentId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(map(rs));
                }
            }
        }
        return list;
    }

    public int countActive() throws Exception {
        String sql = "SELECT COUNT(*) FROM students WHERE status = 'ACTIVE'";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                return rs.getInt(1);
            }
        }
        return 0;
    }

    public List<Map<String, Object>> countByClass() throws Exception {
        String sql = "SELECT class_name, section, COUNT(*) AS cnt FROM students WHERE status='ACTIVE' GROUP BY class_name, section ORDER BY class_name";
        List<Map<String, Object>> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("class_name", rs.getString("class_name"));
                m.put("section", rs.getString("section"));
                m.put("count", rs.getInt("cnt"));
                list.add(m);
            }
        }
        return list;
    }

    public String generateAdmissionNo() throws Exception {
        String sql = "SELECT COUNT(*) FROM students";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            int n = 1;
            if (rs.next()) {
                n = rs.getInt(1) + 1;
            }
            return String.format("SM%03d", n);
        }
    }

    private Student map(ResultSet rs) throws Exception {
        Student s = new Student();
        s.setStudentId(rs.getInt("student_id"));
        s.setAdmissionNo(rs.getString("admission_no"));
        s.setFirstName(rs.getString("first_name"));
        s.setLastName(rs.getString("last_name"));
        s.setDob(rs.getDate("dob"));
        s.setGender(rs.getString("gender"));
        s.setClassName(rs.getString("class_name"));
        s.setSection(rs.getString("section"));
        s.setParentId(rs.getInt("parent_id"));
        s.setAddress(rs.getString("address"));
        s.setPhone(rs.getString("phone"));
        s.setAdmissionDate(rs.getDate("admission_date"));
        s.setStatus(rs.getString("status"));
        try {
            s.setParentUsername(rs.getString("parent_username"));
        } catch (Exception e) {
            s.setParentUsername(null);
        }
        return s;
    }
}