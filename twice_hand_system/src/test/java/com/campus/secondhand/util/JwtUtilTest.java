package com.campus.secondhand.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("JWT Utility Tests")
class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", "testSecretKeyForJwtTokenGeneration12345678");
        ReflectionTestUtils.setField(jwtUtil, "expireTime", 86400000L);
    }

    @Test
    @DisplayName("Should generate valid token")
    void generateToken_shouldReturnNonEmptyToken() {
        String token = jwtUtil.generateToken(1L);
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    @DisplayName("Should extract user ID from token")
    void getUserIdFromToken_shouldReturnCorrectUserId() {
        Long userId = 42L;
        String token = jwtUtil.generateToken(userId);
        Long extractedId = jwtUtil.getUserIdFromToken(token);
        assertEquals(userId, extractedId);
    }

    @Test
    @DisplayName("Should validate valid token")
    void validateToken_shouldReturnTrueForValidToken() {
        String token = jwtUtil.generateToken(1L);
        assertTrue(jwtUtil.validateToken(token));
    }

    @Test
    @DisplayName("Should reject invalid token")
    void validateToken_shouldReturnFalseForInvalidToken() {
        assertFalse(jwtUtil.validateToken("invalid.token.here"));
    }

    @Test
    @DisplayName("Should reject tampered token")
    void validateToken_shouldReturnFalseForTamperedToken() {
        String token = jwtUtil.generateToken(1L);
        String tampered = token.substring(0, token.length() - 5) + "XXXXX";
        assertFalse(jwtUtil.validateToken(tampered));
    }

    @Test
    @DisplayName("Should generate different tokens for different users")
    void generateToken_shouldProduceDifferentTokensForDifferentUsers() {
        String token1 = jwtUtil.generateToken(1L);
        String token2 = jwtUtil.generateToken(2L);
        assertNotEquals(token1, token2);
    }

    @Test
    @DisplayName("Should generate different tokens at different times")
    void generateToken_shouldProduceDifferentTokensAtDifferentTimes() throws InterruptedException {
        String token1 = jwtUtil.generateToken(1L);
        Thread.sleep(1100);
        String token2 = jwtUtil.generateToken(1L);
        assertNotEquals(token1, token2);
    }

    @Test
    @DisplayName("Should reject empty token")
    void validateToken_shouldReturnFalseForEmptyToken() {
        assertFalse(jwtUtil.validateToken(""));
    }

    @Test
    @DisplayName("Should reject null token gracefully")
    void validateToken_shouldReturnFalseForNullToken() {
        assertFalse(jwtUtil.validateToken(null));
    }

    @Test
    @DisplayName("Should handle large user ID")
    void generateToken_shouldHandleLargeUserId() {
        Long largeId = 999999999L;
        String token = jwtUtil.generateToken(largeId);
        assertEquals(largeId, jwtUtil.getUserIdFromToken(token));
    }
}
