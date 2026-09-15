package com.school.util;

import java.sql.Connection;
import java.sql.DriverManager;

public class DBConnection {

    private static final String HOST = prop("DB_HOST", "localhost");
    private static final String PORT = prop("DB_PORT", "8090");
    private static final String DB   = prop("DB_NAME", "school_management");
    private static final String URL  = "jdbc:mysql://" + HOST + ":" + PORT + "/"
            + DB + "?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
    private static final String USER = prop("DB_USER", "root");
    private static final String PASS = prop("DB_PASS", "root");

    private static String prop(String key, String dflt) {
        String v = System.getProperty(key);
        return v == null ? dflt : v;
    }

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new ExceptionInInitializerError(e);
        }
    }

    public static Connection getConnection() throws Exception {
        return DriverManager.getConnection(URL, USER, PASS);
    }
}