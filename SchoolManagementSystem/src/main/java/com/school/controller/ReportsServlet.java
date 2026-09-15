package com.school.controller;

import com.school.dao.AttendanceDAO;
import com.school.dao.FeeDAO;
import com.school.dao.StudentDAO;
import com.school.dao.TeacherDAO;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/reports")
public class ReportsServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private final StudentDAO studentDAO = new StudentDAO();
    private final TeacherDAO teacherDAO = new TeacherDAO();
    private final AttendanceDAO attendanceDAO = new AttendanceDAO();
    private final FeeDAO feeDAO = new FeeDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try {
            req.setAttribute("classCounts", studentDAO.countByClass());
            req.setAttribute("feeByClass", feeDAO.collectedByClass());
            req.setAttribute("studentCount", studentDAO.countActive());
            req.setAttribute("teacherCount", teacherDAO.count());
            req.setAttribute("totalCollected", feeDAO.totalCollected());
            req.setAttribute("feeStructures", feeDAO.getAllFeeStructures());
            java.sql.Date today = new java.sql.Date(System.currentTimeMillis());
            req.setAttribute("presentToday", attendanceDAO.countByStatusOnDate("PRESENT", today));
            req.setAttribute("absentToday", attendanceDAO.countByStatusOnDate("ABSENT", today));
            req.getRequestDispatcher("/admin/reports.jsp").forward(req, resp);
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }
}