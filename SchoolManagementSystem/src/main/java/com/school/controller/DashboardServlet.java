package com.school.controller;

import com.school.dao.AttendanceDAO;
import com.school.dao.FeeDAO;
import com.school.dao.StudentDAO;
import com.school.dao.SubjectDAO;
import com.school.dao.TeacherDAO;
import com.school.dao.TransportDAO;
import com.school.model.Student;
import com.school.model.Subject;
import com.school.model.Teacher;
import com.school.model.User;
import java.io.IOException;
import java.sql.Date;
import java.util.List;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet({"/admin", "/teacher", "/parent"})
public class DashboardServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private final StudentDAO studentDAO = new StudentDAO();
    private final TeacherDAO teacherDAO = new TeacherDAO();
    private final AttendanceDAO attendanceDAO = new AttendanceDAO();
    private final FeeDAO feeDAO = new FeeDAO();
    private final SubjectDAO subjectDAO = new SubjectDAO();
    private final TransportDAO transportDAO = new TransportDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String path = req.getServletPath();
        User user = (User) req.getSession().getAttribute("user");

        try {
            if ("/admin".equals(path)) {
                adminDashboard(req);
                req.getRequestDispatcher("/admin/dashboard.jsp").forward(req, resp);
            } else if ("/teacher".equals(path)) {
                teacherDashboard(req, user);
                req.getRequestDispatcher("/teacher/dashboard.jsp").forward(req, resp);
            } else {
                parentDashboard(req, user);
                req.getRequestDispatcher("/parent/dashboard.jsp").forward(req, resp);
            }
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }

    private void adminDashboard(HttpServletRequest req) throws Exception {
        List<Map<String, Object>> byClass = studentDAO.countByClass();
        long totalStudents = 0;
        for (Map<String, Object> m : byClass) {
            totalStudents += (Integer) m.get("count");
        }
        req.setAttribute("studentCount", totalStudents);
        req.setAttribute("teacherCount", teacherDAO.count());
        req.setAttribute("presentToday", attendanceDAO.countByStatusOnDate("PRESENT", new Date(System.currentTimeMillis())));
        req.setAttribute("absentToday", attendanceDAO.countByStatusOnDate("ABSENT", new Date(System.currentTimeMillis())));
        req.setAttribute("feeCollected", feeDAO.totalCollected());
        req.setAttribute("classCounts", byClass);
    }

    private void teacherDashboard(HttpServletRequest req, User user) throws Exception {
        Teacher teacher = teacherDAO.findByUserId(user.getUserId());
        if (teacher == null) {
            throw new IllegalStateException("No teacher profile linked to this account.");
        }
        req.setAttribute("teacher", teacher);
        List<Subject> subjects = subjectDAO.getAllSubjects();
        long mySubjects = 0;
        for (Subject s : subjects) {
            if (s.getTeacherId() == teacher.getTeacherId()) {
                mySubjects++;
            }
        }
        req.setAttribute("subjectCount", mySubjects);
        req.setAttribute("subjects", subjects);
    }

    private void parentDashboard(HttpServletRequest req, User user) throws Exception {
        List<Student> children = studentDAO.findByParentIdAll(user.getUserId());
        if (children.isEmpty()) {
            req.setAttribute("message", "No student record is linked to your account yet. Contact the school office.");
        } else {
            Student child = children.get(0);
            req.setAttribute("children", children);
            req.setAttribute("child", child);
            req.setAttribute("attendanceStats", attendanceDAO.statsByStudent(child.getStudentId()));
            req.setAttribute("dues", feeDAO.duesByStudent(child.getStudentId()));
            req.setAttribute("transport", transportDAO.transportForStudent(child.getStudentId()));
            req.setAttribute("payments", feeDAO.paymentsByStudent(child.getStudentId()));
            req.setAttribute("marks", studentMarks(child.getStudentId()));
            req.setAttribute("recentAttendance", attendanceDAO.getByStudent(child.getStudentId()));
        }
    }

    private List<?> studentMarks(int studentId) throws Exception {
        return new com.school.dao.ExamResultDAO().resultsByStudent(studentId);
    }
}