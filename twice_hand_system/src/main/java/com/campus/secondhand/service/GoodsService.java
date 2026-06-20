package com.campus.secondhand.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.campus.secondhand.entity.Goods;

import java.util.List;

public interface GoodsService {
    IPage<Goods> list(int page, int size, String keyword, Integer status);
    Goods getById(Long id);
    List<Goods> listByUserId(Long userId);
    Goods create(Goods goods, Long userId);
    Goods update(Goods goods);
    void delete(Long id);
    void updateStatus(Long id, Integer status, Long userId);
}
