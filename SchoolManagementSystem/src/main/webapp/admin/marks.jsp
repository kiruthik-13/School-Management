<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:set var="pageTitle" value="Enter Marks" />
<% request.setAttribute("active", "marks"); %>
<%@ include file="/WEB-INF/includes/header.jspf" %>
<%@ include file="/WEB-INF/includes/sidebar.jspf" %>
<div class="col-lg-10 col-md-9 p-4">
    <h4 class="mb-4"><i class="bi bi-clipboard-data"></i> Marks Entry</h4>

    <c:if test="${not empty msg}"><div class="alert alert-success py-2">${msg}</div></c:if>

    <form method="get" action="${pageContext.request.contextPath}/marks" class="row g-2 bg-white p-3 rounded shadow-sm mb-3 align-items-end">
        <div class="col-md-4">
            <label class="form-label small mb-0">Select Exam</label>
            <select name="examId" class="form-select form-select-sm">
                <option value="">-- choose exam --</option>
                <c:forEach items="${exams}" var="e">
                    <option value="${e.examId}" ${exam.examId == e.examId ? 'selected' : ''}>${e.examName} - ${e.className}</option>
                </c:forEach>
            </select>
        </div>
        <div class="col-md-2">
            <button class="btn btn-sm btn-outline-primary w-100">Load</button>
        </div>
    </form>

    <c:if test="${not empty exam}">
        <div class="card p-3 mb-3">
            <h6><b>${exam.examName}</b> - ${exam.className} (${exam.examDate})</h6>
            <form method="post" action="${pageContext.request.contextPath}/result/save">
                <input type="hidden" name="examId" value="${exam.examId}">
                <div class="d-flex align-items-center gap-2 mb-2">
                    <label class="form-label small mb-0">Max Marks per subject:</label>
                    <input type="number" name="max_marks" class="form-control form-control-sm" style="width:100px" value="100">
                </div>
                <div class="table-responsive">
                    <table class="table table-bordered table-hover align-middle">
                        <thead>
                            <tr class="text-center">
                                <th>Student</th>
                                <c:forEach items="${subjects}" var="sub">
                                    <th>${sub.subjectName}</th>
                                </c:forEach>
                                <th>Report</th>
                            </tr>
                        </thead>
                        <tbody>
                            <c:forEach items="${students}" var="s">
                                <tr>
                                    <td class="fw-semibold text-nowrap">${s.fullName}</td>
                                    <c:forEach items="${subjects}" var="sub">
                                        <td class="text-center">
                                            <%
                                                com.school.model.ExamResult er = null;
                                                java.util.Map m = (java.util.Map) request.getAttribute("existing");
                                                if (m != null && pageContext.getAttribute("s") != null && pageContext.getAttribute("sub") != null) {
                                                    er = (com.school.model.ExamResult) m.get(
                                                            ((com.school.model.Student) pageContext.getAttribute("s")).getStudentId()
                                                            + "_" + ((com.school.model.Subject) pageContext.getAttribute("sub")).getSubjectId());
                                                }
                                                String val = (er == null) ? "" : String.valueOf((long) er.getMarksObtained());
                                            %>
                                            <input type="number" step="0.5" min="0" max="100"
                                                   name="m_${sub.subjectId}_${s.studentId}"
                                                   class="form-control form-control-sm text-center" style="width:90px; display:inline-block;"
                                                   value="<%= val %>">
                                        </td>
                                    </c:forEach>
                                    <td class="text-center">
                                        <a href="${pageContext.request.contextPath}/report?examId=${exam.examId}&studentId=${s.studentId}"
                                           class="btn btn-sm btn-outline-info">Report Card</a>
                                    </td>
                                </tr>
                            </c:forEach>
                            <c:if test="${empty students}">
                                <tr><td colspan="${subjects.size() + 2}" class="text-center text-muted py-3">No students in this class.</td></tr>
                            </c:if>
                        </tbody>
                    </table>
                </div>
                <c:if test="${not empty students}">
                    <button class="btn btn-primary"><i class="bi bi-save"></i> Save Marks</button>
                </c:if>
            </form>
        </div>
    </c:if>

    <c:if test="${empty exams}">
        <div class="alert alert-info">No exams have been scheduled yet.</div>
    </c:if>
</div>
<%@ include file="/WEB-INF/includes/footer.jspf" %>