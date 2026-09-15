package com.school.controller;

import com.school.dao.TeacherDAO;
import com.school.dao.UserDAO;
import com.school.model.Teacher;
import java.io.IOException;
import java.sql.Date;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(urlPatterns = {"/teachers", "/teacher/save", "/teacher/edit", "/teacher/delete"})
public class TeacherServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private final TeacherDAO teacherDAO = new TeacherDAO();
    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String path = req.getServletPath();
        try {
            if ("/teacher/delete".equals(path)) {
                int id = Integer.parseInt(req.getParameter("id"));
                teacherDAO.deleteTeacher(id);
                resp.sendRedirect(req.getContextPath() + "/teachers");
                return;
            }
            if ("/teacher/edit".equals(path)) {
                int id = Integer.parseInt(req.getParameter("id"));
                req.setAttribute("teacher", teacherDAO.findById(id));
                req.getRequestDispatcher("/admin/teacher-form.jsp").forward(req, resp);
                return;
            }
            List<Teacher> teachers = teacherDAO.getAllTeachers();
            req.setAttribute("teachers", teachers);
            req.getRequestDispatcher("/admin/teachers.jsp").forward(req, resp);
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try {
            Teacher t = new Teacher();
            String idParam = req.getParameter("teacherId");
            boolean isUpdate = idParam != null && !idParam.trim().isEmpty();
            if (isUpdate) {
                t.setTeacherId(Integer.parseInt(idParam));
            }
            t.setFirstName(req.getParameter("firstName"));
            t.setLastName(req.getParameter("lastName"));
            t.setSubjectSpecialization(req.getParameter("subjectSpecialization"));
            t.setPhone(req.getParameter("phone"));
            t.setEmail(req.getParameter("email"));
            t.setJoiningDate(req.getParameter("joiningDate") == null || req.getParameter("joiningDate").isEmpty()
                    ? null : Date.valueOf(req.getParameter("joiningDate")));

            if (t.getFirstName() == null || t.getFirstName().trim().isEmpty()) {
                throw new IllegalArgumentException("First name is required.");
            }

            if (isUpdate) {
                teacherDAO.updateTeacher(t);
            } else {
                if (t.getEmail() == null || t.getEmail().trim().isEmpty()) {
                    throw new IllegalArgumentException("Email is required to create the login account.");
                }
                String username = uniqueUsername(t.getEmail());
                int userId = userDAO.createUser(username, "teacher123", "TEACHER", t.getEmail().trim());
                t.setUserId(userId);
                teacherDAO.addTeacher(t);
            }
            resp.sendRedirect(req.getContextPath() + "/teachers");
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }

    private String uniqueUsername(String email) throws Exception {
        String base = email.split("@")[0].toLowerCase().replaceAll("[^a-z0-9]", "");
        if (base.isEmpty()) {
            base = "user";
        }
        String username = base;
        int n = 1;
        while (userDAO.usernameExists(username)) {
            username = base + (n++);
        }
        return username;
    }
}