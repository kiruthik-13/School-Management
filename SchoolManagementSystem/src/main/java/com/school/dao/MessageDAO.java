package com.school.dao;

import com.school.model.Message;
import com.school.util.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class MessageDAO {

    public boolean send(Message m) throws Exception {
        String sql = "INSERT INTO messages (sender_id, receiver_id, student_id, subject, message_body) VALUES (?,?,?,?,?)";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, m.getSenderId());
            ps.setInt(2, m.getReceiverId());
            if (m.getStudentId() > 0) {
                ps.setInt(3, m.getStudentId());
            } else {
                ps.setNull(3, java.sql.Types.INTEGER);
            }
            ps.setString(4, m.getSubject());
            ps.setString(5, m.getMessageBody());
            return ps.executeUpdate() > 0;
        }
    }

    public List<Message> conversation(int userId) throws Exception {
        String sql = "SELECT m.*, "
                + "u.username AS sender_name, "
                + "u.role AS sender_role, "
                + "CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) AS student_name "
                + "FROM messages m "
                + "LEFT JOIN users u ON u.user_id = m.sender_id "
                + "LEFT JOIN students s ON s.student_id = m.student_id "
                + "WHERE m.sender_id = ? OR m.receiver_id = ? "
                + "ORDER BY m.sent_at DESC";
        List<Message> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, userId);
            ps.setInt(2, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(map(rs));
                }
            }
        }
        return list;
    }

    public List<Message> allMessages() throws Exception {
        String sql = "SELECT m.*, "
                + "u.username AS sender_name, "
                + "u.role AS sender_role, "
                + "CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) AS student_name "
                + "FROM messages m "
                + "LEFT JOIN users u ON u.user_id = m.sender_id "
                + "LEFT JOIN students s ON s.student_id = m.student_id "
                + "ORDER BY m.sent_at DESC";
        List<Message> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(map(rs));
            }
        }
        return list;
    }

    private Message map(ResultSet rs) throws Exception {
        Message m = new Message();
        m.setMessageId(rs.getInt("message_id"));
        m.setSenderId(rs.getInt("sender_id"));
        m.setReceiverId(rs.getInt("receiver_id"));
        m.setStudentId(rs.getInt("student_id"));
        m.setSubject(rs.getString("subject"));
        m.setMessageBody(rs.getString("message_body"));
        m.setSentAt(rs.getTimestamp("sent_at"));
        m.setSenderName(rs.getString("sender_name"));
        m.setSenderRole(rs.getString("sender_role"));
        m.setStudentName(rs.getString("student_name"));
        return m;
    }
}