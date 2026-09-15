<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Login - School Management System</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <style>
        body { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0d6efd, #6610f2); }
        .card { width: 100%; max-width: 420px; border: 0; border-radius: 1rem; box-shadow: 0 10px 40px rgba(0,0,0,.3); }
    </style>
</head>
<body>
    <div class="card">
        <div class="card-body p-4">
            <div class="text-center mb-4">
                <i class="bi bi-mortarboard-fill text-primary" style="font-size:3rem;"></i>
                <h3 class="mt-2 fw-bold">School Management</h3>
                <p class="text-muted">Sign in to continue</p>
            </div>

            <c:if test="${not empty error}">
                <div class="alert alert-danger py-2">${error}</div>
            </c:if>
            <c:if test="${not empty info}">
                <div class="alert alert-info py-2">${info}</div>
            </c:if>

            <form method="post" action="${pageContext.request.contextPath}/login">
                <div class="mb-3">
                    <label class="form-label">Username</label>
                    <input type="text" name="username" class="form-control" required autofocus>
                </div>
                <div class="mb-3">
                    <label class="form-label">Password</label>
                    <input type="password" name="password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary w-100 fw-semibold">Sign In</button>
            </form>

            <hr>
            <div class="text-muted small">
                <div class="fw-semibold mb-1">Demo accounts</div>
                <div>admin / admin123</div>
                <div>teacher1 / teacher123</div>
                <div>parent1 / parent123</div>
            </div>
        </div>
    </div>
</body>
</html>