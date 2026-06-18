package com.campus.secondhand.service;

import com.campus.secondhand.dto.LoginRequest;
import com.campus.secondhand.dto.RegisterRequest;
import com.campus.secondhand.entity.User;

/**
 * 用户服务接口
 */
public interface UserService {

    /**
     * 用户登录
     */
    String login(LoginRequest request);

    /**
     * 用户注册
     */
    Long register(RegisterRequest request);

    /**
     * 根据 ID 获取用户
     */
    User getUserById(Long id);

    /**
     * 根据用户名获取用户
     */
    User getUserByUsername(String username);

    /**
     * 更新用户信息
     *
     * @return
     */
    User updateUser(User user);

    /**
     * 验证用户名是否存在
     */
    boolean existsByUsername(String username);

    /**
     * 验证手机号是否存在
     */
    boolean existsByPhone(String phone);
}
