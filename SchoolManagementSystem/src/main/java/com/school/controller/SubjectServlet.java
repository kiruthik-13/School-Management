package com.school.controller;

import com.school.dao.SubjectDAO;
import com.school.dao.TeacherDAO;
import com.school.model.Subject;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(urlPatterns = {"/subjects", "/subject/save", "/subject/delete"})
public class SubjectServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private final SubjectDAO subjectDAO = new SubjectDAO();
    private final TeacherDAO teacherDAO = new TeacherDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try {
            if ("/subject/delete".equals(req.getServletPath())) {
                int id = Integer.parseInt(req.getParameter("id"));
                subjectDAO.deleteSubject(id);
                resp.sendRedirect(req.getContextPath() + "/subjects");
                return;
            }
            req.setAttribute("subjects", subjectDAO.getAllSubjects());
            req.setAttribute("teachers", teacherDAO.getAllTeachers());
            req.getRequestDispatcher("/admin/subjects.jsp").forward(req, resp);
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try {
            Subject s = new Subject();
            s.setSubjectName(req.getParameter("subjectName"));
            s.setClassName(req.getParameter("className"));
            String tid = req.getParameter("teacherId");
            s.setTeacherId(tid == null || tid.isEmpty() ? 0 : Integer.parseInt(tid));
            if (s.getSubjectName() == null || s.getSubjectName().trim().isEmpty()) {
                throw new IllegalArgumentException("Subject name is required.");
            }
            subjectDAO.addSubject(s);
            resp.sendRedirect(req.getContextPath() + "/subjects");
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }
}