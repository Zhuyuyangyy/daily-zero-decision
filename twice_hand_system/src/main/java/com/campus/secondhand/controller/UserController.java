package com.campus.secondhand.controller;

import com.campus.secondhand.entity.User;
import com.campus.secondhand.interceptor.JwtInterceptor;
import com.campus.secondhand.response.Result;
import com.campus.secondhand.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public Result<User> me(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtInterceptor.ATTR_USER_ID);
        return Result.ok(userService.getUserById(userId));
    }

    @PutMapping("/me")
    public Result<User> updateMe(@RequestBody User patch, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtInterceptor.ATTR_USER_ID);
        patch.setId(userId);
        return Result.ok(userService.updateUser(patch));
    }
}
