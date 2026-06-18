package com.campus.secondhand.controller;

import com.campus.secondhand.dto.LoginRequest;
import com.campus.secondhand.dto.RegisterRequest;
import com.campus.secondhand.dto.TokenResponse;
import com.campus.secondhand.entity.User;
import com.campus.secondhand.enums.ErrorCode;
import com.campus.secondhand.exception.BusinessException;
import com.campus.secondhand.response.Result;
import com.campus.secondhand.service.UserService;
import com.campus.secondhand.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${jwt.access-expire-seconds}")
    private long accessExpire;

    @PostMapping("/login")
    public Result<TokenResponse> login(@RequestBody LoginRequest request) {
        User user = userService.login(request);
        return Result.ok(new TokenResponse(
                jwtUtil.generateAccessToken(user.getId()),
                jwtUtil.generateRefreshToken(user.getId()),
                accessExpire,
                user
        ));
    }

    @PostMapping("/register")
    public Result<User> register(@RequestBody RegisterRequest request) {
        Long userId = userService.register(request);
        return Result.ok(userService.getUserById(userId));
    }

    @PostMapping("/refresh")
    public Result<TokenResponse> refresh(@RequestBody Map<String, String> body) {
        String refresh = body.get("refreshToken");
        if (refresh == null || !jwtUtil.validate(refresh, JwtUtil.TYPE_REFRESH)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "invalid refresh token");
        }
        Long userId = jwtUtil.getUserIdFromToken(refresh);
        User user = userService.getUserById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "user not found");
        }
        return Result.ok(new TokenResponse(
                jwtUtil.generateAccessToken(userId),
                jwtUtil.generateRefreshToken(userId),
                accessExpire,
                user
        ));
    }
}
