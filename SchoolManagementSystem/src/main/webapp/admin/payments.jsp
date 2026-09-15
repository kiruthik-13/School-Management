<%@ page contentType="text/html;charset=UTF-8" %>
<%@ page import="com.school.util.Constants" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<% pageContext.setAttribute("modes", Constants.PAYMENT_MODES); %>
<c:set var="pageTitle" value="Fee Payments" />
<% request.setAttribute("active", "payments"); %>
<%@ include file="/WEB-INF/includes/header.jspf" %>
<%@ include file="/WEB-INF/includes/sidebar.jspf" %>
<div class="col-lg-10 col-md-9 p-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h4><i class="bi bi-receipt"></i> Fee Payments</h4>
        <span class="fs-5">Total collected: <b class="text-success">&#8377;${totalCollected}</b></span>
    </div>
    <c:if test="${param.ok == '1'}"><div class="alert alert-success py-2">Payment recorded.</div></c:if>

    <div class="card p-4 mb-4" style="max-width:760px;">
        <h6>Record Payment</h6>
        <form method="post" action="${pageContext.request.contextPath}/payment/save" class="row g-2">
            <div class="col-md-4">
                <select name="studentId" class="form-select form-select-sm" required>
                    <option value="">-- student --</option>
                    <c:forEach items="${students}" var="s">
                        <option value="${s.studentId}">${s.admissionNo} - ${s.fullName} (${s.className})</option>
                    </c:forEach>
                </select>
            </div>
            <div class="col-md-4">
                <select name="feeStructureId" class="form-select form-select-sm" required>
                    <option value="">-- fee item --</option>
                    <c:forEach items="${feeStructures}" var="f">
                        <option value="${f.feeStructureId}">${f.className} ${f.feeType} (&#8377;${f.amount})</option>
                    </c:forEach>
                </select>
            </div>
            <div class="col-md-2">
                <input type="number" name="amountPaid" class="form-control form-control-sm" placeholder="Amount" step="0.01" required>
            </div>
            <div class="col-md-2">
                <select name="paymentMode" class="form-select form-select-sm">
                    <c:forEach items="${modes}" var="m"><option>${m}</option></c:forEach>
                </select>
            </div>
            <div class="col-12">
                <button class="btn btn-primary btn-sm"><i class="bi bi-check-lg"></i> Record Payment</button>
            </div>
        </form>
    </div>

    <div class="card">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead><tr><th>Receipt</th><th>Student</th><th>Class</th><th>Fee</th><th>Amount</th><th>Date</th><th>Mode</th><th>Status</th></tr></thead>
                <tbody>
                    <c:forEach items="${payments}" var="p">
                        <tr>
                            <td>#${p.paymentId}</td>
                            <td class="fw-semibold">${p.studentName}</td>
                            <td>${p.className}</td>
                            <td>${p.feeType}</td>
                            <td>&#8377;${p.amountPaid}</td>
                            <td>${p.paymentDate}</td>
                            <td><span class="badge bg-secondary">${p.paymentMode}</span></td>
                            <td><span class="badge ${p.status == 'PAID' ? 'bg-success' : p.status == 'PARTIAL' ? 'bg-warning text-dark' : 'bg-danger'}">${p.status}</span></td>
                        </tr>
                    </c:forEach>
                    <c:if test="${empty payments}">
                        <tr><td colspan="8" class="text-center text-muted py-4">No payments recorded.</td></tr>
                    </c:if>
                </tbody>
            </table>
        </div>
    </div>
</div>
<%@ include file="/WEB-INF/includes/footer.jspf" %>