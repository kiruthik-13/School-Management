package com.school.dao;

import com.school.model.FeePayment;
import com.school.model.FeeStructure;
import com.school.util.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class FeeDAO {

    public boolean addFeeStructure(FeeStructure fs) throws Exception {
        String sql = "INSERT INTO fee_structure (class_name, fee_type, amount, due_date) VALUES (?,?,?,?)";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, fs.getClassName());
            ps.setString(2, fs.getFeeType());
            ps.setDouble(3, fs.getAmount());
            ps.setDate(4, fs.getDueDate());
            return ps.executeUpdate() > 0;
        }
    }

    public boolean updateFeeStructure(FeeStructure fs) throws Exception {
        String sql = "UPDATE fee_structure SET class_name=?, fee_type=?, amount=?, due_date=? WHERE fee_structure_id=?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, fs.getClassName());
            ps.setString(2, fs.getFeeType());
            ps.setDouble(3, fs.getAmount());
            ps.setDate(4, fs.getDueDate());
            ps.setInt(5, fs.getFeeStructureId());
            return ps.executeUpdate() > 0;
        }
    }

    public boolean deleteFeeStructure(int id) throws Exception {
        String sql = "DELETE FROM fee_structure WHERE fee_structure_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }

    public List<FeeStructure> getAllFeeStructures() throws Exception {
        String sql = "SELECT * FROM fee_structure ORDER BY class_name, fee_type";
        List<FeeStructure> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                FeeStructure fs = new FeeStructure();
                fs.setFeeStructureId(rs.getInt("fee_structure_id"));
                fs.setClassName(rs.getString("class_name"));
                fs.setFeeType(rs.getString("fee_type"));
                fs.setAmount(rs.getDouble("amount"));
                fs.setDueDate(rs.getDate("due_date"));
                list.add(fs);
            }
        }
        return list;
    }

    public FeeStructure findFeeStructureById(int id) throws Exception {
        for (FeeStructure fs : getAllFeeStructures()) {
            if (fs.getFeeStructureId() == id) {
                return fs;
            }
        }
        return null;
    }

    public List<FeeStructure> feeStructureByClass(String className) throws Exception {
        String sql = "SELECT * FROM fee_structure WHERE class_name = ? ORDER BY fee_type";
        List<FeeStructure> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, className);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    FeeStructure fs = new FeeStructure();
                    fs.setFeeStructureId(rs.getInt("fee_structure_id"));
                    fs.setClassName(rs.getString("class_name"));
                    fs.setFeeType(rs.getString("fee_type"));
                    fs.setAmount(rs.getDouble("amount"));
                    fs.setDueDate(rs.getDate("due_date"));
                    list.add(fs);
                }
            }
        }
        return list;
    }

    public boolean addPayment(FeePayment p) throws Exception {
        String sql = "INSERT INTO fee_payments (student_id, fee_structure_id, amount_paid, payment_mode, status) VALUES (?,?,?,?,?)";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, p.getStudentId());
            ps.setInt(2, p.getFeeStructureId());
            ps.setDouble(3, p.getAmountPaid());
            ps.setString(4, p.getPaymentMode());
            ps.setString(5, p.getStatus());
            return ps.executeUpdate() > 0;
        }
    }

    public List<FeePayment> getAllPayments() throws Exception {
        String sql = "SELECT p.*, CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) AS student_name, s.class_name, f.fee_type "
                + "FROM fee_payments p "
                + "JOIN students s ON s.student_id = p.student_id "
                + "JOIN fee_structure f ON f.fee_structure_id = p.fee_structure_id "
                + "ORDER BY p.payment_date DESC";
        List<FeePayment> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapPayment(rs));
            }
        }
        return list;
    }

    public List<FeePayment> paymentsByStudent(int studentId) throws Exception {
        String sql = "SELECT p.*, CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) AS student_name, s.class_name, f.fee_type "
                + "FROM fee_payments p "
                + "JOIN students s ON s.student_id = p.student_id "
                + "JOIN fee_structure f ON f.fee_structure_id = p.fee_structure_id "
                + "WHERE p.student_id = ? ORDER BY p.payment_date DESC";
        List<FeePayment> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapPayment(rs));
                }
            }
        }
        return list;
    }

    public List<Map<String, Object>> duesByStudent(int studentId) throws Exception {
        String sql = "SELECT fs.fee_structure_id, fs.fee_type, fs.amount, fs.due_date, "
                + "COALESCE(SUM(fp.amount_paid), 0) AS paid, "
                + "(fs.amount - COALESCE(SUM(fp.amount_paid), 0)) AS remaining "
                + "FROM fee_structure fs "
                + "LEFT JOIN fee_payments fp ON fp.fee_structure_id = fs.fee_structure_id AND fp.student_id = ? "
                + "WHERE fs.class_name = (SELECT class_name FROM students WHERE student_id = ?) "
                + "GROUP BY fs.fee_structure_id ORDER BY fs.fee_type";
        List<Map<String, Object>> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            ps.setInt(2, studentId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("fee_structure_id", rs.getInt("fee_structure_id"));
                    m.put("fee_type", rs.getString("fee_type"));
                    m.put("amount", rs.getDouble("amount"));
                    m.put("due_date", rs.getDate("due_date"));
                    m.put("paid", rs.getDouble("paid"));
                    m.put("remaining", rs.getDouble("remaining"));
                    m.put("status", rs.getDouble("remaining") <= 0 ? "PAID"
                            : rs.getDouble("paid") > 0 ? "PARTIAL" : "PENDING");
                    list.add(m);
                }
            }
        }
        return list;
    }

    public double totalCollected() throws Exception {
        String sql = "SELECT COALESCE(SUM(amount_paid), 0) FROM fee_payments";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                return rs.getDouble(1);
            }
        }
        return 0;
    }

    public List<Map<String, Object>> collectedByClass() throws Exception {
        String sql = "SELECT s.class_name, COALESCE(SUM(p.amount_paid), 0) AS total, COUNT(DISTINCT p.payment_id) AS n "
                + "FROM students s LEFT JOIN fee_payments p ON p.student_id = s.student_id "
                + "WHERE s.status = 'ACTIVE' GROUP BY s.class_name ORDER BY s.class_name";
        List<Map<String, Object>> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("class_name", rs.getString("class_name"));
                m.put("total", rs.getDouble("total"));
                m.put("count", rs.getInt("n"));
                list.add(m);
            }
        }
        return list;
    }

    private FeePayment mapPayment(ResultSet rs) throws Exception {
        FeePayment p = new FeePayment();
        p.setPaymentId(rs.getInt("payment_id"));
        p.setStudentId(rs.getInt("student_id"));
        p.setFeeStructureId(rs.getInt("fee_structure_id"));
        p.setAmountPaid(rs.getDouble("amount_paid"));
        p.setPaymentDate(rs.getDate("payment_date"));
        p.setPaymentMode(rs.getString("payment_mode"));
        p.setStatus(rs.getString("status"));
        p.setStudentName(rs.getString("student_name"));
        p.setClassName(rs.getString("class_name"));
        p.setFeeType(rs.getString("fee_type"));
        return p;
    }
}