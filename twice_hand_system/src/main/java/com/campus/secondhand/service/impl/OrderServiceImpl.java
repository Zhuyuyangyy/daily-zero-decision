package com.campus.secondhand.service.impl;

import com.campus.secondhand.entity.Order;
import com.campus.secondhand.mapper.OrderMapper;
import com.campus.secondhand.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service // 必须加@Service，让Spring扫描到
public class OrderServiceImpl implements OrderService {

    @Autowired // 注入自定义的OrderMapper
    private OrderMapper orderMapper;

    @Override
    public Order createOrder(Order order) {
        order.setStatus(0); // 0-待确认
        orderMapper.insert(order);
        return orderMapper.selectById(order.getId());
    }

    @Override
    public List<Order> getOrderByBuyerId(Long buyerId) {
        // 调用Mapper的自定义方法
        return orderMapper.selectByBuyerId(buyerId);
    }

    @Override
    public List<Order> getOrderBySellerId(Long sellerId) {
        return orderMapper.selectBySellerId(sellerId);
    }

    @Override
    public Order updateOrderStatus(Long id, Integer status) {
        Order order = orderMapper.selectById(id);
        if (order != null) {
            order.setStatus(status);
            orderMapper.updateById(order);
        }
        return order;
    }
}