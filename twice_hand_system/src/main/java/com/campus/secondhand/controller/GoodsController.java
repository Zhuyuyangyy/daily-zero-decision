package com.campus.secondhand.controller;

import com.campus.secondhand.entity.Goods;
import com.campus.secondhand.response.Result;
import com.campus.secondhand.service.GoodsService;
import com.campus.secondhand.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/goods")
public class GoodsController {

    @Autowired
    private GoodsService goodsService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/my")
    public Result<List<Goods>> getMyGoods(@RequestHeader("token") String token) {
        Long userId = jwtUtil.getUserIdFromToken(token);
        List<Goods> goodsList = goodsService.getGoodsByUserId(userId);
        return Result.success(goodsList);
    }

    @GetMapping("/detail/{id}")
    public Result<Goods> getGoodsDetail(@PathVariable Long id) {
        Goods goods = goodsService.getGoodsById(id);
        return Result.success(goods);
    }
    /**
     * 公开接口：查询所有在售商品（买家选货用，无需token）
     * 路径：GET /goods/list
     */
    @GetMapping("/list")
    public Result<List<Goods>> getAllOnSaleGoods() {
        // 调用Service查询status=1（在售）的所有商品
        List<Goods> goodsList = goodsService.getAllOnSaleGoods();
        return Result.success(goodsList);
    }

    @PostMapping("/create")
    public Result<Goods> createGoods(@RequestBody Goods goods, @RequestHeader("token") String token) {
        Long userId = jwtUtil.getUserIdFromToken(token);
        goods.setUserId(userId);
        Goods created = goodsService.createGoods(goods);
        return Result.success(created);
    }

    @PutMapping("/update")
    public Result<Goods> updateGoods(@RequestBody Goods goods, @RequestHeader("token") String token) {
        Goods updated = goodsService.updateGoods(goods);
        return Result.success(updated);
    }

    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteGoods(@PathVariable Long id) {
        goodsService.deleteGoods(id);
        return Result.success(null);
    }
}
