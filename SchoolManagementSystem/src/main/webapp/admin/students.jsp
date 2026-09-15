<%@ page contentType="text/html;charset=UTF-8" %>
<%@ page import="com.school.util.Constants" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<% pageContext.setAttribute("classes", Constants.CLASSES);
   pageContext.setAttribute("sections", Constants.SECTIONS); %>
<c:set var="pageTitle" value="Students" />
<% request.setAttribute("active", "students"); %>
<%@ include file="/WEB-INF/includes/header.jspf" %>
<%@ include file="/WEB-INF/includes/sidebar.jspf" %>
<div class="col-lg-10 col-md-9 p-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h4><i class="bi bi-people"></i> Students</h4>
        <a href="${pageContext.request.contextPath}/admin/student-form.jsp" class="btn btn-primary"><i class="bi bi-person-plus"></i> New Admission</a>
    </div>

    <form method="get" action="${pageContext.request.contextPath}/students" class="row g-2 mb-3 bg-white p-3 rounded shadow-sm">
        <div class="col-md-4">
            <label class="form-label small mb-0">Class</label>
            <select name="className" class="form-select form-select-sm">
                <option value="">All</option>
                <c:forEach items="${classes}" var="c"><option ${filterClass == c ? 'selected' : ''}>${c}</option></c:forEach>
            </select>
        </div>
        <div class="col-md-3">
            <label class="form-label small mb-0">Section</label>
            <select name="section" class="form-select form-select-sm">
                <option value="">All</option>
                <c:forEach items="${sections}" var="s"><option ${filterSection == s ? 'selected' : ''}>${s}</option></c:forEach>
            </select>
        </div>
        <div class="col-md-3 d-flex align-items-end">
            <button class="btn btn-sm btn-outline-primary">Filter</button>
        </div>
    </form>

    <div class="card">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead>
                    <tr><th>Adm. No</th><th>Name</th><th>Class / Sec</th><th>Gender</th><th>Parent</th><th>Phone</th><th>Status</th><th class="text-end">Actions</th></tr>
                </thead>
                <tbody>
                    <c:forEach items="${students}" var="s">
                        <tr>
                            <td>${s.admissionNo}</td>
                            <td class="fw-semibold">${s.fullName}</td>
                            <td>${s.className} - ${s.section}</td>
                            <td>${s.gender}</td>
                            <td>${s.parentId > 0 ? s.parentUsername : '-'}</td>
                            <td>${s.phone}</td>
                            <td><span class="badge ${s.status == 'ACTIVE' ? 'bg-success' : 'bg-secondary'}">${s.status}</span></td>
                            <td class="text-end">
                                <a href="${pageContext.request.contextPath}/student/edit?id=${s.studentId}" class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></a>
                                <a href="${pageContext.request.contextPath}/student/delete?id=${s.studentId}" class="btn btn-sm btn-outline-danger"
                                   onclick="return confirm('Deactivate student ${s.admissionNo}?');"><i class="bi bi-trash"></i></a>
                            </td>
                        </tr>
                    </c:forEach>
                    <c:if test="${empty students}">
                        <tr><td colspan="8" class="text-center text-muted py-4">No students found.</td></tr>
                    </c:if>
                </tbody>
            </table>
        </div>
    </div>
</div>
<%@ include file="/WEB-INF/includes/footer.jspf" %>