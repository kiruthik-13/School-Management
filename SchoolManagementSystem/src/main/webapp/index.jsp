<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:redirect url="${not empty user ? (user.role == 'ADMIN' ? 'admin' : user.role == 'TEACHER' ? 'teacher' : 'parent') : 'login'}" />