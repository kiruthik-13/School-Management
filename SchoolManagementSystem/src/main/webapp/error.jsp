<%@ page contentType="text/html;charset=UTF-8" isErrorPage="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Error - School Management System</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
<div class="container py-5 text-center">
    <div class="display-1 text-warning"><i class="bi bi-exclamation-triangle"></i></div>
    <h2 class="mt-3">Something went wrong</h2>
    <p class="text-muted">
        <c:choose>
            <c:when test="${not empty requestScope['javax.servlet.error.message']}">
                ${requestScope['javax.servlet.error.message']}
            </c:when>
            <c:otherwise>
                The page you requested could not be processed. Please go back and try again.
            </c:otherwise>
        </c:choose>
    </p>
    <a href="${pageContext.request.contextPath}/index.jsp" class="btn btn-primary">Go to Home</a>
</div>
</body>
</html>