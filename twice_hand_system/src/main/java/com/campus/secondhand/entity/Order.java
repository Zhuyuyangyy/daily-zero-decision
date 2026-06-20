package com.campus.secondhand.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("orders")
public class Order extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String orderNo;
    private Long goodsId;
    private String goodsTitle;
    private BigDecimal goodsPrice;
    private Long sellerId;
    private Long buyerId;
    private String buyerName;
    private String buyerPhone;
    private String buyerAddress;
    private String remark;
    private Integer status;
    @TableField("payment_time")
    private LocalDateTime paymentTime;
    @TableField("delivery_time")
    private LocalDateTime deliveryTime;
    @TableField("receive_time")
    private LocalDateTime receiveTime;
    @TableField("complete_time")
    private LocalDateTime completeTime;
}
