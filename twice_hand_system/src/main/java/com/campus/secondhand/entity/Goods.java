package com.campus.secondhand.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("goods")
public class Goods extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String name;
    private String description;
    private Long categoryId;
    private String categoryName;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String images;
    private Integer condition;
    private Integer status;
    private Integer viewCount;
    private Integer wantCount;
}
