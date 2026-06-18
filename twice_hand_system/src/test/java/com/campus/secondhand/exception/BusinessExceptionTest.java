package com.campus.secondhand.exception;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Business Exception Tests")
class BusinessExceptionTest {

    @Test
    @DisplayName("Should create exception with message")
    void shouldCreateExceptionWithMessage() {
        BusinessException exception = new BusinessException("Test error");

        assertEquals("Test error", exception.getMessage());
        assertEquals(500, exception.getCode());
    }

    @Test
    @DisplayName("Should create exception with code and message")
    void shouldCreateExceptionWithCodeAndMessage() {
        BusinessException exception = new BusinessException(400, "Bad request");

        assertEquals("Bad request", exception.getMessage());
        assertEquals(400, exception.getCode());
    }

    @Test
    @DisplayName("Should be a RuntimeException")
    void shouldBeRuntimeException() {
        BusinessException exception = new BusinessException("Test");

        assertInstanceOf(RuntimeException.class, exception);
    }

    @Test
    @DisplayName("Should support different error codes")
    void shouldSupportDifferentErrorCodes() {
        BusinessException notFound = new BusinessException(404, "Not found");
        BusinessException forbidden = new BusinessException(403, "Forbidden");
        BusinessException serverError = new BusinessException(500, "Server error");

        assertEquals(404, notFound.getCode());
        assertEquals(403, forbidden.getCode());
        assertEquals(500, serverError.getCode());
    }
}
