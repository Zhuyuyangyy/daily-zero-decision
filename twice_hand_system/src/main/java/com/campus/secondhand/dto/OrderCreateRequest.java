package com.campus.secondhand.dto;

import lombok.Data;

@Data
public class OrderCreateRequest {
    private Long goodsId;
    private String buyerName;
    private String buyerPhone;
    private String buyerAddress;
    private String remark;
}
