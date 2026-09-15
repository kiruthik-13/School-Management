package com.school.controller;

import com.school.dao.AttendanceDAO;
import com.school.dao.StudentDAO;
import com.school.dao.TeacherDAO;
import com.school.model.Attendance;
import com.school.model.Student;
import com.school.model.User;
import java.io.IOException;
import java.sql.Date;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/attendance")
public class AttendanceServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private final AttendanceDAO attendanceDAO = new AttendanceDAO();
    private final StudentDAO studentDAO = new StudentDAO();
    private final TeacherDAO teacherDAO = new TeacherDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String className = param(req.getParameter("className"), "Class 5");
        String section = param(req.getParameter("section"), "A");
        Date date = req.getParameter("date") == null || req.getParameter("date").isEmpty()
                ? new Date(System.currentTimeMillis()) : Date.valueOf(req.getParameter("date"));
        try {
            List<Student> students = studentDAO.studentsByClass(className, section);
            List<Attendance> existing = attendanceDAO.getByClassDate(className, section, date);
            Map<Integer, String> statusMap = new HashMap<>();
            for (Attendance a : existing) {
                statusMap.put(a.getStudentId(), a.getStatus());
            }
            req.setAttribute("students", students);
            req.setAttribute("statusMap", statusMap);
            req.setAttribute("className", className);
            req.setAttribute("section", section);
            req.setAttribute("date", date);
            req.setAttribute("summary", attendanceDAO.attendanceSummaryByClass(className, section, date));
            if ("1".equals(req.getParameter("saved"))) {
                req.setAttribute("msg", "Attendance saved for " + className + " " + section + " on " + date + ".");
            }
            User user = (User) req.getSession().getAttribute("user");
            if ("ADMIN".equals(user.getRole())) {
                req.getRequestDispatcher("/admin/attendance.jsp").forward(req, resp);
            } else {
                req.getRequestDispatcher("/teacher/attendance.jsp").forward(req, resp);
            }
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String className = req.getParameter("className");
        String section = req.getParameter("section");
        Date date = Date.valueOf(req.getParameter("date"));
        User user = (User) req.getSession().getAttribute("user");
        try {
            List<Student> students = studentDAO.studentsByClass(className, section);
            int teacherId = 0;
            if ("TEACHER".equals(user.getRole())) {
                teacherId = teacherDAO.findByUserId(user.getUserId()) != null
                        ? teacherDAO.findByUserId(user.getUserId()).getTeacherId() : 0;
            }
            List<Attendance> records = new ArrayList<>();
            for (Student s : students) {
                String status = req.getParameter("status_" + s.getStudentId());
                if (status == null || status.trim().isEmpty()) {
                    status = "ABSENT";
                }
                Attendance a = new Attendance();
                a.setStudentId(s.getStudentId());
                a.setAttendanceDate(date);
                a.setStatus(status);
                a.setMarkedBy(teacherId);
                records.add(a);
            }
            attendanceDAO.saveRecords(records);
            resp.sendRedirect(req.getContextPath() + "/attendance?className=" + className
                    + "&section=" + section + "&date=" + date + "&saved=1");
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }

    private String param(String v, String dflt) {
        return (v == null || v.trim().isEmpty()) ? dflt : v.trim();
    }
}