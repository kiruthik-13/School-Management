package com.school.controller;

import com.school.dao.StudentDAO;
import com.school.dao.UserDAO;
import com.school.model.Student;
import com.school.model.User;
import java.io.IOException;
import java.sql.Date;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(urlPatterns = {"/students", "/student/save", "/student/edit", "/student/delete"})
public class StudentServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private final StudentDAO studentDAO = new StudentDAO();
    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String path = req.getServletPath();
        try {
            if ("/student/delete".equals(path)) {
                int id = Integer.parseInt(req.getParameter("id"));
                studentDAO.deleteStudent(id);
                resp.sendRedirect(req.getContextPath() + "/students");
                return;
            }
            if ("/student/edit".equals(path)) {
                int id = Integer.parseInt(req.getParameter("id"));
                Student s = studentDAO.findById(id);
                if (s == null) {
                    resp.sendRedirect(req.getContextPath() + "/students");
                    return;
                }
                req.setAttribute("student", s);
                req.setAttribute("parents", userDAO.getUsersByRole("PARENT"));
                req.getRequestDispatcher("/admin/student-form.jsp").forward(req, resp);
                return;
            }
            String className = req.getParameter("className");
            String section = req.getParameter("section");
            List<Student> students = studentDAO.search(className, section, "ACTIVE");
            req.setAttribute("students", students);
            req.setAttribute("filterClass", className);
            req.setAttribute("filterSection", section);
            req.getRequestDispatcher("/admin/students.jsp").forward(req, resp);
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try {
            Student s = new Student();
            String idParam = req.getParameter("studentId");
            boolean isUpdate = idParam != null && !idParam.trim().isEmpty();
            if (isUpdate) {
                s.setStudentId(Integer.parseInt(idParam));
            } else {
                s.setAdmissionNo(studentDAO.generateAdmissionNo());
            }
            s.setFirstName(req.getParameter("firstName"));
            s.setLastName(req.getParameter("lastName"));
            s.setDob(req.getParameter("dob") == null || req.getParameter("dob").isEmpty()
                    ? null : Date.valueOf(req.getParameter("dob")));
            s.setGender(req.getParameter("gender"));
            s.setClassName(req.getParameter("className"));
            s.setSection(req.getParameter("section"));
            s.setAddress(req.getParameter("address"));
            s.setPhone(req.getParameter("phone"));

            String parentChoice = req.getParameter("parentChoice");
            if ("new".equals(parentChoice)) {
                String name = req.getParameter("newParentName");
                String email = req.getParameter("newParentEmail");
                if (name == null || email == null || name.trim().isEmpty() || email.trim().isEmpty()) {
                    throw new IllegalArgumentException("Parent name and email are required to create a new parent account.");
                }
                String username = uniqueUsername(email);
                int parentId = userDAO.createUser(username, "parent123", "PARENT", email.trim());
                s.setParentId(parentId);
            } else {
                String pid = req.getParameter("parentId");
                s.setParentId(pid == null || pid.isEmpty() ? 0 : Integer.parseInt(pid));
            }

            if (s.getFirstName() == null || s.getFirstName().trim().isEmpty()
                    || s.getClassName() == null || s.getClassName().trim().isEmpty()) {
                throw new IllegalArgumentException("First name and class are required.");
            }
            s.setStatus("ACTIVE");

            boolean ok = isUpdate ? studentDAO.updateStudent(s) : studentDAO.addStudent(s);
            resp.sendRedirect(req.getContextPath() + "/students");
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