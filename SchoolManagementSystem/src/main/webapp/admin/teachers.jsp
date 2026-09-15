<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:set var="pageTitle" value="Teachers" />
<% request.setAttribute("active", "teachers"); %>
<%@ include file="/WEB-INF/includes/header.jspf" %>
<%@ include file="/WEB-INF/includes/sidebar.jspf" %>
<div class="col-lg-10 col-md-9 p-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h4><i class="bi bi-person-workspace"></i> Teachers</h4>
        <a href="${pageContext.request.contextPath}/admin/teacher-form.jsp" class="btn btn-primary"><i class="bi bi-person-plus"></i> Add Teacher</a>
    </div>
    <div class="card">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead><tr><th>Name</th><th>Specialization</th><th>Email</th><th>Phone</th><th>Joining Date</th><th>Login</th><th class="text-end">Actions</th></tr></thead>
                <tbody>
                    <c:forEach items="${teachers}" var="t">
                        <tr>
                            <td class="fw-semibold">${t.fullName}</td>
                            <td><span class="badge bg-info text-dark">${t.subjectSpecialization}</span></td>
                            <td>${t.email}</td>
                            <td>${t.phone}</td>
                            <td>${t.joiningDate}</td>
                            <td><code>${t.username}</code></td>
                            <td class="text-end">
                                <a href="${pageContext.request.contextPath}/teacher/edit?id=${t.teacherId}" class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></a>
                                <a href="${pageContext.request.contextPath}/teacher/delete?id=${t.teacherId}" class="btn btn-sm btn-outline-danger"
                                   onclick="return confirm('Delete teacher ${t.fullName}?');"><i class="bi bi-trash"></i></a>
                            </td>
                        </tr>
                    </c:forEach>
                    <c:if test="${empty teachers}">
                        <tr><td colspan="7" class="text-center text-muted py-4">No teachers found.</td></tr>
                    </c:if>
                </tbody>
            </table>
        </div>
    </div>
</div>
<%@ include file="/WEB-INF/includes/footer.jspf" %>