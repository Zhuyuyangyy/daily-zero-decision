package com.campus.secondhand.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.campus.secondhand.entity.Goods;
import com.campus.secondhand.mapper.GoodsMapper;
import com.campus.secondhand.service.GoodsService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GoodsServiceImpl extends ServiceImpl<GoodsMapper, Goods> implements GoodsService {

    @Override
    public List<Goods> getAllGoods() {
        // 错误写法：goodsMapper.selectAll()
        // 正确写法1：用MyBatis-Plus自带的list()方法（推荐，无需自定义SQL）
        return this.list();

        // 正确写法2：如果想调用自定义的getList（需传参数，offset=0, size=100, 其他null）
        // return baseMapper.getList(0, 100, null, null);
    }

    @Override
    public List<Goods> getGoodsByUserId(Long userId) {
        // 错误写法：goodsMapper.selectByUserId(userId)
        // 正确写法：调用接口中的getBySellerId（因为接口里是getBySellerId）
        return baseMapper.getBySellerId(userId);
    }
    // GoodsServiceImpl实现类
    @Override
    public List<Goods> getAllOnSaleGoods() {
        // 方式1：用MyBatis-Plus条件查询（推荐，不用写SQL）
        QueryWrapper<Goods> wrapper = new QueryWrapper<>();
        wrapper.eq("status", 1); // 只查在售商品（status=1）
        wrapper.orderByDesc("create_time"); // 按发布时间倒序（最新的在前）
        return this.list(wrapper);

        // 方式2：用自定义SQL（如果没用MyBatis-Plus，补GoodsMapper.xml）
        // return goodsMapper.selectAllOnSale();
    }

    @Override
    public Goods getGoodsById(Long id) {
        // 错误写法：goodsMapper.selectById(id)
        // 正确写法：用MyBatis-Plus自带的getById()
        return this.getById(id);
    }

    @Override
    public List<Goods> getGoodsList(Integer page, Integer size, String category, String keyword) {
        return List.of();
    }

    @Override
    public List<Goods> getSellerGoods(Long sellerId) {
        return List.of();
    }

    @Override
    public Long publishGoods(Goods goods) {
        return 0L;
    }

    @Override
    public Goods createGoods(Goods goods) {
        // 错误写法：goodsMapper.insert(goods)
        // 正确写法：用MyBatis-Plus自带的save()
        this.save(goods);
        return goods;
    }

    @Override
    public Goods updateGoods(Goods goods) {
        // 错误写法：goodsMapper.updateById(goods)
        // 正确写法：用MyBatis-Plus自带的updateById()
        this.updateById(goods);
        return this.getById(goods.getId());
    }

    @Override
    public void removeGoods(Long id) {

    }

    @Override
    public void deleteGoods(Long id) {
        // 错误写法：goodsMapper.deleteById(id)
        // 正确写法：用MyBatis-Plus自带的removeById()
        this.removeById(id);
    }

    @Override
    public void increaseViewCount(Long id) {

    }

    @Override
    public void updateStatus(Long id, Integer status) {

    }
}