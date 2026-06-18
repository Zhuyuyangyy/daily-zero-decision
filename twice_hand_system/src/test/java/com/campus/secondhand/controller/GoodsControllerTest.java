package com.campus.secondhand.controller;

import com.campus.secondhand.entity.Goods;
import com.campus.secondhand.service.GoodsService;
import com.campus.secondhand.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Goods Controller Tests")
class GoodsControllerTest {

    @InjectMocks
    private GoodsController goodsController;

    @Mock
    private GoodsService goodsService;

    @Mock
    private JwtUtil jwtUtil;

    private Goods testGoods;

    @BeforeEach
    void setUp() {
        testGoods = new Goods();
        testGoods.setId(1L);
        testGoods.setUserId(1L);
        testGoods.setName("Test Goods");
        testGoods.setPrice(new BigDecimal("99.99"));
        testGoods.setDescription("Test description");
        testGoods.setStatus(1);
    }

    @Test
    @DisplayName("Should get user's goods")
    void getMyGoods_shouldReturnUserGoods() {
        when(jwtUtil.getUserIdFromToken("valid-token")).thenReturn(1L);
        when(goodsService.getGoodsByUserId(1L)).thenReturn(Arrays.asList(testGoods));

        var result = goodsController.getMyGoods("valid-token");

        assertEquals(200, result.getCode());
        assertEquals(1, result.getData().size());
    }

    @Test
    @DisplayName("Should get goods detail")
    void getGoodsDetail_shouldReturnGoods() {
        when(goodsService.getGoodsById(1L)).thenReturn(testGoods);

        var result = goodsController.getGoodsDetail(1L);

        assertEquals(200, result.getCode());
        assertEquals("Test Goods", result.getData().getName());
    }

    @Test
    @DisplayName("Should get all on-sale goods")
    void getAllOnSaleGoods_shouldReturnOnSaleGoods() {
        when(goodsService.getAllOnSaleGoods()).thenReturn(Arrays.asList(testGoods));

        var result = goodsController.getAllOnSaleGoods();

        assertEquals(200, result.getCode());
        assertNotNull(result.getData());
    }

    @Test
    @DisplayName("Should create goods")
    void createGoods_shouldReturnCreatedGoods() {
        when(jwtUtil.getUserIdFromToken("valid-token")).thenReturn(1L);
        when(goodsService.createGoods(any(Goods.class))).thenReturn(testGoods);

        Goods newGoods = new Goods();
        newGoods.setName("New Goods");
        newGoods.setPrice(new BigDecimal("50.00"));

        var result = goodsController.createGoods(newGoods, "valid-token");

        assertEquals(200, result.getCode());
        assertEquals(1L, newGoods.getUserId());
    }

    @Test
    @DisplayName("Should update goods")
    void updateGoods_shouldReturnUpdatedGoods() {
        when(goodsService.updateGoods(any(Goods.class))).thenReturn(testGoods);

        var result = goodsController.updateGoods(testGoods, "valid-token");

        assertEquals(200, result.getCode());
        assertNotNull(result.getData());
    }

    @Test
    @DisplayName("Should delete goods")
    void deleteGoods_shouldReturnSuccess() {
        doNothing().when(goodsService).deleteGoods(1L);

        var result = goodsController.deleteGoods(1L);

        assertEquals(200, result.getCode());
        verify(goodsService).deleteGoods(1L);
    }
}
