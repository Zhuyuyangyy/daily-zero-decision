package com.campus.secondhand.service;

import com.campus.secondhand.dto.OrderCreateRequest;
import com.campus.secondhand.entity.Order;

import java.util.List;

public interface OrderService {
    Order create(OrderCreateRequest req, Long buyerId);
    List<Order> listByBuyer(Long buyerId);
    List<Order> listBySeller(Long sellerId);
    Order updateStatus(Long id, Integer status, Long currentUserId);
}
