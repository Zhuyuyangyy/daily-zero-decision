package com.campus.secondhand.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.campus.secondhand.entity.Goods;
import com.campus.secondhand.enums.ErrorCode;
import com.campus.secondhand.exception.BusinessException;
import com.campus.secondhand.mapper.GoodsMapper;
import com.campus.secondhand.service.GoodsService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class GoodsServiceImpl extends ServiceImpl<GoodsMapper, Goods> implements GoodsService {

    @Override
    public IPage<Goods> list(int page, int size, String keyword, Integer status) {
        QueryWrapper<Goods> q = new QueryWrapper<>();
        if (status != null) q.eq("status", status);
        if (StringUtils.hasText(keyword)) q.like("name", keyword);
        q.orderByDesc("create_time");
        return page(new Page<>(page, size), q);
    }

    @Override public Goods getById(Long id) { return getBaseMapper().selectById(id); }

    @Override
    public List<Goods> listByUserId(Long userId) {
        return getBaseMapper().selectList(new QueryWrapper<Goods>().eq("user_id", userId).orderByDesc("create_time"));
    }

    @Override
    public Goods create(Goods goods, Long userId) {
        goods.setId(null);
        goods.setUserId(userId);
        if (goods.getStatus() == null) goods.setStatus(1);
        if (goods.getViewCount() == null) goods.setViewCount(0);
        if (goods.getWantCount() == null) goods.setWantCount(0);
        save(goods);
        return goods;
    }

    @Override
    public Goods update(Goods goods) {
        Goods existing = getById(goods.getId());
        if (existing == null) throw new BusinessException(ErrorCode.NOT_FOUND, "商品不存在");
        goods.setUserId(null);
        updateById(goods);
        return getById(goods.getId());
    }

    @Override
    public void delete(Long id) {
        removeById(id);
    }

    @Override
    public void updateStatus(Long id, Integer status, Long userId) {
        Goods g = getById(id);
        if (g == null) throw new BusinessException(ErrorCode.NOT_FOUND, "商品不存在");
        if (!g.getUserId().equals(userId)) throw new BusinessException(ErrorCode.FORBIDDEN, "无权操作");
        g.setStatus(status);
        updateById(g);
    }
}
