package com.campus.secondhand.interceptor;

import com.campus.secondhand.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 放行OPTIONS请求（跨域预检）
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }

        // 注意：若前端传的是token头（无Bearer），则直接取token；若传Authorization则取Bearer后的内容
        String token = request.getHeader("token");
        if (token == null) {
            token = request.getHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
        }

        // Token为空，返回401
        if (token == null || token.isEmpty()) {
            return returnUnauthorized(response, "未登录");
        }

        // 验证Token有效性
        if (!jwtUtil.validateToken(token)) {
            return returnUnauthorized(response, "Token已过期或无效");
        }

        // 解析用户ID，存入request供后续使用
        Long userId = jwtUtil.getUserIdFromToken(token);
        request.setAttribute("userId", userId);
        return true;
    }

    /**
     * 私有方法：统一返回401响应
     */
    private boolean returnUnauthorized(HttpServletResponse response, String message) {
        response.setStatus(401);
        response.setContentType("application/json;charset=UTF-8");
        try {
            response.getWriter().write(String.format("{\"code\":401,\"message\":\"%s\"}", message));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }
}