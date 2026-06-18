package com.campus.secondhand.mapper;

import com.campus.secondhand.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper {
    // 按用户名查询用户
    User getByUsername(String username);

    // 按手机号查询用户
    User getByPhone(String phone);

    // 插入用户
    int insert(User user);

    // 按ID查询用户
    User selectById(Long id);

    // 按ID更新用户（替换原有的update方法）
    int updateById(User user);
}