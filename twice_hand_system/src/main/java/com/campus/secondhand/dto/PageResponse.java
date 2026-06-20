package com.campus.secondhand.dto;

import com.baomidou.mybatisplus.core.metadata.IPage;
import lombok.Data;

import java.util.Collections;
import java.util.List;

@Data
public class PageResponse<T> {
    private List<T> records;
    private long total;
    private long page;
    private long size;

    public PageResponse() {
        this.records = Collections.emptyList();
    }

    public PageResponse(List<T> records, long total, long page, long size) {
        this.records = records;
        this.total = total;
        this.page = page;
        this.size = size;
    }

    public static <T> PageResponse<T> of(IPage<T> p) {
        return new PageResponse<>(p.getRecords(), p.getTotal(), p.getCurrent(), p.getSize());
    }
}
