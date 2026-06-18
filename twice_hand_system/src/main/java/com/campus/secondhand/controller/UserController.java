package com.campus.secondhand.controller;

import com.campus.secondhand.dto.LoginRequest;
import com.campus.secondhand.dto.RegisterRequest;
import com.campus.secondhand.entity.User;
import com.campus.secondhand.response.Result;
import com.campus.secondhand.service.UserService;
import com.campus.secondhand.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody LoginRequest request) {
        String token = userService.login(request);
        User user = userService.getUserByUsername(request.getUsername());
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("user", user);
        return Result.success(data);
    }

    @PostMapping("/register")
    public Result<User> register(@RequestBody RegisterRequest request) {
        Long userId = userService.register(request);
        User user = userService.getUserById(userId);
        return Result.success(user);
    }

    @GetMapping("/info")
    public Result<User> getUserInfo(@RequestHeader("token") String token) {
        Long userId = jwtUtil.getUserIdFromToken(token);
        User user = userService.getUserById(userId);
        return Result.success(user);
    }

    @PutMapping("/info")
    public Result<User> updateUserInfo(@RequestBody User user, @RequestHeader("token") String token) {
        Long userId = jwtUtil.getUserIdFromToken(token);
        user.setId(userId);
        User updated = userService.updateUser(user);
        return Result.success(updated);
    }
}
