<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:set var="pageTitle" value="Reports" />
<% request.setAttribute("active", "reports"); %>
<%@ include file="/WEB-INF/includes/header.jspf" %>
<%@ include file="/WEB-INF/includes/sidebar.jspf" %>
<div class="col-lg-10 col-md-9 p-4">
    <h4 class="mb-4"><i class="bi bi-bar-chart"></i> Reports</h4>

    <div class="row g-3 mb-4">
        <div class="col-md-3"><div class="card stat-card p-3"><div class="text-muted small">Students</div><div class="fs-3 fw-bold text-primary">${studentCount}</div></div></div>
        <div class="col-md-3"><div class="card stat-card p-3"><div class="text-muted small">Teachers</div><div class="fs-3 fw-bold text-success">${teacherCount}</div></div></div>
        <div class="col-md-3"><div class="card stat-card p-3"><div class="text-muted small">Present Today</div><div class="fs-3 fw-bold text-info">${presentToday}</div></div></div>
        <div class="col-md-3"><div class="card stat-card p-3"><div class="text-muted small">Fees Collected</div><div class="fs-3 fw-bold text-warning">&#8377;${totalCollected}</div></div></div>
    </div>

    <div class="row g-4">
        <div class="col-lg-6">
            <div class="card p-3">
                <h6>Students per Class</h6>
                <canvas id="stuChart" height="220"></canvas>
            </div>
        </div>
        <div class="col-lg-6">
            <div class="card p-3">
                <h6>Fees Collected per Class</h6>
                <canvas id="feeChart" height="220"></canvas>
            </div>
        </div>
    </div>

    <div class="card mt-4 p-3">
        <h6>Fee Structure</h6>
        <table class="table table-sm table-striped mb-0">
            <thead><tr><th>Class</th><th>Fee Type</th><th>Amount</th><th>Due Date</th></tr></thead>
            <tbody>
                <c:forEach items="${feeStructures}" var="f">
                    <tr><td>${f.className}</td><td>${f.feeType}</td><td>&#8377;${f.amount}</td><td>${f.dueDate}</td></tr>
                </c:forEach>
            </tbody>
        </table>
    </div>
</div>
<script>
const classLabels = [], stuCounts = [], feeCounts = [];
<c:forEach items="${classCounts}" var="row">
classLabels.push('${row.class_name} ${row.section}');
stuCounts.push(${row.count});
</c:forEach>
<c:forEach items="${feeByClass}" var="row">
feeCounts.push(${row.total});
</c:forEach>
new Chart(document.getElementById('stuChart'), { type: 'bar', data: { labels: classLabels, datasets: [{ label: 'Students', data: stuCounts, backgroundColor: '#4f46e5' }] }, options: { plugins: { legend: { display: false } } } });
new Chart(document.getElementById('feeChart'), { type: 'bar', data: { labels: classLabels, datasets: [{ label: 'Fees collected (Rs)', data: feeCounts, backgroundColor: '#10b981' }] }, options: { plugins: { legend: { display: false } } } });
</script>
<%@ include file="/WEB-INF/includes/footer.jspf" %>