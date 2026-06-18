package com.campus.secondhand.controller;

import com.campus.secondhand.dto.OrderCreateRequest;
import com.campus.secondhand.entity.Order;
import com.campus.secondhand.interceptor.JwtInterceptor;
import com.campus.secondhand.response.Result;
import com.campus.secondhand.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public Result<Order> create(@RequestBody OrderCreateRequest req, HttpServletRequest request) {
        Long buyerId = (Long) request.getAttribute(JwtInterceptor.ATTR_USER_ID);
        return Result.ok(orderService.create(req, buyerId));
    }

    @GetMapping("/mine/buy")
    public Result<List<Order>> myBuy(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtInterceptor.ATTR_USER_ID);
        return Result.ok(orderService.listByBuyer(userId));
    }

    @GetMapping("/mine/sell")
    public Result<List<Order>> mySell(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtInterceptor.ATTR_USER_ID);
        return Result.ok(orderService.listBySeller(userId));
    }

    @PutMapping("/{id}/status")
    public Result<Order> updateStatus(@PathVariable Long id, @RequestParam Integer status, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtInterceptor.ATTR_USER_ID);
        return Result.ok(orderService.updateStatus(id, status, userId));
    }
}
