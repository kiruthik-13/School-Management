<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:set var="pageTitle" value="Teacher Dashboard" />
<% request.setAttribute("active", "dashboard"); %>
<%@ include file="/WEB-INF/includes/header.jspf" %>
<%@ include file="/WEB-INF/includes/sidebar.jspf" %>
<div class="col-lg-10 col-md-9 p-4">
    <h4 class="mb-4"><i class="bi bi-speedometer2"></i> Teacher Dashboard</h4>

    <div class="card p-4 mb-4">
        <div class="d-flex align-items-center">
            <div class="display-5 me-3 text-primary"><i class="bi bi-person-badge"></i></div>
            <div>
                <h5 class="mb-1">Welcome, ${teacher.fullName}</h5>
                <div class="text-muted">Specialization: <b>${teacher.subjectSpecialization}</b> &middot; Joined: ${teacher.joiningDate}</div>
            </div>
        </div>
    </div>

    <div class="row g-4">
        <div class="col-md-4">
            <div class="card stat-card p-3">
                <div class="text-muted small">Subjects Taught</div>
                <div class="fs-3 fw-bold text-primary">${subjectCount}</div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card stat-card p-3">
                <a href="${pageContext.request.contextPath}/attendance" class="text-decoration-none">
                    <div class="text-muted small">Mark Today's Attendance</div>
                    <div class="fs-5 fw-semibold text-info"><i class="bi bi-calendar-check"></i> Go</div>
                </a>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card stat-card p-3">
                <a href="${pageContext.request.contextPath}/marks" class="text-decoration-none">
                    <div class="text-muted small">Enter Examination Marks</div>
                    <div class="fs-5 fw-semibold text-success"><i class="bi bi-clipboard-data"></i> Go</div>
                </a>
            </div>
        </div>
    </div>

    <div class="card mt-4 p-3">
        <h6>My Subjects</h6>
        <table class="table table-sm table-striped mb-0">
            <thead><tr><th>Subject</th><th>Class</th></tr></thead>
            <tbody>
                <c:forEach items="${subjects}" var="s">
                    <c:if test="${s.teacherId == teacher.teacherId}">
                        <tr><td class="fw-semibold">${s.subjectName}</td><td>${s.className}</td></tr>
                    </c:if>
                </c:forEach>
                <c:if test="${empty subjects}">
                    <tr><td colspan="2" class="text-muted">No subjects assigned.</td></tr>
                </c:if>
            </tbody>
        </table>
    </div>
</div>
<%@ include file="/WEB-INF/includes/footer.jspf" %>