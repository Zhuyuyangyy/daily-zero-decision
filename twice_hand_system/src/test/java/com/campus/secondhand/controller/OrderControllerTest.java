package com.campus.secondhand.controller;

import com.campus.secondhand.entity.Order;
import com.campus.secondhand.service.OrderService;
import com.campus.secondhand.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Order Controller Tests")
class OrderControllerTest {

    @InjectMocks
    private OrderController orderController;

    @Mock
    private OrderService orderService;

    @Mock
    private JwtUtil jwtUtil;

    private Order testOrder;

    @BeforeEach
    void setUp() {
        testOrder = new Order();
        testOrder.setId(1L);
        testOrder.setBuyerId(1L);
        testOrder.setSellerId(2L);
        testOrder.setGoodsId(1L);
        testOrder.setStatus(0);
    }

    @Test
    @DisplayName("Should create order")
    void createOrder_shouldReturnCreatedOrder() {
        when(jwtUtil.getUserIdFromToken("valid-token")).thenReturn(1L);
        when(orderService.createOrder(any(Order.class))).thenReturn(testOrder);

        Order newOrder = new Order();
        newOrder.setGoodsId(1L);
        newOrder.setSellerId(2L);

        var result = orderController.createOrder(newOrder, "valid-token");

        assertEquals(200, result.getCode());
        assertEquals(1L, newOrder.getBuyerId());
    }

    @Test
    @DisplayName("Should get buyer orders")
    void getMyBuyOrder_shouldReturnBuyerOrders() {
        when(jwtUtil.getUserIdFromToken("valid-token")).thenReturn(1L);
        when(orderService.getOrderByBuyerId(1L)).thenReturn(Arrays.asList(testOrder));

        var result = orderController.getMyBuyOrder("valid-token");

        assertEquals(200, result.getCode());
        assertEquals(1, result.getData().size());
    }

    @Test
    @DisplayName("Should get seller orders")
    void getMySellOrder_shouldReturnSellerOrders() {
        when(jwtUtil.getUserIdFromToken("valid-token")).thenReturn(2L);
        when(orderService.getOrderBySellerId(2L)).thenReturn(Arrays.asList(testOrder));

        var result = orderController.getMySellOrder("valid-token");

        assertEquals(200, result.getCode());
        assertEquals(1, result.getData().size());
    }

    @Test
    @DisplayName("Should update order status")
    void updateOrderStatus_shouldReturnUpdatedOrder() {
        testOrder.setStatus(1);
        when(orderService.updateOrderStatus(1L, 1)).thenReturn(testOrder);

        var result = orderController.updateOrderStatus(1L, 1);

        assertEquals(200, result.getCode());
        assertEquals(1, result.getData().getStatus());
    }

    @Test
    @DisplayName("Should return empty list when no buyer orders")
    void getMyBuyOrder_shouldReturnEmptyListWhenNoOrders() {
        when(jwtUtil.getUserIdFromToken("valid-token")).thenReturn(999L);
        when(orderService.getOrderByBuyerId(999L)).thenReturn(List.of());

        var result = orderController.getMyBuyOrder("valid-token");

        assertEquals(200, result.getCode());
        assertTrue(result.getData().isEmpty());
    }

    @Test
    @DisplayName("Should return empty list when no seller orders")
    void getMySellOrder_shouldReturnEmptyListWhenNoOrders() {
        when(jwtUtil.getUserIdFromToken("valid-token")).thenReturn(999L);
        when(orderService.getOrderBySellerId(999L)).thenReturn(List.of());

        var result = orderController.getMySellOrder("valid-token");

        assertEquals(200, result.getCode());
        assertTrue(result.getData().isEmpty());
    }
}
