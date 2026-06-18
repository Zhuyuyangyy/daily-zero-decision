package com.campus.secondhand.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.campus.secondhand.entity.Goods;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface GoodsMapper extends BaseMapper<Goods> {
    // 只保留自定义的、BaseMapper没有的方法
    List<Goods> getList(@Param("offset") Integer offset,
                        @Param("size") Integer size,
                        @Param("category") String category,
                        @Param("keyword") String keyword);

    List<Goods> getBySellerId(@Param("sellerId") Long sellerId);

    void updateStatus(@Param("id") Long id, @Param("status") Integer status);

    void increaseViewCount(@Param("id") Long id);
}