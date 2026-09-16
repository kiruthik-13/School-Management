<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Login - School Management System</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <style>
        :root {
            --bs-primary: #4f46e5;
            --bs-primary-rgb: 79, 70, 229;
            --bs-link-color: #4f46e5;
            --bs-link-hover-color: #4338ca;
            --bs-body-font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        body {
            font-family: var(--bs-body-font-family); color: #1f2937; -webkit-font-smoothing: antialiased;
            background: #f4f6fb; min-height: 100vh; margin: 0;
        }
        .auth-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
        .auth-panel {
            width: 100%; max-width: 980px; display: flex; background: #fff; overflow: hidden;
            border-radius: 1.25rem; box-shadow: 0 20px 60px -20px rgba(15,23,42,.25); border: 1px solid #eef1f7;
        }
        .auth-brand {
            flex: 1; padding: 3rem 2.5rem; color: #fff; position: relative; overflow: hidden;
            background: linear-gradient(150deg, #312e81 0%, #4f46e5 55%, #7c3aed 100%);
        }
        .auth-brand::after {
            content: ''; position: absolute; right: -4rem; top: -4rem; width: 16rem; height: 16rem;
            border-radius: 50%; background: rgba(255,255,255,.08);
        }
        .auth-brand::before {
            content: ''; position: absolute; right: 2rem; bottom: -6rem; width: 12rem; height: 12rem;
            border-radius: 50%; background: rgba(255,255,255,.06);
        }
        .auth-brand .icon { width: 56px; height: 56px; display: inline-flex; align-items: center; justify-content: center; border-radius: 1rem; background: rgba(255,255,255,.15); font-size: 1.6rem; }
        .feature { display: flex; gap: .9rem; margin-top: 1.4rem; }
        .feature i { font-size: 1.1rem; color: #c7d2fe; margin-top: .15rem; }
        .feature div strong { font-weight: 600; }
        .auth-form { flex: 1; padding: 3rem 2.5rem; }
        .form-control, .form-select { border-radius: .65rem; border-color: #d6dbe4; }
        .form-control:focus { border-color: #a5b4fc; box-shadow: 0 0 0 .2rem rgba(79,70,229,.15); }
        .form-label { font-weight: 600; color: #374151; font-size: .85rem; }
        .btn-primary {
            border-radius: .65rem; font-weight: 600;
            --bs-btn-bg: #4f46e5; --bs-btn-border-color: #4f46e5;
            --bs-btn-hover-bg: #4338ca; --bs-btn-hover-border-color: #4338ca;
            background-image: linear-gradient(135deg, #4f46e5, #6366f1);
            --bs-btn-active-bg: #3730a3; --bs-btn-active-border-color: #3730a3;
        }
        .alert { border: 0; border-radius: .8rem; border-left: 4px solid; }
        .alert-danger { background: #fef2f2; color: #991b1b; border-left-color: #ef4444; }
        .alert-info { background: #ecfeff; color: #0e7490; border-left-color: #06b6d4; }
        .demo-box { background: #f8fafc; border: 1px dashed #e5e7eb; border-radius: .8rem; }
        @media (max-width: 767.98px) { .auth-brand { display: none; } }
    </style>
</head>
<body>
    <div class="auth-wrap">
        <div class="auth-panel">
            <div class="auth-brand d-none d-md-flex flex-column justify-content-between">
                <div>
                    <span class="icon"><i class="bi bi-mortarboard-fill"></i></span>
                    <h2 class="fw-bold mt-4 mb-1">School Management</h2>
                    <p class="text-white-50 mb-0" style="font-weight:500;">One platform for the entire campus.</p>
                    <hr class="border-white-50 my-4" style="opacity:.15;">
                    <div class="feature">
                        <i class="bi bi-people-fill"></i>
                        <div><strong>Students & Teachers</strong><div class="text-white-50">Admissions, classes, subjects and staff records.</div></div>
                    </div>
                    <div class="feature">
                        <i class="bi bi-calendar-check-fill"></i>
                        <div><strong>Attendance & Results</strong><div class="text-white-50">Daily attendance tracking and exam report cards.</div></div>
                    </div>
                    <div class="feature">
                        <i class="bi bi-cash-coin"></i>
                        <div><strong>Fees & Transport</strong><div class="text-white-50">Fee collection, dues and bus route management.</div></div>
                    </div>
                    <div class="feature">
                        <i class="bi bi-chat-dots-fill"></i>
                        <div><strong>Communication</strong><div class="text-white-50">Secure messages between parents, teachers and admin.</div></div>
                    </div>
                </div>
                <p class="mb-0 small text-white-50">&copy; 2026 School Management System</p>
            </div>

            <div class="auth-form d-flex flex-column justify-content-center">
                <div class="text-center mb-4 d-md-none">
                    <i class="bi bi-mortarboard-fill text-primary" style="font-size:2.5rem;"></i>
                </div>
                <div class="d-flex align-items-center gap-2 mb-3">
                    <span class="d-flex align-items-center justify-content-center rounded-3 text-white" style="width:42px;height:42px;background:linear-gradient(135deg,#4f46e5,#7c3aed);font-size:1.1rem;"><i class="bi bi-mortarboard-fill"></i></span>
                    <div class="lh-1">
                        <strong class="d-block" style="font-size:1.05rem;">Welcome back</strong>
                        <small class="text-muted">Sign in to your account</small>
                    </div>
                </div>

                <c:if test="${not empty error}">
                    <div class="alert alert-danger py-2"><i class="bi bi-exclamation-triangle"></i> ${error}</div>
                </c:if>
                <c:if test="${not empty info}">
                    <div class="alert alert-info py-2"><i class="bi bi-info-circle"></i> ${info}</div>
                </c:if>

                <form method="post" action="${pageContext.request.contextPath}/login">
                    <div class="mb-3">
                        <label class="form-label">Username</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="bi bi-person"></i></span>
                            <input type="text" name="username" class="form-control" placeholder="Enter your username" required autofocus>
                        </div>
                    </div>
                    <div class="mb-4">
                        <label class="form-label">Password</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="bi bi-lock"></i></span>
                            <input type="password" name="password" class="form-control" placeholder="Enter your password" required>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary w-100 py-2">Sign In <i class="bi bi-arrow-right"></i></button>
                </form>

                <div class="demo-box p-3 mt-4">
                    <div class="small fw-semibold mb-2 text-secondary"><i class="bi bi-info-circle"></i> Demo accounts</div>
                    <div class="row g-2 small text-muted">
                        <div class="col-6"><i class="bi bi-person-badge text-primary"></i> admin / admin123</div>
                        <div class="col-6"><i class="bi bi-person-workspace text-success"></i> teacher1 / teacher123</div>
                        <div class="col-6"><i class="bi bi-people text-warning"></i> parent1 / parent123</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>