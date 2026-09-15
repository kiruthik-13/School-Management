package com.school.controller;

import com.school.dao.ExamDAO;
import com.school.dao.ExamResultDAO;
import com.school.dao.StudentDAO;
import com.school.dao.SubjectDAO;
import com.school.model.Exam;
import com.school.model.ExamResult;
import com.school.model.Student;
import com.school.model.Subject;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(urlPatterns = {"/marks", "/result/save", "/report"})
public class ExamResultServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private final ExamDAO examDAO = new ExamDAO();
    private final ExamResultDAO resultDAO = new ExamResultDAO();
    private final StudentDAO studentDAO = new StudentDAO();
    private final SubjectDAO subjectDAO = new SubjectDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try {
            if ("/report".equals(req.getServletPath())) {
                reportCard(req);
                req.getRequestDispatcher("/admin/report-card.jsp").forward(req, resp);
                return;
            }
            String examIdParam = req.getParameter("examId");
            List<Exam> exams = examDAO.getAllExams();
            req.setAttribute("exams", exams);
            if (examIdParam == null || examIdParam.trim().isEmpty()) {
                req.getRequestDispatcher("/admin/marks.jsp").forward(req, resp);
                return;
            }
            int examId = Integer.parseInt(examIdParam);
            Exam exam = examDAO.findById(examId);
            if (exam == null) {
                resp.sendRedirect(req.getContextPath() + "/marks");
                return;
            }
            List<Student> students = studentDAO.studentsByClass(exam.getClassName(), null);
            List<Subject> subjects = subjectDAO.subjectsByClass(exam.getClassName());
            Map<String, ExamResult> existing = new HashMap<>();
            for (ExamResult r : resultDAO.resultsByExam(examId)) {
                existing.put(r.getStudentId() + "_" + r.getSubjectId(), r);
            }
            req.setAttribute("exam", exam);
            req.setAttribute("students", students);
            req.setAttribute("subjects", subjects);
            req.setAttribute("existing", existing);
            if ("1".equals(req.getParameter("saved"))) {
                req.setAttribute("msg", "Marks saved successfully.");
            }
            req.getRequestDispatcher("/admin/marks.jsp").forward(req, resp);
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try {
            int examId = Integer.parseInt(req.getParameter("examId"));
            Exam exam = examDAO.findById(examId);
            List<Student> students = studentDAO.studentsByClass(exam.getClassName(), null);
            List<Subject> subjects = subjectDAO.subjectsByClass(exam.getClassName());
            String maxParam = req.getParameter("max_marks");
            double maxMarks = maxParam == null || maxParam.isEmpty() ? 100 : Double.parseDouble(maxParam);

            for (Student s : students) {
                for (Subject sub : subjects) {
                    String mark = req.getParameter("m_" + sub.getSubjectId() + "_" + s.getStudentId());
                    if (mark == null || mark.trim().isEmpty()) {
                        continue;
                    }
                    double obtained = Double.parseDouble(mark);
                    ExamResult r = new ExamResult();
                    r.setExamId(examId);
                    r.setStudentId(s.getStudentId());
                    r.setSubjectId(sub.getSubjectId());
                    r.setMarksObtained(obtained);
                    r.setMaxMarks(maxMarks);
                    r.setGrade(ExamResultDAO.gradeFor(obtained, maxMarks));
                    resultDAO.saveResult(r);
                }
            }
            resp.sendRedirect(req.getContextPath() + "/marks?examId=" + examId + "&saved=1");
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }

    private void reportCard(HttpServletRequest req) throws Exception {
        int examId = Integer.parseInt(req.getParameter("examId"));
        int studentId = Integer.parseInt(req.getParameter("studentId"));
        Exam exam = examDAO.findById(examId);
        Student student = studentDAO.findById(studentId);
        List<ExamResult> results = resultDAO.resultsByExamStudent(examId, studentId);
        double totalObtained = 0, totalMax = 0;
        for (ExamResult r : results) {
            totalObtained += r.getMarksObtained();
            totalMax += r.getMaxMarks();
        }
        double pct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 1000.0) / 10.0 : 0;
        req.setAttribute("exam", exam);
        req.setAttribute("student", student);
        req.setAttribute("results", results);
        req.setAttribute("totalObtained", totalObtained);
        req.setAttribute("totalMax", totalMax);
        req.setAttribute("percentage", pct);
        req.setAttribute("overallGrade", ExamResultDAO.gradeFor(totalObtained, totalMax));
    }
}