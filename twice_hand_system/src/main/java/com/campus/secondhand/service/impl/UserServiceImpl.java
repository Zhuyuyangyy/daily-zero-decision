package com.campus.secondhand.service.impl;

import com.campus.secondhand.dto.LoginRequest;
import com.campus.secondhand.dto.RegisterRequest;
import com.campus.secondhand.entity.User;
import com.campus.secondhand.mapper.UserMapper;
import com.campus.secondhand.service.UserService;
import com.campus.secondhand.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.time.LocalDateTime;

/**
 * 用户服务实现类
 */
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public String login(LoginRequest request) {
        // 加密密码
        String encryptedPassword = DigestUtils.md5DigestAsHex(request.getPassword().getBytes());

        // 查询用户
        User user = userMapper.getByUsername(request.getUsername());
        if (user == null) {
            throw new RuntimeException("用户名或密码错误");
        }

        // 验证密码
        if (!user.getPassword().equals(encryptedPassword)) {
            throw new RuntimeException("用户名或密码错误");
        }

        // 检查用户状态
        if (user.getStatus() != 1) {
            throw new RuntimeException("用户已被禁用");
        }

        // 生成 Token
        return jwtUtil.generateToken(user.getId());
    }

    @Override
    public Long register(RegisterRequest request) {
        // 验证用户名是否已存在
        if (existsByUsername(request.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }

        // 验证手机号是否已存在
        if (request.getPhone() != null && existsByPhone(request.getPhone())) {
            throw new RuntimeException("手机号已被注册");
        }

        // 创建用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(DigestUtils.md5DigestAsHex(request.getPassword().getBytes()));
        user.setNickname(request.getNickname());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setSchool(request.getSchool()); // 现在有对应的setter方法了
        user.setStudentId(request.getStudentId()); // 现在有对应的setter方法了
        user.setStatus(1);
        user.setCreateTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());

        userMapper.insert(user);
        return user.getId();
    }

    @Override
    public User getUserById(Long id) {
        return userMapper.selectById(id);
    }

    @Override
    public User getUserByUsername(String username) {
        return userMapper.getByUsername(username);
    }

    @Override
    public User updateUser(User user) {
        user.setUpdateTime(LocalDateTime.now());
        // 修复：删除Wrappers（MyBatis原生不需要），直接调用updateById
        userMapper.updateById(user);
        // 更新后返回最新的用户信息
        return userMapper.selectById(user.getId());
    }

    @Override
    public boolean existsByUsername(String username) {
        return userMapper.getByUsername(username) != null;
    }

    @Override
    public boolean existsByPhone(String phone) {
        return userMapper.getByPhone(phone) != null;
    }
}