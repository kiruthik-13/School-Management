package com.school.controller;

import com.school.dao.UserDAO;
import com.school.model.User;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        User user = (session == null) ? null : (User) session.getAttribute("user");
        if (user != null) {
            resp.sendRedirect(req.getContextPath() + "/" + home(user.getRole()));
            return;
        }
        if ("success".equals(req.getParameter("logout"))) {
            req.setAttribute("info", "You have been logged out.");
        }
        req.getRequestDispatcher("/login.jsp").forward(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String username = req.getParameter("username");
        String password = req.getParameter("password");

        try {
            User user = userDAO.authenticate(username, password);
            if (user == null) {
                req.setAttribute("error", "Invalid username or password.");
                req.getRequestDispatcher("/login.jsp").forward(req, resp);
                return;
            }
            HttpSession session = req.getSession(true);
            session.setAttribute("user", user);
            resp.sendRedirect(req.getContextPath() + "/" + home(user.getRole()));
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }

    public static String home(String role) {
        switch (role) {
            case "ADMIN":
                return "admin";
            case "TEACHER":
                return "teacher";
            case "PARENT":
                return "parent";
            default:
                return "login";
        }
    }
}