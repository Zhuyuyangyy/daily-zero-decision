package com.campus.secondhand.exception;

import com.campus.secondhand.enums.ErrorCode;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class BusinessExceptionTest {

    @Test
    void errorCode_isExposed() {
        BusinessException e = new BusinessException(ErrorCode.NOT_FOUND, "missing");
        assertEquals(ErrorCode.NOT_FOUND, e.getErrorCode());
        assertEquals("missing", e.getMessage());
    }

    @Test
    void defaultMessage_usedWhenNoMessageGiven() {
        BusinessException e = new BusinessException(ErrorCode.UNAUTHORIZED);
        assertEquals(ErrorCode.UNAUTHORIZED.getMessage(), e.getMessage());
    }

    @Test
    void isRuntimeException() {
        assertInstanceOf(RuntimeException.class, new BusinessException(ErrorCode.INTERNAL));
    }
}
