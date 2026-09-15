package com.school.dao;

import com.school.model.TransportRoute;
import com.school.util.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class TransportDAO {

    public boolean addRoute(TransportRoute r) throws Exception {
        String sql = "INSERT INTO transport_routes (route_name, vehicle_no, driver_name, fare) VALUES (?,?,?,?)";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, r.getRouteName());
            ps.setString(2, r.getVehicleNo());
            ps.setString(3, r.getDriverName());
            ps.setDouble(4, r.getFare());
            return ps.executeUpdate() > 0;
        }
    }

    public boolean deleteRoute(int routeId) throws Exception {
        String sql = "DELETE FROM transport_routes WHERE route_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, routeId);
            return ps.executeUpdate() > 0;
        }
    }

    public List<TransportRoute> getAllRoutes() throws Exception {
        String sql = "SELECT * FROM transport_routes ORDER BY route_name";
        List<TransportRoute> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                TransportRoute r = new TransportRoute();
                r.setRouteId(rs.getInt("route_id"));
                r.setRouteName(rs.getString("route_name"));
                r.setVehicleNo(rs.getString("vehicle_no"));
                r.setDriverName(rs.getString("driver_name"));
                r.setFare(rs.getDouble("fare"));
                list.add(r);
            }
        }
        return list;
    }

    public boolean assignRoute(int studentId, int routeId) throws Exception {
        String sql = "INSERT INTO student_transport (student_id, route_id) VALUES (?,?) "
                + "ON DUPLICATE KEY UPDATE route_id = VALUES(route_id)";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            ps.setInt(2, routeId);
            return ps.executeUpdate() > 0;
        }
    }

    public boolean removeAssignment(int studentId) throws Exception {
        String sql = "DELETE FROM student_transport WHERE student_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            return ps.executeUpdate() > 0;
        }
    }

    public List<Map<String, Object>> allStudentRoutes() throws Exception {
        String sql = "SELECT s.student_id, CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) AS student_name, "
                + "s.class_name, s.section, COALESCE(r.route_name, '-') AS route_name, "
                + "COALESCE(r.vehicle_no, '-') AS vehicle_no, COALESCE(r.driver_name, '-') AS driver_name, "
                + "COALESCE(r.fare, 0) AS fare "
                + "FROM students s LEFT JOIN student_transport st ON st.student_id = s.student_id "
                + "LEFT JOIN transport_routes r ON r.route_id = st.route_id "
                + "WHERE s.status = 'ACTIVE' ORDER BY s.class_name, s.student_id";
        List<Map<String, Object>> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("student_id", rs.getInt("student_id"));
                m.put("student_name", rs.getString("student_name"));
                m.put("class_name", rs.getString("class_name"));
                m.put("section", rs.getString("section"));
                m.put("route_name", rs.getString("route_name"));
                m.put("vehicle_no", rs.getString("vehicle_no"));
                m.put("driver_name", rs.getString("driver_name"));
                m.put("fare", rs.getDouble("fare"));
                list.add(m);
            }
        }
        return list;
    }

    public Map<String, Object> transportForStudent(int studentId) throws Exception {
        String sql = "SELECT COALESCE(r.route_name, '-') AS route_name, COALESCE(r.vehicle_no, '-') AS vehicle_no, "
                + "COALESCE(r.driver_name, '-') AS driver_name, COALESCE(r.fare, 0) AS fare "
                + "FROM students s LEFT JOIN student_transport st ON st.student_id = s.student_id "
                + "LEFT JOIN transport_routes r ON r.route_id = st.route_id WHERE s.student_id = ?";
        Map<String, Object> m = new LinkedHashMap<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    m.put("route_name", rs.getString("route_name"));
                    m.put("vehicle_no", rs.getString("vehicle_no"));
                    m.put("driver_name", rs.getString("driver_name"));
                    m.put("fare", rs.getDouble("fare"));
                }
            }
        }
        return m;
    }
}