<%@ page contentType="text/html;charset=UTF-8" %>
<%@ page import="java.util.Map" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:set var="pageTitle" value="Admin Dashboard" />
<% request.setAttribute("active", "dashboard"); %>
<%@ include file="/WEB-INF/includes/header.jspf" %>
<%@ include file="/WEB-INF/includes/sidebar.jspf" %>
<div class="col-lg-10 col-md-9 p-4">
    <h4 class="mb-4"><i class="bi bi-speedometer2"></i> Admin Dashboard</h4>

    <div class="row g-3 mb-4">
        <div class="col-md-3">
            <div class="card stat-card p-3">
                <div class="text-muted small">Active Students</div>
                <div class="fs-3 fw-bold text-primary">${studentCount}</div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card stat-card p-3">
                <div class="text-muted small">Teachers</div>
                <div class="fs-3 fw-bold text-success">${teacherCount}</div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card stat-card p-3">
                <div class="text-muted small">Present Today</div>
                <div class="fs-3 fw-bold text-info">${presentToday} <small class="text-danger">/${absentToday} absent</small></div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card stat-card p-3">
                <div class="text-muted small">Fees Collected</div>
                <div class="fs-3 fw-bold text-warning">&#8377;${feeCollected}</div>
            </div>
        </div>
    </div>

    <div class="row g-4">
        <div class="col-lg-7">
            <div class="card p-3">
                <h6>Students per Class</h6>
                <canvas id="classChart" height="220"></canvas>
            </div>
        </div>
        <div class="col-lg-5">
            <div class="card p-3">
                <h6>Class Overview</h6>
                <table class="table table-sm table-striped mt-2">
                    <thead><tr><th>Class</th><th>Section</th><th>Students</th></tr></thead>
                    <tbody>
                        <c:forEach items="${classCounts}" var="row">
                            <tr>
                                <td>${row.class_name}</td>
                                <td>${row.section}</td>
                                <td><span class="badge bg-primary">${row.count}</span></td>
                            </tr>
                        </c:forEach>
                        <c:if test="${empty classCounts}">
                            <tr><td colspan="3" class="text-muted">No student data yet.</td></tr>
                        </c:if>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
<script>
const labels = [];
const counts = [];
<c:forEach items="${classCounts}" var="row">
labels.push('${row.class_name} ${row.section}');
counts.push(${row.count});
</c:forEach>
new Chart(document.getElementById('classChart'), {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Students', data: counts, backgroundColor: '#4f46e5' }] },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
});
</script>
<%@ include file="/WEB-INF/includes/footer.jspf" %>