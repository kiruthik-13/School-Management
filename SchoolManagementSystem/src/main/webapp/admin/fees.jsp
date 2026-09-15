<%@ page contentType="text/html;charset=UTF-8" %>
<%@ page import="com.school.util.Constants" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<% pageContext.setAttribute("classes", Constants.CLASSES);
   pageContext.setAttribute("modes", Constants.PAYMENT_MODES); %>
<c:set var="pageTitle" value="Fee Structure" />
<% request.setAttribute("active", "fees"); %>
<%@ include file="/WEB-INF/includes/header.jspf" %>
<%@ include file="/WEB-INF/includes/sidebar.jspf" %>
<div class="col-lg-10 col-md-9 p-4">
    <h4 class="mb-4"><i class="bi bi-cash-coin"></i> Fee Structure</h4>

    <div class="card p-4 mb-4" style="max-width:640px;">
        <h6>Add Fee Item</h6>
        <form method="post" action="${pageContext.request.contextPath}/fee/save" class="row g-2">
            <div class="col-md-3">
                <select name="className" class="form-select form-select-sm" required>
                    <option value="">Class</option>
                    <c:forEach items="${classes}" var="c"><option>${c}</option></c:forEach>
                </select>
            </div>
            <div class="col-md-3">
                <input type="text" name="feeType" class="form-control form-control-sm" placeholder="Fee type" required>
            </div>
            <div class="col-md-2">
                <input type="number" name="amount" class="form-control form-control-sm" placeholder="Amount" step="0.01" required>
            </div>
            <div class="col-md-2">
                <input type="date" name="dueDate" class="form-control form-control-sm">
            </div>
            <div class="col-md-2">
                <button class="btn btn-primary btn-sm w-100"><i class="bi bi-plus-lg"></i> Add</button>
            </div>
        </form>
    </div>

    <div class="card">
        <table class="table table-hover align-middle mb-0">
            <thead><tr><th>Class</th><th>Fee Type</th><th>Amount (&#8377;)</th><th>Due Date</th><th class="text-end">Action</th></tr></thead>
            <tbody>
                <c:forEach items="${feeStructures}" var="f">
                    <tr>
                        <td>${f.className}</td>
                        <td class="fw-semibold">${f.feeType}</td>
                        <td>${f.amount}</td>
                        <td>${f.dueDate}</td>
                        <td class="text-end">
                            <a href="${pageContext.request.contextPath}/fee/delete?id=${f.feeStructureId}" class="btn btn-sm btn-outline-danger"
                               onclick="return confirm('Delete fee item?');"><i class="bi bi-trash"></i></a>
                        </td>
                    </tr>
                </c:forEach>
                <c:if test="${empty feeStructures}">
                    <tr><td colspan="5" class="text-center text-muted py-4">No fee items defined.</td></tr>
                </c:if>
            </tbody>
        </table>
    </div>
</div>
<%@ include file="/WEB-INF/includes/footer.jspf" %>