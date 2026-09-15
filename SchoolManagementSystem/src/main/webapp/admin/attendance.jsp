<%@ page contentType="text/html;charset=UTF-8" %>
<%@ page import="com.school.util.Constants" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<% pageContext.setAttribute("classes", Constants.CLASSES);
   pageContext.setAttribute("sections", Constants.SECTIONS); %>
<c:set var="pageTitle" value="Attendance" />
<% request.setAttribute("active", "attendance"); %>
<%@ include file="/WEB-INF/includes/header.jspf" %>
<%@ include file="/WEB-INF/includes/sidebar.jspf" %>
<div class="col-lg-10 col-md-9 p-4">
    <h4 class="mb-4"><i class="bi bi-calendar-check"></i> Attendance</h4>

    <c:if test="${not empty msg}"><div class="alert alert-success py-2">${msg}</div></c:if>

    <form method="get" action="${pageContext.request.contextPath}/attendance" class="row g-2 bg-white p-3 rounded shadow-sm mb-3">
        <div class="col-md-3">
            <label class="form-label small mb-0">Class</label>
            <select name="className" class="form-select form-select-sm">
                <c:forEach items="${classes}" var="c"><option ${className == c ? 'selected' : ''}>${c}</option></c:forEach>
            </select>
        </div>
        <div class="col-md-2">
            <label class="form-label small mb-0">Section</label>
            <select name="section" class="form-select form-select-sm">
                <c:forEach items="${sections}" var="s"><option ${section == s ? 'selected' : ''}>${s}</option></c:forEach>
            </select>
        </div>
        <div class="col-md-3">
            <label class="form-label small mb-0">Date</label>
            <input type="date" name="date" class="form-control form-select-sm" value="${date}">
        </div>
        <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-sm btn-outline-primary w-100">Load</button>
        </div>
    </form>

    <div class="card mb-3 p-3">
        <div class="d-flex justify-content-between">
            <h6>Attendance Sheet - ${className} ${section} (${date})</h6>
            <span>
                <c:forEach items="${summary}" var="sm">
                    <span class="badge ${sm.status == 'PRESENT' ? 'bg-success' : sm.status == 'ABSENT' ? 'bg-danger' : 'bg-warning text-dark'}">${sm.status}: ${sm.count}</span>
                </c:forEach>
            </span>
        </div>
        <form method="post" action="${pageContext.request.contextPath}/attendance">
            <input type="hidden" name="className" value="${className}">
            <input type="hidden" name="section" value="${section}">
            <input type="hidden" name="date" value="${date}">
            <table class="table table-sm align-middle mb-2">
                <thead><tr><th>#</th><th>Student</th><th>Adm. No</th><th>Status</th></tr></thead>
                <tbody>
                    <c:forEach items="${students}" var="s" varStatus="i">
                        <tr>
                            <td>${i.count}</td>
                            <td class="fw-semibold">${s.fullName}</td>
                            <td>${s.admissionNo}</td>
                            <td class="w-25">
                                <select name="status_${s.studentId}" class="form-select form-select-sm">
                                    <option value="PRESENT" ${statusMap[s.studentId] == 'PRESENT' ? 'selected' : ''}>Present</option>
                                    <option value="ABSENT" ${statusMap[s.studentId] == 'ABSENT' ? 'selected' : ''}>Absent</option>
                                    <option value="LEAVE" ${statusMap[s.studentId] == 'LEAVE' ? 'selected' : ''}>Leave</option>
                                </select>
                            </td>
                        </tr>
                    </c:forEach>
                    <c:if test="${empty students}">
                        <tr><td colspan="4" class="text-center text-muted py-3">No students in this class/section.</td></tr>
                    </c:if>
                </tbody>
            </table>
            <c:if test="${not empty students}">
                <button class="btn btn-primary"><i class="bi bi-check-lg"></i> Save Attendance</button>
            </c:if>
        </form>
    </div>
</div>
<%@ include file="/WEB-INF/includes/footer.jspf" %>