package com.campus.secondhand.search;

import com.campus.secondhand.entity.Goods;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@ConditionalOnProperty(name = "template.search.enabled", havingValue = "false", matchIfMissing = true)
public class NoopSearchService implements SearchService {
    @Override public List<Long> searchGoodsIds(String keyword, int limit) { return Collections.emptyList(); }
    @Override public void indexGoods(Goods goods) { }
    @Override public void deleteGoods(Long id) { }
}
