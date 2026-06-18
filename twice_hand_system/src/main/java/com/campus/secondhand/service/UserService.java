package com.campus.secondhand.service;

import com.campus.secondhand.dto.LoginRequest;
import com.campus.secondhand.dto.RegisterRequest;
import com.campus.secondhand.entity.User;

public interface UserService {
    User login(LoginRequest request);
    Long register(RegisterRequest request);
    User getUserById(Long id);
    User getUserByUsername(String username);
    User updateUser(User user);
    boolean existsByUsername(String username);
    boolean existsByPhone(String phone);
}
