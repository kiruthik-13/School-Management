<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:set var="pageTitle" value="Report Card" />
<% request.setAttribute("active", "marks"); %>
<%@ include file="/WEB-INF/includes/header.jspf" %>
<%@ include file="/WEB-INF/includes/sidebar.jspf" %>
<div class="col-lg-10 col-md-9 p-4">
    <h4 class="mb-3"><i class="bi bi-file-earmark-text"></i> Report Card</h4>

    <div class="card p-4 mx-auto" style="max-width:760px;">
        <div class="text-center border-bottom pb-2 mb-3">
            <h5>${exam.examName} &mdash; ${exam.className}</h5>
            <h4 class="text-primary fw-bold">${student.fullName}</h4>
            <div class="text-muted">Admission No: ${student.admissionNo} &nbsp;|&nbsp; Section: ${student.section}</div>
        </div>

        <table class="table table-bordered text-center">
            <thead>
                <tr><th>Subject</th><th>Marks Obtained</th><th>Max Marks</th><th>Grade</th></tr>
            </thead>
            <tbody>
                <c:forEach items="${results}" var="r">
                    <tr>
                        <td class="text-start fw-semibold">${r.subjectName}</td>
                        <td>${r.marksObtained}</td>
                        <td>${r.maxMarks}</td>
                        <td><span class="badge bg-success">${r.grade}</span></td>
                    </tr>
                </c:forEach>
                <tr class="table-light">
                    <td class="text-end fw-bold">Total</td>
                    <td class="fw-bold">${totalObtained}</td>
                    <td class="fw-bold">${totalMax}</td>
                    <td></td>
                </tr>
            </tbody>
        </table>

        <div class="d-flex justify-content-between align-items-center">
            <div>
                <div class="fw-semibold">Percentage: <span class="text-primary">${percentage}%</span></div>
                <div class="fw-semibold">Overall Grade: <span class="badge bg-success fs-6">${overallGrade}</span></div>
            </div>
            <a href="javascript:window.print()" class="btn btn-outline-primary"><i class="bi bi-printer"></i> Print</a>
        </div>

        <c:if test="${empty results}">
            <div class="alert alert-info mt-3 mb-0">No marks have been entered for this student yet.</div>
        </c:if>
    </div>
</div>
<%@ include file="/WEB-INF/includes/footer.jspf" %>