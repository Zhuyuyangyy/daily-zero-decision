package com.campus.secondhand.response;

import com.campus.secondhand.enums.ErrorCode;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ResultTest {

    @Test
    void ok_setsOkCodeAndTimestamp() {
        Result<String> r = Result.ok("hello");
        assertEquals(ErrorCode.OK.getCode(), r.getCode());
        assertEquals("hello", r.getData());
        assertNotNull(r.getTimestamp());
    }

    @Test
    void error_usesErrorCode() {
        Result<Void> r = Result.error(ErrorCode.NOT_FOUND);
        assertEquals(ErrorCode.NOT_FOUND.getCode(), r.getCode());
        assertEquals(ErrorCode.NOT_FOUND.getMessage(), r.getMessage());
        assertNull(r.getData());
    }
}
