package com.campus.secondhand.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.campus.secondhand.dto.PageResponse;
import com.campus.secondhand.entity.Goods;
import com.campus.secondhand.interceptor.JwtInterceptor;
import com.campus.secondhand.response.Result;
import com.campus.secondhand.service.GoodsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/v1/goods")
public class GoodsController {

    @Autowired
    private GoodsService goodsService;

    @GetMapping
    public Result<PageResponse<Goods>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status) {
        IPage<Goods> p = goodsService.list(page, size, keyword, status);
        return Result.ok(PageResponse.of(p));
    }

    @GetMapping("/{id}")
    public Result<Goods> detail(@PathVariable Long id) {
        return Result.ok(goodsService.getById(id));
    }

    @GetMapping("/mine")
    public Result<List<Goods>> mine(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtInterceptor.ATTR_USER_ID);
        return Result.ok(goodsService.listByUserId(userId));
    }

    @PostMapping
    public Result<Goods> create(@RequestBody Goods goods, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtInterceptor.ATTR_USER_ID);
        return Result.ok(goodsService.create(goods, userId));
    }

    @PutMapping("/{id}")
    public Result<Goods> update(@PathVariable Long id, @RequestBody Goods goods) {
        goods.setId(id);
        return Result.ok(goodsService.update(goods));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        goodsService.delete(id);
        return Result.ok();
    }

    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtInterceptor.ATTR_USER_ID);
        goodsService.updateStatus(id, status, userId);
        return Result.ok();
    }
}
