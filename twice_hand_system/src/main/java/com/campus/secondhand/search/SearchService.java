package com.campus.secondhand.search;

import com.campus.secondhand.entity.Goods;

import java.util.List;

public interface SearchService {
    List<Long> searchGoodsIds(String keyword, int limit);
    void indexGoods(Goods goods);
    void deleteGoods(Long id);
}
