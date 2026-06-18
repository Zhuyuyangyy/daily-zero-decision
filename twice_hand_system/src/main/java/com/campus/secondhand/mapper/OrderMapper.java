package com.campus.secondhand.mapper;

import com.campus.secondhand.entity.Order;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface OrderMapper {
    // 按买家ID查订单
    List<Order> selectByBuyerId(Long buyerId);

    // 按卖家ID查订单
    List<Order> selectBySellerId(Long sellerId);

    // 按ID查订单
    Order selectById(Long id);

    // 插入订单
    int insert(Order order);

    // 更新订单
    int updateById(Order order);
}