<%@ page contentType="text/html;charset=UTF-8" %>
<%@ page import="com.school.util.Constants" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<% pageContext.setAttribute("classes", Constants.CLASSES);
   pageContext.setAttribute("sections", Constants.SECTIONS); %>
<c:set var="pageTitle" value="Student Admission" />
<% request.setAttribute("active", "admission"); %>
<%@ include file="/WEB-INF/includes/header.jspf" %>
<%@ include file="/WEB-INF/includes/sidebar.jspf" %>
<div class="col-lg-10 col-md-9 p-4">
    <h4 class="mb-4"><i class="bi bi-person-plus"></i> ${not empty student ? 'Edit Student' : 'New Admission'}</h4>

    <div class="card p-4" style="max-width:760px;">
        <form method="post" action="${pageContext.request.contextPath}/student/save">
            <c:if test="${not empty student}">
                <input type="hidden" name="studentId" value="${student.studentId}">
                <div class="mb-3">
                    <label class="form-label">Admission No.</label>
                    <input class="form-control" value="${student.admissionNo}" readonly>
                </div>
            </c:if>

            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">First Name *</label>
                    <input type="text" name="firstName" class="form-control" required value="${student.firstName}">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Last Name</label>
                    <input type="text" name="lastName" class="form-control" value="${student.lastName}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Date of Birth</label>
                    <input type="date" name="dob" class="form-control" value="${student.dob}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Gender</label>
                    <select name="gender" class="form-select">
                        <option></option>
                        <option ${student.gender == 'M' ? 'selected' : ''}>M</option>
                        <option ${student.gender == 'F' ? 'selected' : ''}>F</option>
                        <option ${student.gender == 'O' ? 'selected' : ''}>O</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label">Phone</label>
                    <input type="text" name="phone" class="form-control" value="${student.phone}">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Class *</label>
                    <select name="className" class="form-select" required>
                        <option></option>
                        <c:forEach items="${classes}" var="c">
                            <option ${student.className == c ? 'selected' : ''}>${c}</option>
                        </c:forEach>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Section</label>
                    <select name="section" class="form-select">
                        <option></option>
                        <c:forEach items="${sections}" var="s">
                            <option ${student.section == s ? 'selected' : ''}>${s}</option>
                        </c:forEach>
                    </select>
                </div>
                <div class="col-12">
                    <label class="form-label">Address</label>
                    <input type="text" name="address" class="form-control" value="${student.address}">
                </div>
            </div>

            <hr>
            <h6>Parent Account</h6>
            <div class="form-check mb-2">
                <input class="form-check-input" type="radio" name="parentChoice" value="existing" id="pcExist"
                       ${empty student || student.parentId <= 0 ? '' : 'checked'}>
                <label class="form-check-label" for="pcExist">Link to an existing parent account</label>
            </div>
            <div class="mb-3" id="existingBlock">
                <select name="parentId" class="form-select">
                    <option value="0">-- select parent --</option>
                    <c:forEach items="${parents}" var="p">
                        <option value="${p.userId}" ${student.parentId == p.userId ? 'selected' : ''}>${p.username} (${p.email})</option>
                    </c:forEach>
                </select>
                <c:if test="${empty parents}">
                    <div class="form-text text-warning">No parent accounts exist yet. Create a new one below.</div>
                </c:if>
            </div>

            <div class="form-check mb-2">
                <input class="form-check-input" type="radio" name="parentChoice" value="new" id="pcNew"
                       ${empty student || student.parentId <= 0 ? 'checked' : ''}>
                <label class="form-check-label" for="pcNew">Create a new parent account (default password: parent123)</label>
            </div>
            <div class="row g-3 mb-3" id="newBlock">
                <div class="col-md-6">
                    <label class="form-label">Parent Name</label>
                    <input type="text" name="newParentName" class="form-control">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Parent Email</label>
                    <input type="email" name="newParentEmail" class="form-control">
                </div>
            </div>

            <button type="submit" class="btn btn-primary"><i class="bi bi-check-lg"></i> ${not empty student ? 'Update Student' : 'Admit Student'}</button>
            <a href="${pageContext.request.contextPath}/students" class="btn btn-outline-secondary">Cancel</a>
        </form>
    </div>
</div>
<%@ include file="/WEB-INF/includes/footer.jspf" %>