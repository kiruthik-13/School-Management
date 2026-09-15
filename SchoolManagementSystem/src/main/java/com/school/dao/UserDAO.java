package com.school.dao;

import com.school.model.User;
import com.school.util.DBConnection;
import com.school.util.PasswordUtil;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class UserDAO {

    public User authenticate(String username, String password) throws Exception {
        User user = findByUsername(username);
        if (user != null && PasswordUtil.verifyPassword(password, user.getPassword())) {
            return user;
        }
        return null;
    }

    public User findByUsername(String username) throws Exception {
        String sql = "SELECT user_id, username, password, role, email FROM users WHERE username = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, username);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return map(rs);
                }
            }
        }
        return null;
    }

    public User findById(int userId) throws Exception {
        String sql = "SELECT user_id, username, password, role, email FROM users WHERE user_id = ?";
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

    public int createUser(String username, String password, String role, String email) throws Exception {
        String sql = "INSERT INTO users (username, password, role, email) VALUES (?,?,?,?)";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, username);
            ps.setString(2, PasswordUtil.hashPassword(password));
            ps.setString(3, role);
            ps.setString(4, email);
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }
        return 0;
    }

    public List<User> getUsersByRole(String role) throws Exception {
        String sql = "SELECT user_id, username, password, role, email FROM users WHERE role = ? ORDER BY username";
        List<User> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, role);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(map(rs));
                }
            }
        }
        return list;
    }

    public boolean usernameExists(String username) throws Exception {
        return findByUsername(username) != null;
    }

    private User map(ResultSet rs) throws Exception {
        User u = new User();
        u.setUserId(rs.getInt("user_id"));
        u.setUsername(rs.getString("username"));
        u.setPassword(rs.getString("password"));
        u.setRole(rs.getString("role"));
        u.setEmail(rs.getString("email"));
        return u;
    }
}