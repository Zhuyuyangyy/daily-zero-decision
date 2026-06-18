package com.campus.secondhand.service;

import com.campus.secondhand.entity.Goods;
import java.util.List;

public interface GoodsService {
    // 1. 查询所有商品
    List<Goods> getAllGoods();

    // 2. 按用户ID查询商品（对应控制器的/my接口）
    List<Goods> getGoodsByUserId(Long userId);

    // 3. 按ID查询商品详情
    Goods getGoodsById(Long id);

    // 4. 分页+条件查询商品列表
    List<Goods> getGoodsList(Integer page, Integer size, String category, String keyword);

    // 5. 按卖家ID查询商品
    List<Goods> getSellerGoods(Long sellerId);

    // 6. 发布/创建商品
    Long publishGoods(Goods goods);

    // 7. 创建商品（和publishGoods二选一，建议保留一个，这里先兼容）
    Goods createGoods(Goods goods);

    // 8. 修改商品（核心：统一返回类型为Goods）
    Goods updateGoods(Goods goods);

    // 9. 删除商品（接口定义为removeGoods，实现类要对应）
    void removeGoods(Long id);

    // 10. 删除商品（兼容控制器的deleteGoods）
    void deleteGoods(Long id);

    // 11. 增加浏览量
    void increaseViewCount(Long id);

    // 12. 更新商品状态
    void updateStatus(Long id, Integer status);
    // GoodsService接口
    List<Goods> getAllOnSaleGoods();
}