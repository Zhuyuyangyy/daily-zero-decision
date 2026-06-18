package com.campus.secondhand.service;

import com.campus.secondhand.entity.Order;
import java.util.List;

public interface OrderService {
    // 创建订单
    Order createOrder(Order order);
    // 买家查订单
    List<Order> getOrderByBuyerId(Long buyerId);
    // 卖家查订单
    List<Order> getOrderBySellerId(Long sellerId);
    // 更新订单状态
    Order updateOrderStatus(Long id, Integer status);
}