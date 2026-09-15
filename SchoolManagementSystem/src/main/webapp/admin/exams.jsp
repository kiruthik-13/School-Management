<%@ page contentType="text/html;charset=UTF-8" %>
<%@ page import="com.school.util.Constants" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<% pageContext.setAttribute("classes", Constants.CLASSES); %>
<c:set var="pageTitle" value="Exams" />
<% request.setAttribute("active", "exams"); %>
<%@ include file="/WEB-INF/includes/header.jspf" %>
<%@ include file="/WEB-INF/includes/sidebar.jspf" %>
<div class="col-lg-10 col-md-9 p-4">
    <h4 class="mb-4"><i class="bi bi-pencil-square"></i> Examination</h4>

    <div class="card p-4 mb-4" style="max-width:640px;">
        <h6>Schedule Exam</h6>
        <form method="post" action="${pageContext.request.contextPath}/exam/save" class="row g-2">
            <div class="col-md-4">
                <input type="text" name="examName" class="form-control" placeholder="Exam name" required>
            </div>
            <div class="col-md-4">
                <select name="className" class="form-select">
                    <option value="">Class</option>
                    <c:forEach items="${classes}" var="c"><option>${c}</option></c:forEach>
                </select>
            </div>
            <div class="col-md-4">
                <input type="date" name="examDate" class="form-control">
            </div>
            <div class="col-12">
                <button class="btn btn-primary btn-sm"><i class="bi bi-plus-lg"></i> Schedule Exam</button>
            </div>
        </form>
    </div>

    <div class="card">
        <table class="table table-hover align-middle mb-0">
            <thead><tr><th>Exam</th><th>Class</th><th>Date</th><th class="text-center">Marks</th><th class="text-end">Action</th></tr></thead>
            <tbody>
                <c:forEach items="${exams}" var="e">
                    <tr>
                        <td class="fw-semibold">${e.examName}</td>
                        <td>${e.className}</td>
                        <td>${e.examDate}</td>
                        <td class="text-center">
                            <a href="${pageContext.request.contextPath}/marks?examId=${e.examId}" class="btn btn-sm btn-outline-primary">Enter / View</a>
                        </td>
                        <td class="text-end">
                            <a href="${pageContext.request.contextPath}/exam/delete?id=${e.examId}" class="btn btn-sm btn-outline-danger"
                               onclick="return confirm('Delete exam and its results?');"><i class="bi bi-trash"></i></a>
                        </td>
                    </tr>
                </c:forEach>
                <c:if test="${empty exams}">
                    <tr><td colspan="5" class="text-center text-muted py-4">No exams scheduled.</td></tr>
                </c:if>
            </tbody>
        </table>
    </div>
</div>
<%@ include file="/WEB-INF/includes/footer.jspf" %>