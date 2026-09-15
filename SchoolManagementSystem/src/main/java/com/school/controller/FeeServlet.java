package com.school.controller;

import com.school.dao.FeeDAO;
import com.school.dao.StudentDAO;
import com.school.model.FeePayment;
import com.school.model.FeeStructure;
import java.io.IOException;
import java.sql.Date;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(urlPatterns = {"/fees", "/fee/save", "/fee/delete", "/payments", "/payment/save"})
public class FeeServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private final FeeDAO feeDAO = new FeeDAO();
    private final StudentDAO studentDAO = new StudentDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String path = req.getServletPath();
        try {
            if ("/payments".equals(path)) {
                List<FeePayment> payments = feeDAO.getAllPayments();
                req.setAttribute("payments", payments);
                req.setAttribute("students", studentDAO.getAllStudents());
                req.setAttribute("feeStructures", feeDAO.getAllFeeStructures());
                req.setAttribute("totalCollected", feeDAO.totalCollected());
                req.getRequestDispatcher("/admin/payments.jsp").forward(req, resp);
                return;
            }
            if ("/fee/delete".equals(path)) {
                int id = Integer.parseInt(req.getParameter("id"));
                feeDAO.deleteFeeStructure(id);
                resp.sendRedirect(req.getContextPath() + "/fees");
                return;
            }
            req.setAttribute("feeStructures", feeDAO.getAllFeeStructures());
            req.getRequestDispatcher("/admin/fees.jsp").forward(req, resp);
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String path = req.getServletPath();
        try {
            if ("/fee/save".equals(path)) {
                FeeStructure fs = new FeeStructure();
                fs.setClassName(req.getParameter("className"));
                fs.setFeeType(req.getParameter("feeType"));
                fs.setAmount(Double.parseDouble(req.getParameter("amount")));
                fs.setDueDate(req.getParameter("dueDate") == null || req.getParameter("dueDate").isEmpty()
                        ? null : Date.valueOf(req.getParameter("dueDate")));
                feeDAO.addFeeStructure(fs);
                resp.sendRedirect(req.getContextPath() + "/fees");
                return;
            }
            if ("/payment/save".equals(path)) {
                int studentId = Integer.parseInt(req.getParameter("studentId"));
                int feeStructureId = Integer.parseInt(req.getParameter("feeStructureId"));
                double amount = Double.parseDouble(req.getParameter("amountPaid"));
                FeeStructure fs = feeDAO.findFeeStructureById(feeStructureId);
                FeePayment p = new FeePayment();
                p.setStudentId(studentId);
                p.setFeeStructureId(feeStructureId);
                p.setAmountPaid(amount);
                p.setPaymentMode(req.getParameter("paymentMode"));
                p.setStatus(amount >= fs.getAmount() ? "PAID" : amount > 0 ? "PARTIAL" : "PENDING");
                feeDAO.addPayment(p);
                resp.sendRedirect(req.getContextPath() + "/payments?ok=1");
            }
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }
}