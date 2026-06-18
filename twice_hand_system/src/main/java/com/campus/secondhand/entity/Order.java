package com.campus.secondhand.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data // Lombok自动生成getter/setter
public class Order {
    private Long id;
    private Long buyerId; // 买家ID
    private Long sellerId; // 卖家ID
    private Long goodsId; // 商品ID
    private Integer status; // 订单状态（0-待确认，1-已确认，2-已取消）
    private LocalDateTime createTime; // 创建时间
    private LocalDateTime updateTime; // 更新时间
}