package com.campus.secondhand.response;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Result Response Tests")
class ResultTest {

    @Test
    @DisplayName("Should create success result with data")
    void success_shouldCreateResultWithData() {
        String data = "test data";
        Result<String> result = Result.success(data);

        assertEquals(200, result.getCode());
        assertEquals("success", result.getMessage());
        assertEquals("test data", result.getData());
    }

    @Test
    @DisplayName("Should create success result without data")
    void success_shouldCreateResultWithoutData() {
        Result<Void> result = Result.success();

        assertEquals(200, result.getCode());
        assertEquals("success", result.getMessage());
        assertNull(result.getData());
    }

    @Test
    @DisplayName("Should create error result with message")
    void error_shouldCreateResultWithMessage() {
        Result<Void> result = Result.error("Something went wrong");

        assertEquals(500, result.getCode());
        assertEquals("Something went wrong", result.getMessage());
        assertNull(result.getData());
    }

    @Test
    @DisplayName("Should create error result with code and message")
    void error_shouldCreateResultWithCodeAndMessage() {
        Result<Void> result = Result.error(404, "Not found");

        assertEquals(404, result.getCode());
        assertEquals("Not found", result.getMessage());
        assertNull(result.getData());
    }

    @Test
    @DisplayName("Should handle null data in success")
    void success_shouldHandleNullData() {
        Result<Object> result = Result.success(null);

        assertEquals(200, result.getCode());
        assertNull(result.getData());
    }

    @Test
    @DisplayName("Should support generic types")
    void shouldSupportGenericTypes() {
        Result<Integer> intResult = Result.success(42);
        assertEquals(42, intResult.getData());

        Result<Boolean> boolResult = Result.success(true);
        assertEquals(true, boolResult.getData());
    }
}
