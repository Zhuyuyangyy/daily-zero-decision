package com.campus.secondhand.service;

import com.campus.secondhand.entity.Order;
import com.campus.secondhand.mapper.OrderMapper;
import com.campus.secondhand.service.impl.OrderServiceImpl;
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
@DisplayName("Order Service Tests")
class OrderServiceTest {

    @InjectMocks
    private OrderServiceImpl orderService;

    @Mock
    private OrderMapper orderMapper;

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
    @DisplayName("Should create order with pending status")
    void createOrder_shouldSetPendingStatus() {
        when(orderMapper.insert(any(Order.class))).thenReturn(1);
        when(orderMapper.selectById(1L)).thenReturn(testOrder);

        Order result = orderService.createOrder(testOrder);

        assertNotNull(result);
        assertEquals(0, result.getStatus());
        verify(orderMapper).insert(any(Order.class));
    }

    @Test
    @DisplayName("Should get orders by buyer ID")
    void getOrderByBuyerId_shouldReturnBuyerOrders() {
        List<Order> expected = Arrays.asList(testOrder);
        when(orderMapper.selectByBuyerId(1L)).thenReturn(expected);

        List<Order> result = orderService.getOrderByBuyerId(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getBuyerId());
    }

    @Test
    @DisplayName("Should get orders by seller ID")
    void getOrderBySellerId_shouldReturnSellerOrders() {
        List<Order> expected = Arrays.asList(testOrder);
        when(orderMapper.selectBySellerId(2L)).thenReturn(expected);

        List<Order> result = orderService.getOrderBySellerId(2L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(2L, result.get(0).getSellerId());
    }

    @Test
    @DisplayName("Should update order status")
    void updateOrderStatus_shouldUpdateStatus() {
        when(orderMapper.selectById(1L)).thenReturn(testOrder);
        when(orderMapper.updateById(any(Order.class))).thenReturn(1);

        Order result = orderService.updateOrderStatus(1L, 1);

        assertNotNull(result);
        assertEquals(1, result.getStatus());
        verify(orderMapper).updateById(any(Order.class));
    }

    @Test
    @DisplayName("Should return null when updating non-existent order")
    void updateOrderStatus_shouldReturnNullForNonExistentOrder() {
        when(orderMapper.selectById(999L)).thenReturn(null);

        Order result = orderService.updateOrderStatus(999L, 1);

        assertNull(result);
    }

    @Test
    @DisplayName("Should return empty list when no buyer orders")
    void getOrderByBuyerId_shouldReturnEmptyListWhenNoOrders() {
        when(orderMapper.selectByBuyerId(999L)).thenReturn(List.of());

        List<Order> result = orderService.getOrderByBuyerId(999L);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Should return empty list when no seller orders")
    void getOrderBySellerId_shouldReturnEmptyListWhenNoOrders() {
        when(orderMapper.selectBySellerId(999L)).thenReturn(List.of());

        List<Order> result = orderService.getOrderBySellerId(999L);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Should create order with correct buyer and seller IDs")
    void createOrder_shouldPreserveBuyerAndSellerIds() {
        Order newOrder = new Order();
        newOrder.setBuyerId(10L);
        newOrder.setSellerId(20L);
        newOrder.setGoodsId(30L);

        when(orderMapper.insert(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            order.setId(5L);
            return 1;
        });
        when(orderMapper.selectById(5L)).thenReturn(newOrder);

        Order result = orderService.createOrder(newOrder);

        assertNotNull(result);
        assertEquals(10L, result.getBuyerId());
        assertEquals(20L, result.getSellerId());
    }
}
