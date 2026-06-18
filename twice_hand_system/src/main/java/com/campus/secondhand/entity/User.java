package com.campus.secondhand.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data // Lombok自动生成getter/setter，解决setSchool/setStudentId找不到的问题
public class User {
    private Long id;
    private String username; // 用户名
    private String password; // 密码（MD5加密）
    private String nickname; // 昵称
    private String phone; // 手机号
    private String email; // 邮箱
    private String school; // 补充：学校字段
    private String studentId; // 补充：学号字段
    private Integer status; // 状态：1-正常，0-禁用
    private LocalDateTime createTime; // 创建时间
    private LocalDateTime updateTime; // 更新时间
}