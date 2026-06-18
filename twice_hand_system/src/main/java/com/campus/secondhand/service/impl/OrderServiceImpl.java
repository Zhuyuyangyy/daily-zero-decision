package com.campus.secondhand.service.impl;

import com.campus.secondhand.dto.OrderCreateRequest;
import com.campus.secondhand.entity.Goods;
import com.campus.secondhand.entity.Order;
import com.campus.secondhand.enums.ErrorCode;
import com.campus.secondhand.exception.BusinessException;
import com.campus.secondhand.mapper.OrderMapper;
import com.campus.secondhand.service.GoodsService;
import com.campus.secondhand.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired private OrderMapper orderMapper;
    @Autowired private GoodsService goodsService;

    private static final DateTimeFormatter NO_FMT = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS");

    @Override
    public Order create(OrderCreateRequest req, Long buyerId) {
        Goods goods = goodsService.getById(req.getGoodsId());
        if (goods == null) throw new BusinessException(ErrorCode.NOT_FOUND, "商品不存在");
        if (goods.getUserId().equals(buyerId)) throw new BusinessException(ErrorCode.BAD_REQUEST, "不能购买自己的商品");
        if (goods.getStatus() == null || goods.getStatus() != 1) throw new BusinessException(ErrorCode.CONFLICT, "商品已下架或已售出");

        Order order = new Order();
        order.setOrderNo(NO_FMT.format(LocalDateTime.now()) + "-" + UUID.randomUUID().toString().substring(0, 8));
        order.setGoodsId(goods.getId());
        order.setGoodsTitle(goods.getName());
        order.setGoodsPrice(goods.getPrice());
        order.setSellerId(goods.getUserId());
        order.setBuyerId(buyerId);
        order.setBuyerName(req.getBuyerName());
        order.setBuyerPhone(req.getBuyerPhone());
        order.setBuyerAddress(req.getBuyerAddress());
        order.setRemark(req.getRemark());
        order.setStatus(0);
        orderMapper.insert(order);

        goods.setStatus(2);
        goodsService.update(goods);

        return orderMapper.selectById(order.getId());
    }

    @Override
    public List<Order> listByBuyer(Long buyerId) {
        return orderMapper.selectByBuyerId(buyerId);
    }

    @Override
    public List<Order> listBySeller(Long sellerId) {
        return orderMapper.selectBySellerId(sellerId);
    }

    @Override
    public Order updateStatus(Long id, Integer status, Long currentUserId) {
        Order order = orderMapper.selectById(id);
        if (order == null) throw new BusinessException(ErrorCode.NOT_FOUND, "订单不存在");
        if (!order.getBuyerId().equals(currentUserId) && !order.getSellerId().equals(currentUserId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "无权操作");
        }
        order.setStatus(status);
        orderMapper.updateById(order);
        return order;
    }
}
