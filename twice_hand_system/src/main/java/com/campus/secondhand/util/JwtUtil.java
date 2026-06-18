package com.campus.secondhand.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    public static final String CLAIM_TOKEN_TYPE = "type";
    public static final String TYPE_ACCESS = "access";
    public static final String TYPE_REFRESH = "refresh";

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-expire-seconds}")
    private long accessExpireSeconds;

    @Value("${jwt.refresh-expire-seconds}")
    private long refreshExpireSeconds;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(Long userId) {
        return buildToken(userId, TYPE_ACCESS, accessExpireSeconds);
    }

    public String generateRefreshToken(Long userId) {
        return buildToken(userId, TYPE_REFRESH, refreshExpireSeconds);
    }

    private String buildToken(Long userId, String type, long ttlSeconds) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(userId.toString())
                .claim(CLAIM_TOKEN_TYPE, type)
                .setId(UUID.randomUUID().toString())
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + ttlSeconds * 1000L))
                .signWith(key())
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validate(String token, String expectedType) {
        try {
            Claims c = parse(token);
            if (c.getExpiration().before(new Date())) return false;
            Object type = c.get(CLAIM_TOKEN_TYPE);
            return expectedType.equals(type);
        } catch (Exception e) {
            return false;
        }
    }

    public Long getUserIdFromToken(String token) {
        return Long.parseLong(parse(token).getSubject());
    }
}
