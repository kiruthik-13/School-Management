<%@ page contentType="text/html;charset=UTF-8" %>
<%@ page import="com.school.util.Constants" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<% pageContext.setAttribute("sections", Constants.SECTIONS); %>
<c:set var="pageTitle" value="Teacher Form" />
<% request.setAttribute("active", "teachers"); %>
<%@ include file="/WEB-INF/includes/header.jspf" %>
<%@ include file="/WEB-INF/includes/sidebar.jspf" %>
<div class="col-lg-10 col-md-9 p-4">
    <h4 class="mb-4"><i class="bi bi-person-plus"></i> ${not empty teacher ? 'Edit Teacher' : 'Add Teacher'}</h4>
    <div class="card p-4" style="max-width:720px;">
        <form method="post" action="${pageContext.request.contextPath}/teacher/save">
            <c:if test="${not empty teacher}">
                <input type="hidden" name="teacherId" value="${teacher.teacherId}">
            </c:if>
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">First Name *</label>
                    <input type="text" name="firstName" class="form-control" required value="${teacher.firstName}">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Last Name</label>
                    <input type="text" name="lastName" class="form-control" value="${teacher.lastName}">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Subject Specialization</label>
                    <input type="text" name="subjectSpecialization" class="form-control" value="${teacher.subjectSpecialization}">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Joining Date</label>
                    <input type="date" name="joiningDate" class="form-control" value="${teacher.joiningDate}">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Email * (used as login)</label>
                    <input type="email" name="email" class="form-control" value="${teacher.email}" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Phone</label>
                    <input type="text" name="phone" class="form-control" value="${teacher.phone}">
                </div>
            </div>
            <c:if test="${empty teacher}">
                <div class="form-text my-2">A login account will be auto-created with default password <b>teacher123</b>.</div>
            </c:if>
            <button type="submit" class="btn btn-primary mt-3"><i class="bi bi-check-lg"></i> ${not empty teacher ? 'Update Teacher' : 'Add Teacher'}</button>
            <a href="${pageContext.request.contextPath}/teachers" class="btn btn-outline-secondary mt-3">Cancel</a>
        </form>
    </div>
</div>
<%@ include file="/WEB-INF/includes/footer.jspf" %>