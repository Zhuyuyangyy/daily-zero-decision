package com.campus.secondhand.enums;

import lombok.Getter;

@Getter
public enum ErrorCode {
    OK(200, "ok", 200),
    BAD_REQUEST(40000, "bad request", 400),
    UNAUTHORIZED(40100, "unauthorized", 401),
    FORBIDDEN(40300, "forbidden", 403),
    NOT_FOUND(40400, "not found", 404),
    CONFLICT(40900, "conflict", 409),
    INTERNAL(50000, "internal error", 500);

    private final int code;
    private final String message;
    private final int httpStatus;

    ErrorCode(int code, String message, int httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
