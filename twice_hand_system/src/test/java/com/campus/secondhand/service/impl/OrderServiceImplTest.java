package com.campus.secondhand.service.impl;

import com.campus.secondhand.dto.OrderCreateRequest;
import com.campus.secondhand.entity.Goods;
import com.campus.secondhand.entity.Order;
import com.campus.secondhand.enums.ErrorCode;
import com.campus.secondhand.exception.BusinessException;
import com.campus.secondhand.mapper.OrderMapper;
import com.campus.secondhand.service.GoodsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class OrderServiceImplTest {

    private OrderMapper orderMapper;
    private GoodsService goodsService;
    private OrderServiceImpl svc;

    @BeforeEach
    void setup() {
        orderMapper = mock(OrderMapper.class);
        goodsService = mock(GoodsService.class);
        svc = new OrderServiceImpl();
        svc.orderMapper = orderMapper;
        svc.goodsService = goodsService;
    }

    @Test
    void create_fillsOrderNoAndSnapshot() {
        Goods g = new Goods();
        g.setId(11L);
        g.setUserId(2L);
        g.setName("二手教材");
        g.setPrice(new BigDecimal("25.00"));
        g.setStatus(1);
        when(goodsService.getById(11L)).thenReturn(g);
        when(orderMapper.insert(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(100L);
            return 1;
        });
        when(orderMapper.selectById(100L)).thenAnswer(inv -> {
            Order o = new Order();
            o.setId(100L);
            return o;
        });
        when(goodsService.update(any(Goods.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderCreateRequest req = new OrderCreateRequest();
        req.setGoodsId(11L);
        Order result = svc.create(req, 1L);

        ArgumentCaptor<Order> cap = ArgumentCaptor.forClass(Order.class);
        verify(orderMapper).insert(cap.capture());
        Order saved = cap.getValue();
        assertNotNull(saved.getOrderNo());
        assertTrue(saved.getOrderNo().length() > 20);
        assertEquals("二手教材", saved.getGoodsTitle());
        assertEquals(new BigDecimal("25.00"), saved.getGoodsPrice());
        assertEquals(0, saved.getStatus());
        assertEquals(11L, saved.getGoodsId());
        assertEquals(2L, saved.getSellerId());
        assertEquals(1L, saved.getBuyerId());
    }

    @Test
    void create_selfPurchase_throws() {
        Goods g = new Goods();
        g.setId(11L);
        g.setUserId(1L);
        g.setStatus(1);
        when(goodsService.getById(11L)).thenReturn(g);

        OrderCreateRequest req = new OrderCreateRequest();
        req.setGoodsId(11L);
        BusinessException ex = assertThrows(BusinessException.class, () -> svc.create(req, 1L));
        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
    }

    @Test
    void create_offShelfGoods_throws() {
        Goods g = new Goods();
        g.setId(11L);
        g.setUserId(2L);
        g.setStatus(2);
        when(goodsService.getById(11L)).thenReturn(g);

        OrderCreateRequest req = new OrderCreateRequest();
        req.setGoodsId(11L);
        BusinessException ex = assertThrows(BusinessException.class, () -> svc.create(req, 1L));
        assertEquals(ErrorCode.CONFLICT, ex.getErrorCode());
    }
}
