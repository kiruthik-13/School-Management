package com.school.controller;

import com.school.dao.MessageDAO;
import com.school.dao.StudentDAO;
import com.school.dao.UserDAO;
import com.school.model.Message;
import com.school.model.Student;
import com.school.model.User;
import java.io.IOException;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(urlPatterns = {"/messages", "/message/send"})
public class MessageServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private final MessageDAO messageDAO = new MessageDAO();
    private final UserDAO userDAO = new UserDAO();
    private final StudentDAO studentDAO = new StudentDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        User user = (User) req.getSession().getAttribute("user");
        try {
            if ("ADMIN".equals(user.getRole())) {
                req.setAttribute("messages", messageDAO.allMessages());
                req.setAttribute("receivers", userDAO.getUsersByRole("TEACHER"));
                req.setAttribute("students", studentDAO.getAllStudents());
                req.getRequestDispatcher("/admin/messages.jsp").forward(req, resp);
            } else if ("TEACHER".equals(user.getRole())) {
                req.setAttribute("messages", messageDAO.conversation(user.getUserId()));
                req.setAttribute("receivers", userDAO.getUsersByRole("PARENT"));
                req.setAttribute("students", studentDAO.getAllStudents());
                req.getRequestDispatcher("/teacher/messages.jsp").forward(req, resp);
            } else {
                req.setAttribute("messages", messageDAO.conversation(user.getUserId()));
                req.setAttribute("receivers", userDAO.getUsersByRole("TEACHER"));
                req.setAttribute("students", studentDAO.findByParentIdAll(user.getUserId()));
                req.getRequestDispatcher("/parent/messages.jsp").forward(req, resp);
            }
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        User user = (User) req.getSession().getAttribute("user");
        try {
            Message m = new Message();
            m.setSenderId(user.getUserId());
            m.setReceiverId(Integer.parseInt(req.getParameter("receiverId")));
            String sid = req.getParameter("studentId");
            m.setStudentId(sid == null || sid.isEmpty() ? 0 : Integer.parseInt(sid));
            m.setSubject(req.getParameter("subject"));
            m.setMessageBody(req.getParameter("messageBody"));
            if (m.getSubject() == null || m.getSubject().trim().isEmpty()
                    || m.getMessageBody() == null || m.getMessageBody().trim().isEmpty()) {
                throw new IllegalArgumentException("Subject and message are required.");
            }
            messageDAO.send(m);
            resp.sendRedirect(req.getContextPath() + "/messages?ok=1");
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }
}