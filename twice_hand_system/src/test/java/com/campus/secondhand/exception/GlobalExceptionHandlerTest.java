package com.campus.secondhand.exception;

import com.campus.secondhand.response.Result;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Global Exception Handler Tests")
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    @DisplayName("Should handle RuntimeException")
    void handleRuntimeException_shouldReturnErrorResult() {
        RuntimeException exception = new RuntimeException("Test error");

        Result<Void> result = handler.handleRuntimeException(exception);

        assertEquals(500, result.getCode());
        assertEquals("Test error", result.getMessage());
    }

    @Test
    @DisplayName("Should handle generic Exception")
    void handleException_shouldReturnErrorResultWithPrefix() {
        Exception exception = new Exception("Internal error");

        Result<Void> result = handler.handleException(exception);

        assertEquals(500, result.getCode());
        assertTrue(result.getMessage().contains("服务器内部错误"));
        assertTrue(result.getMessage().contains("Internal error"));
    }

    @Test
    @DisplayName("Should handle BusinessException")
    void handleBusinessException_shouldReturnErrorResult() {
        BusinessException exception = new BusinessException(400, "Business error");

        Result<Void> result = handler.handleRuntimeException(exception);

        assertEquals(500, result.getCode());
        assertEquals("Business error", result.getMessage());
    }

    @Test
    @DisplayName("Should handle NullPointerException")
    void handleRuntimeException_shouldHandleNPE() {
        NullPointerException exception = new NullPointerException("Null reference");

        Result<Void> result = handler.handleRuntimeException(exception);

        assertEquals(500, result.getCode());
        assertEquals("Null reference", result.getMessage());
    }
}
