package com.campus.secondhand.controller;

import com.campus.secondhand.entity.Order;
import com.campus.secondhand.response.Result;
import com.campus.secondhand.service.OrderService;
import com.campus.secondhand.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // 必须加，标记是接口控制器
@RequestMapping("/order") // 类级别路径，拼接后是/order/xxx
public class OrderController {

    @Autowired
    private OrderService orderService;
    @Autowired
    private JwtUtil jwtUtil;

    // 1. 创建订单（POST /order/create）
    @PostMapping("/create")
    public Result<Order> createOrder(@RequestBody Order order, @RequestHeader("token") String token) {
        Long buyerId = jwtUtil.getUserIdFromToken(token);
        order.setBuyerId(buyerId);
        Order newOrder = orderService.createOrder(order);
        return Result.success(newOrder);
    }

    // 2. 买家查订单（GET /order/my/buy）
    @GetMapping("/my/buy")
    public Result<List<Order>> getMyBuyOrder(@RequestHeader("token") String token) {
        Long buyerId = jwtUtil.getUserIdFromToken(token);
        List<Order> orders = orderService.getOrderByBuyerId(buyerId);
        return Result.success(orders);
    }

    // 3. 卖家查订单（GET /order/my/sell）
    @GetMapping("/my/sell")
    public Result<List<Order>> getMySellOrder(@RequestHeader("token") String token) {
        Long sellerId = jwtUtil.getUserIdFromToken(token);
        List<Order> orders = orderService.getOrderBySellerId(sellerId);
        return Result.success(orders);
    }

    // 4. 更新订单状态（PUT /order/status/{id}）
    @PutMapping("/status/{id}")
    public Result<Order> updateOrderStatus(@PathVariable Long id, @RequestParam Integer status) {
        Order order = orderService.updateOrderStatus(id, status);
        return Result.success(order);
    }
}