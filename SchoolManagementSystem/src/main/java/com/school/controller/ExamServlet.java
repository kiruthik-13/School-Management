package com.school.controller;

import com.school.dao.ExamDAO;
import com.school.dao.ExamResultDAO;
import com.school.model.Exam;
import java.io.IOException;
import java.sql.Date;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(urlPatterns = {"/exams", "/exam/save", "/exam/delete"})
public class ExamServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private final ExamDAO examDAO = new ExamDAO();
    private final ExamResultDAO examResultDAO = new ExamResultDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try {
            if ("/exam/delete".equals(req.getServletPath())) {
                int id = Integer.parseInt(req.getParameter("id"));
                examResultDAO.deleteByExam(id);
                examDAO.deleteExam(id);
                resp.sendRedirect(req.getContextPath() + "/exams");
                return;
            }
            List<Exam> exams = examDAO.getAllExams();
            req.setAttribute("exams", exams);
            req.getRequestDispatcher("/admin/exams.jsp").forward(req, resp);
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try {
            Exam e = new Exam();
            e.setExamName(req.getParameter("examName"));
            e.setClassName(req.getParameter("className"));
            e.setExamDate(req.getParameter("examDate") == null || req.getParameter("examDate").isEmpty()
                    ? null : Date.valueOf(req.getParameter("examDate")));
            if (e.getExamName() == null || e.getExamName().trim().isEmpty()) {
                throw new IllegalArgumentException("Exam name is required.");
            }
            examDAO.addExam(e);
            resp.sendRedirect(req.getContextPath() + "/exams");
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }
}