<%@ page contentType="text/html;charset=UTF-8" isErrorPage="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Error - School Management System</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background: #f4f6fb; min-height: 100vh; display: flex; align-items: center; }
        .error-card {
            max-width: 520px; margin: 0 auto; border-radius: 1.25rem; border: 1px solid #eef1f7;
            box-shadow: 0 20px 60px -20px rgba(15,23,42,.2); background: #fff; text-align: center; padding: 3rem 2.5rem;
        }
        .error-icon {
            width: 72px; height: 72px; margin: 0 auto; display: flex; align-items: center; justify-content: center;
            border-radius: 1.25rem; font-size: 2.2rem; color: #f59e0b;
            background: linear-gradient(135deg, #fffbeb, #fef3c7);
        }
        .btn-primary {
            border-radius: .65rem; font-weight: 600;
            --bs-btn-bg: #4f46e5; --bs-btn-border-color: #4f46e5;
            --bs-btn-hover-bg: #4338ca; --bs-btn-hover-border-color: #4338ca;
        }
    </style>
</head>
<body>
<div class="container py-5">
    <div class="error-card">
        <div class="error-icon"><i class="bi bi-exclamation-triangle"></i></div>
        <h3 class="mt-4 fw-bold text-dark">Something went wrong</h3>
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
        <a href="${pageContext.request.contextPath}/index.jsp" class="btn btn-primary px-4"><i class="bi bi-house-door"></i> Go to Home</a>
    </div>
</div>
</body>
</html>