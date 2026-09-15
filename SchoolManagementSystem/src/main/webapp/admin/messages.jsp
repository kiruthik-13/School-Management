<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:set var="pageTitle" value="Messages" />
<% request.setAttribute("active", "messages"); %>
<%@ include file="/WEB-INF/includes/header.jspf" %>
<%@ include file="/WEB-INF/includes/sidebar.jspf" %>
<div class="col-lg-10 col-md-9 p-4">
    <h4 class="mb-4"><i class="bi bi-envelope"></i> Messages</h4>
    <c:if test="${param.ok == '1'}"><div class="alert alert-success py-2">Message sent.</div></c:if>

    <div class="card p-4 mb-4" style="max-width:720px;">
        <h6>Compose</h6>
        <form method="post" action="${pageContext.request.contextPath}/message/send" class="row g-2">
            <div class="col-md-5">
                <select name="receiverId" class="form-select form-select-sm" required>
                    <option value="">-- recipient --</option>
                    <c:forEach items="${receivers}" var="r">
                        <option value="${r.userId}">${r.username} (${r.role})</option>
                    </c:forEach>
                </select>
            </div>
            <div class="col-md-4">
                <select name="studentId" class="form-select form-select-sm">
                    <option value="">Related student (optional)</option>
                    <c:forEach items="${students}" var="s">
                        <option value="${s.studentId}">${s.admissionNo} - ${s.fullName}</option>
                    </c:forEach>
                </select>
            </div>
            <div class="col-md-3">
                <input type="text" name="subject" class="form-control form-control-sm" placeholder="Subject" required>
            </div>
            <div class="col-12">
                <textarea name="messageBody" class="form-control form-control-sm" rows="2" placeholder="Message" required></textarea>
            </div>
            <div class="col-12">
                <button class="btn btn-primary btn-sm"><i class="bi bi-send"></i> Send</button>
            </div>
        </form>
    </div>

    <div class="card">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead><tr><th>From</th><th>Role</th><th>Student</th><th>Subject</th><th>Message</th><th>Time</th></tr></thead>
                <tbody>
                    <c:forEach items="${messages}" var="m">
                        <tr>
                            <td class="fw-semibold">${m.senderName}</td>
                            <td><span class="badge bg-secondary">${m.senderRole}</span></td>
                            <td>${m.studentName}</td>
                            <td>${m.subject}</td>
                            <td class="text-truncate" style="max-width:280px;">${m.messageBody}</td>
                            <td class="small text-muted text-nowrap">${m.sentAt}</td>
                        </tr>
                    </c:forEach>
                    <c:if test="${empty messages}">
                        <tr><td colspan="6" class="text-center text-muted py-4">No messages.</td></tr>
                    </c:if>
                </tbody>
            </table>
        </div>
    </div>
</div>
<%@ include file="/WEB-INF/includes/footer.jspf" %>