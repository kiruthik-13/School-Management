<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:set var="pageTitle" value="Parent Portal" />
<% request.setAttribute("active", "dashboard"); %>
<%@ include file="/WEB-INF/includes/header.jspf" %>
<%@ include file="/WEB-INF/includes/sidebar.jspf" %>
<div class="col-lg-10 col-md-9 p-4">
    <h4 class="mb-4"><i class="bi bi-speedometer2"></i> Parent Portal</h4>

    <c:if test="${empty child}">
        <div class="alert alert-warning"><i class="bi bi-exclamation-circle"></i> ${message}</div>
    </c:if>

    <c:if test="${not empty child}">
        <div class="card p-4 mb-4">
            <div class="d-flex align-items-center justify-content-between">
                <div>
                    <h5 class="mb-1 text-primary">${child.fullName}</h5>
                    <div class="text-muted">
                        Adm No: ${child.admissionNo} &middot; ${child.className} - ${child.section} &middot; ${child.gender}
                    </div>
                </div>
                <div class="text-end">
                    <div class="small text-muted">Transport</div>
                    <div class="fw-semibold">${transport.route_name}</div>
                    <div class="small text-muted">${transport.vehicle_no} &middot; ${transport.driver_name}</div>
                </div>
            </div>
        </div>

        <div class="row g-3 mb-4">
            <div class="col-md-4">
                <div class="card stat-card p-3 text-center">
                    <div class="text-muted small">Attendance</div>
                    <div class="fs-4 fw-bold text-primary">${attendanceStats.present}/${attendanceStats.total}
                        <small class="fs-6 text-muted">(${attendanceStats.percentage}%)</small></div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card stat-card p-3 text-center">
                    <div class="text-muted small">Fee Dues</div>
                    <div class="fs-4 fw-bold text-warning">&#8377;${dues[0].remaining}</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card stat-card p-3 text-center">
                    <div class="text-muted small">Fees Paid</div>
                    <div class="fs-4 fw-bold text-success">&#8377;${dues[0].paid}</div>
                </div>
            </div>
        </div>

        <div class="row g-4">
            <div class="col-lg-6" id="attendance">
                <div class="card p-3 mb-4">
                    <h6>Recent Attendance</h6>
                    <table class="table table-sm align-middle mb-0">
                        <thead><tr><th>Date</th><th>Status</th></tr></thead>
                        <tbody>
                            <c:forEach items="${recentAttendance}" var="a">
                                <tr>
                                    <td>${a.attendanceDate}</td>
                                    <td><span class="badge ${a.status == 'PRESENT' ? 'bg-success' : a.status == 'ABSENT' ? 'bg-danger' : 'bg-warning text-dark'}">${a.status}</span></td>
                                </tr>
                            </c:forEach>
                            <c:if test="${empty recentAttendance}">
                                <tr><td colspan="2" class="text-muted text-center py-3">No attendance recorded yet.</td></tr>
                            </c:if>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="col-lg-6" id="marks">
                <div class="card p-3 mb-4">
                    <h6>Examination Marks</h6>
                    <table class="table table-sm align-middle mb-0">
                        <thead><tr><th>Exam</th><th>Subject</th><th>Marks</th><th>Grade</th></tr></thead>
                        <tbody>
                            <c:forEach items="${marks}" var="r">
                                <tr>
                                    <td>${r.examName}</td>
                                    <td>${r.subjectName}</td>
                                    <td>${r.marksObtained}/${r.maxMarks}</td>
                                    <td><span class="badge bg-success">${r.grade}</span></td>
                                </tr>
                            </c:forEach>
                            <c:if test="${empty marks}">
                                <tr><td colspan="4" class="text-muted text-center py-3">No results published yet.</td></tr>
                            </c:if>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="card p-3 mb-4" id="fees">
            <h6>Fee Status</h6>
            <table class="table table-sm align-middle mb-0">
                <thead><tr><th>Fee Type</th><th>Amount</th><th>Paid</th><th>Due Date</th><th>Remaining</th><th>Status</th></tr></thead>
                <tbody>
                    <c:forEach items="${dues}" var="d">
                        <tr>
                            <td class="fw-semibold">${d.fee_type}</td>
                            <td>&#8377;${d.amount}</td>
                            <td>&#8377;${d.paid}</td>
                            <td>${d.due_date}</td>
                            <td>&#8377;${d.remaining}</td>
                            <td><span class="badge ${d.status == 'PAID' ? 'bg-success' : d.status == 'PARTIAL' ? 'bg-warning text-dark' : 'bg-danger'}">${d.status}</span></td>
                        </tr>
                    </c:forEach>
                    <tr class="table-light">
                        <td colspan="5" class="text-end fw-bold">Payments received:</td>
                        <td colspan="1" class="fw-bold">&#8377;${dues[0].paid}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="d-flex gap-2">
            <a href="${pageContext.request.contextPath}/messages" class="btn btn-primary"><i class="bi bi-envelope"></i> Message a Teacher</a>
        </div>
    </c:if>
</div>
<%@ include file="/WEB-INF/includes/footer.jspf" %>