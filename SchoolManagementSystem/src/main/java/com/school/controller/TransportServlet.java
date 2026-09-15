package com.school.controller;

import com.school.dao.TransportDAO;
import com.school.model.TransportRoute;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(urlPatterns = {"/transport", "/transport/save", "/transport/assign", "/transport/remove"})
public class TransportServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private final TransportDAO transportDAO = new TransportDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try {
            if ("/transport/remove".equals(req.getServletPath())) {
                int studentId = Integer.parseInt(req.getParameter("studentId"));
                transportDAO.removeAssignment(studentId);
                resp.sendRedirect(req.getContextPath() + "/transport");
                return;
            }
            req.setAttribute("routes", transportDAO.getAllRoutes());
            req.setAttribute("assignments", transportDAO.allStudentRoutes());
            req.getRequestDispatcher("/admin/transport.jsp").forward(req, resp);
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try {
            String path = req.getServletPath();
            if ("/transport/save".equals(path)) {
                TransportRoute r = new TransportRoute();
                r.setRouteName(req.getParameter("routeName"));
                r.setVehicleNo(req.getParameter("vehicleNo"));
                r.setDriverName(req.getParameter("driverName"));
                r.setFare(Double.parseDouble(req.getParameter("fare")));
                transportDAO.addRoute(r);
                resp.sendRedirect(req.getContextPath() + "/transport");
                return;
            }
            if ("/transport/assign".equals(path)) {
                int studentId = Integer.parseInt(req.getParameter("studentId"));
                int routeId = Integer.parseInt(req.getParameter("routeId"));
                transportDAO.assignRoute(studentId, routeId);
                resp.sendRedirect(req.getContextPath() + "/transport");
            }
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }
}