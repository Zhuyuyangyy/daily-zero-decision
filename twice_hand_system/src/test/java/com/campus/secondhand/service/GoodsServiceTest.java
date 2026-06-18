package com.campus.secondhand.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.campus.secondhand.entity.Goods;
import com.campus.secondhand.mapper.GoodsMapper;
import com.campus.secondhand.service.impl.GoodsServiceImpl;
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
@DisplayName("Goods Service Tests")
class GoodsServiceTest {

    @InjectMocks
    private GoodsServiceImpl goodsService;

    @Mock
    private GoodsMapper goodsMapper;

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
    @DisplayName("Should get all goods")
    void getAllGoods_shouldReturnList() {
        List<Goods> expected = Arrays.asList(testGoods);
        // Using MyBatis-Plus list() which internally calls selectList
        when(goodsMapper.selectList(any(QueryWrapper.class))).thenReturn(expected);

        List<Goods> result = goodsService.getAllGoods();

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Should get goods by user ID")
    void getGoodsByUserId_shouldReturnUserGoods() {
        List<Goods> expected = Arrays.asList(testGoods);
        when(goodsMapper.getBySellerId(1L)).thenReturn(expected);

        List<Goods> result = goodsService.getGoodsByUserId(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getUserId());
    }

    @Test
    @DisplayName("Should get goods by ID")
    void getGoodsById_shouldReturnGoods() {
        when(goodsMapper.selectById(1L)).thenReturn(testGoods);

        Goods result = goodsService.getGoodsById(1L);

        assertNotNull(result);
        assertEquals("Test Goods", result.getName());
    }

    @Test
    @DisplayName("Should create goods")
    void createGoods_shouldSaveAndReturnGoods() {
        when(goodsMapper.insert(any(Goods.class))).thenReturn(1);

        Goods result = goodsService.createGoods(testGoods);

        assertNotNull(result);
        verify(goodsMapper).insert(any(Goods.class));
    }

    @Test
    @DisplayName("Should update goods")
    void updateGoods_shouldUpdateAndReturnGoods() {
        when(goodsMapper.updateById(any(Goods.class))).thenReturn(1);
        when(goodsMapper.selectById(1L)).thenReturn(testGoods);

        Goods result = goodsService.updateGoods(testGoods);

        assertNotNull(result);
        verify(goodsMapper).updateById(any(Goods.class));
    }

    @Test
    @DisplayName("Should delete goods")
    void deleteGoods_shouldRemoveGoods() {
        when(goodsMapper.deleteById(1L)).thenReturn(1);

        goodsService.deleteGoods(1L);

        verify(goodsMapper).deleteById(1L);
    }

    @Test
    @DisplayName("Should get all on-sale goods")
    void getAllOnSaleGoods_shouldReturnOnSaleGoods() {
        testGoods.setStatus(1);
        List<Goods> expected = Arrays.asList(testGoods);
        when(goodsMapper.selectList(any(QueryWrapper.class))).thenReturn(expected);

        List<Goods> result = goodsService.getAllOnSaleGoods();

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Should return empty list when no goods found")
    void getGoodsByUserId_shouldReturnEmptyListWhenNoGoods() {
        when(goodsMapper.getBySellerId(999L)).thenReturn(List.of());

        List<Goods> result = goodsService.getGoodsByUserId(999L);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Should return null for non-existent goods ID")
    void getGoodsById_shouldReturnNullForNonExistentId() {
        when(goodsMapper.selectById(999L)).thenReturn(null);

        Goods result = goodsService.getGoodsById(999L);

        assertNull(result);
    }
}
