package com.campus.secondhand.response;

import com.campus.secondhand.enums.ErrorCode;
import lombok.Data;

@Data
public class Result<T> {
    private Integer code;
    private String message;
    private T data;
    private Long timestamp;

    public Result() {}

    public Result(Integer code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.timestamp = System.currentTimeMillis();
    }

    public static <T> Result<T> ok(T data) {
        return new Result<>(ErrorCode.OK.getCode(), ErrorCode.OK.getMessage(), data);
    }

    public static <T> Result<T> ok() {
        return new Result<>(ErrorCode.OK.getCode(), ErrorCode.OK.getMessage(), null);
    }

    public static <T> Result<T> error(ErrorCode ec) {
        return new Result<>(ec.getCode(), ec.getMessage(), null);
    }

    public static <T> Result<T> error(ErrorCode ec, String message) {
        return new Result<>(ec.getCode(), message, null);
    }

    public static <T> Result<T> error(String message) {
        return new Result<>(ErrorCode.INTERNAL.getCode(), message, null);
    }

    public static <T> Result<T> error(Integer code, String message) {
        return new Result<>(code, message, null);
    }

    @Deprecated
    public static <T> Result<T> success(T data) {
        return ok(data);
    }

    @Deprecated
    public static <T> Result<T> success() {
        return ok();
    }
}
