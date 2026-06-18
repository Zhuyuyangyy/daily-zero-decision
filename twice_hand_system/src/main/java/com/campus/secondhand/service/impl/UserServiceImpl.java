package com.campus.secondhand.service.impl;

import com.campus.secondhand.dto.LoginRequest;
import com.campus.secondhand.dto.RegisterRequest;
import com.campus.secondhand.entity.User;
import com.campus.secondhand.enums.ErrorCode;
import com.campus.secondhand.exception.BusinessException;
import com.campus.secondhand.mapper.UserMapper;
import com.campus.secondhand.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public User login(LoginRequest request) {
        User user = userMapper.getByUsername(request.getUsername());
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "用户名或密码错误");
        }
        if (user.getStatus() == null || user.getStatus() != 1) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "用户已被禁用");
        }
        user.setPassword(null);
        return user;
    }

    @Override
    public Long register(RegisterRequest request) {
        if (existsByUsername(request.getUsername())) {
            throw new BusinessException(ErrorCode.CONFLICT, "用户名已存在");
        }
        if (request.getPhone() != null && existsByPhone(request.getPhone())) {
            throw new BusinessException(ErrorCode.CONFLICT, "手机号已被注册");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setSchool(request.getSchool());
        user.setStudentId(request.getStudentId());
        user.setStatus(1);
        userMapper.insert(user);
        return user.getId();
    }

    @Override public User getUserById(Long id) { return userMapper.selectById(id); }

    @Override public User getUserByUsername(String username) { return userMapper.getByUsername(username); }

    @Override
    public User updateUser(User user) {
        userMapper.updateById(user);
        return userMapper.selectById(user.getId());
    }

    @Override public boolean existsByUsername(String username) { return userMapper.getByUsername(username) != null; }
    @Override public boolean existsByPhone(String phone) { return userMapper.getByPhone(phone) != null; }
}
