package com.campus.secondhand.util;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil util() {
        JwtUtil u = new JwtUtil();
        ReflectionTestUtils.setField(u, "secret", "test-secret-test-secret-test-secret-32b");
        ReflectionTestUtils.setField(u, "accessExpireSeconds", 60L);
        ReflectionTestUtils.setField(u, "refreshExpireSeconds", 3600L);
        return u;
    }

    @Test
    void accessToken_validatesAsAccess() {
        JwtUtil u = util();
        String t = u.generateAccessToken(42L);
        assertTrue(u.validate(t, JwtUtil.TYPE_ACCESS));
        assertFalse(u.validate(t, JwtUtil.TYPE_REFRESH));
        assertEquals(42L, u.getUserIdFromToken(t));
    }

    @Test
    void refreshToken_validatesAsRefresh() {
        JwtUtil u = util();
        String t = u.generateRefreshToken(7L);
        assertTrue(u.validate(t, JwtUtil.TYPE_REFRESH));
    }

    @Test
    void tamperedToken_isRejected() {
        JwtUtil u = util();
        String t = u.generateAccessToken(1L) + "x";
        assertFalse(u.validate(t, JwtUtil.TYPE_ACCESS));
    }
}
