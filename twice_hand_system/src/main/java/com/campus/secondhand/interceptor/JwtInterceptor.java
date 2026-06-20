package com.campus.secondhand.interceptor;

import com.campus.secondhand.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    public static final String ATTR_USER_ID = "currentUserId";

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;

        String token = extractToken(request);
        if (token == null || token.isEmpty()) {
            return reject(response, 401, "{\"code\":40100,\"message\":\"unauthorized\"}");
        }
        if (!jwtUtil.validate(token, JwtUtil.TYPE_ACCESS)) {
            return reject(response, 401, "{\"code\":40100,\"message\":\"invalid or expired token\"}");
        }

        Long userId = jwtUtil.getUserIdFromToken(token);
        request.setAttribute(ATTR_USER_ID, userId);
        return true;
    }

    private String extractToken(HttpServletRequest request) {
        String h = request.getHeader("token");
        if (h != null && !h.isEmpty()) return h;
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return auth.substring(7);
        return null;
    }

    private boolean reject(HttpServletResponse response, int status, String body) {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        try (PrintWriter w = response.getWriter()) {
            w.write(body);
        } catch (Exception ignored) {}
        return false;
    }
}
