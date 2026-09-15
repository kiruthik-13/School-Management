<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:set var="pageTitle" value="Transport" />
<% request.setAttribute("active", "transport"); %>
<%@ include file="/WEB-INF/includes/header.jspf" %>
<%@ include file="/WEB-INF/includes/sidebar.jspf" %>
<div class="col-lg-10 col-md-9 p-4">
    <h4 class="mb-4"><i class="bi bi-bus-front"></i> Transport</h4>

    <div class="row g-4">
        <div class="col-lg-5">
            <div class="card p-4 mb-4">
                <h6>Add Route</h6>
                <form method="post" action="${pageContext.request.contextPath}/transport/save" class="row g-2">
                    <div class="col-6"><input type="text" name="routeName" class="form-control form-control-sm" placeholder="Route name" required></div>
                    <div class="col-6"><input type="text" name="vehicleNo" class="form-control form-control-sm" placeholder="Vehicle no"></div>
                    <div class="col-8"><input type="text" name="driverName" class="form-control form-control-sm" placeholder="Driver name"></div>
                    <div class="col-4"><input type="number" name="fare" class="form-control form-control-sm" placeholder="Fare" step="0.01" required></div>
                    <div class="col-12"><button class="btn btn-primary btn-sm"><i class="bi bi-plus-lg"></i> Add Route</button></div>
                </form>
            </div>

            <div class="card p-4 mb-4">
                <h6>Assign Route to Student</h6>
                <c:forEach items="${routes}" var="r" varStatus="i">
                    <form method="post" action="${pageContext.request.contextPath}/transport/assign" class="row g-2 align-items-center mb-1">
                        <div class="col-4"><span class="fw-semibold">${r.routeName}</span> (${r.vehicleNo})</div>
                        <input type="hidden" name="routeId" value="${r.routeId}">
                        <div class="col-5">
                            <select name="studentId" class="form-select form-select-sm">
                                <option value="">-- student --</option>
                                <c:forEach items="${assignments}" var="a">
                                    <c:if test="${a.route_name == '-' || a.route_name == r.routeName}">
                                        <option value="${a.student_id}">${a.student_name}</option>
                                    </c:if>
                                </c:forEach>
                            </select>
                        </div>
                        <div class="col-3"><button class="btn btn-sm btn-outline-primary w-100">Assign</button></div>
                    </form>
                </c:forEach>
            </div>

            <div class="card p-3">
                <table class="table table-sm mb-0">
                    <thead><tr><th>Route</th><th>Vehicle</th><th>Driver</th><th>Fare</th></tr></thead>
                    <tbody>
                        <c:forEach items="${routes}" var="r">
                            <tr>
                                <td>${r.routeName}</td>
                                <td>${r.vehicleNo}</td>
                                <td>${r.driverName}</td>
                                <td>&#8377;${r.fare}</td>
                            </tr>
                        </c:forEach>
                        <c:if test="${empty routes}">
                            <tr><td colspan="4" class="text-muted text-center py-3">No routes yet.</td></tr>
                        </c:if>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="col-lg-7">
            <div class="card p-3">
                <h6>Student Assignments</h6>
                <table class="table table-hover align-middle mb-0">
                    <thead><tr><th>Student</th><th>Class</th><th>Route</th><th>Vehicle</th><th class="text-end">Action</th></tr></thead>
                    <tbody>
                        <c:forEach items="${assignments}" var="a">
                            <tr>
                                <td class="fw-semibold">${a.student_name}</td>
                                <td>${a.class_name} - ${a.section}</td>
                                <td>${a.route_name}</td>
                                <td>${a.vehicle_no}</td>
                                <td class="text-end">
                                    <c:if test="${a.route_name != '-'}">
                                        <a href="${pageContext.request.contextPath}/transport/remove?studentId=${a.student_id}"
                                           class="btn btn-sm btn-outline-danger" onclick="return confirm('Remove route?');"><i class="bi bi-x-lg"></i></a>
                                    </c:if>
                                </td>
                            </tr>
                        </c:forEach>
                        <c:if test="${empty assignments}">
                            <tr><td colspan="5" class="text-center text-muted py-4">No students found.</td></tr>
                        </c:if>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
<%@ include file="/WEB-INF/includes/footer.jspf" %>