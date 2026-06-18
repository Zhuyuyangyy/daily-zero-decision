package com.campus.secondhand.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;

@Data
public class Goods {
    private Long id;
    private Long userId; // 对应数据库的user_id
    private String name; // 对应数据库的name（不是title）
    private BigDecimal price; // 对应数据库的price
    private String description; // 对应数据库的description
    private Integer status; // 对应数据库的status
    private Date createTime; // 对应数据库的create_time
    private Date updateTime; // 对应数据库的update_time
    // 不要加images/category/sellerId/title等不存在的字段
}