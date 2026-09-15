package com.school.filter;

import com.school.model.User;
import java.io.IOException;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebFilter(urlPatterns = {
    "/admin/*", "/teacher/*", "/parent/*",
    "/students", "/student/*",
    "/teachers", "/teacher/save", "/teacher/edit", "/teacher/delete",
    "/subjects", "/subject/*",
    "/exams", "/exam/*",
    "/attendance",
    "/marks", "/result/*", "/report",
    "/fees", "/fee/*",
    "/payments", "/payment/*",
    "/transport", "/transport/*",
    "/reports",
    "/messages", "/message/*"
})
public class AuthFilter implements Filter {

    @Override
    public void init(FilterConfig fc) throws ServletException {
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;
        HttpSession session = req.getSession(false);
        User user = (session == null) ? null : (User) session.getAttribute("user");

        if (user == null) {
            resp.sendRedirect(req.getContextPath() + "/login");
            return;
        }

        String p = req.getServletPath();
        String role = user.getRole();

        boolean allowed;
        if (p.startsWith("/admin")) {
            allowed = "ADMIN".equals(role);
        } else if (p.startsWith("/parent")) {
            allowed = "PARENT".equals(role);
        } else if (p.startsWith("/teacher/save") || p.startsWith("/teacher/edit") || p.startsWith("/teacher/delete")
                || "/teachers".equals(p)
                || p.startsWith("/students") || p.startsWith("/student/")
                || p.startsWith("/subjects") || p.startsWith("/subject/")
                || p.startsWith("/exams") || p.startsWith("/exam/")
                || p.startsWith("/fees") || p.startsWith("/fee/")
                || p.startsWith("/payments") || p.startsWith("/payment/")
                || p.startsWith("/transport") || p.startsWith("/reports")) {
            allowed = "ADMIN".equals(role);
        } else if (p.startsWith("/teacher")) {
            allowed = "TEACHER".equals(role);
        } else if (p.startsWith("/attendance") || p.startsWith("/marks")
                || p.startsWith("/result/") || p.startsWith("/report")) {
            allowed = "TEACHER".equals(role) || "ADMIN".equals(role);
        } else if (p.startsWith("/messages") || p.startsWith("/message/")) {
            allowed = true;
        } else {
            allowed = "ADMIN".equals(role) || "TEACHER".equals(role) || "PARENT".equals(role);
        }

        if (!allowed) {
            resp.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
        }
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
    }
}