<%@ page contentType="text/html;charset=UTF-8" %>
<%@ page import="com.school.util.Constants" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<% pageContext.setAttribute("classes", Constants.CLASSES);
   pageContext.setAttribute("sections", Constants.SECTIONS); %>
<c:set var="pageTitle" value="Class & Subjects" />
<% request.setAttribute("active", "subjects"); %>
<%@ include file="/WEB-INF/includes/header.jspf" %>
<%@ include file="/WEB-INF/includes/sidebar.jspf" %>
<div class="col-lg-10 col-md-9 p-4">
    <h4 class="mb-4"><i class="bi bi-journal-bookmark"></i> Class & Subject Assignment</h4>

    <div class="card p-4 mb-4" style="max-width:560px;">
        <h6>Add Subject</h6>
        <form method="post" action="${pageContext.request.contextPath}/subject/save" class="row g-2">
            <div class="col-md-4">
                <select name="className" class="form-select" required>
                    <option value="">Class</option>
                    <c:forEach items="${classes}" var="c"><option>${c}</option></c:forEach>
                </select>
            </div>
            <div class="col-md-4">
                <input type="text" name="subjectName" class="form-control" placeholder="Subject name" required>
            </div>
            <div class="col-md-4">
                <select name="teacherId" class="form-select">
                    <option value="">-- teacher --</option>
                    <c:forEach items="${teachers}" var="t">
                        <option value="${t.teacherId}">${t.fullName}</option>
                    </c:forEach>
                </select>
            </div>
            <div class="col-12">
                <button class="btn btn-primary btn-sm"><i class="bi bi-plus-lg"></i> Add Subject</button>
            </div>
        </form>
    </div>

    <div class="card">
        <table class="table table-hover align-middle mb-0">
            <thead><tr><th>Class</th><th>Subject</th><th>Assigned Teacher</th><th class="text-end">Action</th></tr></thead>
            <tbody>
                <c:forEach items="${subjects}" var="s">
                    <tr>
                        <td>${s.className}</td>
                        <td class="fw-semibold">${s.subjectName}</td>
                        <td>${s.teacherName}</td>
                        <td class="text-end">
                            <a href="${pageContext.request.contextPath}/subject/delete?id=${s.subjectId}" class="btn btn-sm btn-outline-danger"
                               onclick="return confirm('Delete ${s.subjectName}?');"><i class="bi bi-trash"></i></a>
                        </td>
                    </tr>
                </c:forEach>
                <c:if test="${empty subjects}">
                    <tr><td colspan="4" class="text-center text-muted py-4">No subjects assigned.</td></tr>
                </c:if>
            </tbody>
        </table>
    </div>
</div>
<%@ include file="/WEB-INF/includes/footer.jspf" %>