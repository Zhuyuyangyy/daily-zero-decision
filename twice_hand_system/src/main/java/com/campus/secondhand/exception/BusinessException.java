package com.campus.secondhand.exception;

import com.campus.secondhand.enums.ErrorCode;
import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {
    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public BusinessException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    @Deprecated
    public BusinessException(String message) {
        super(message);
        this.errorCode = ErrorCode.INTERNAL;
    }
}
