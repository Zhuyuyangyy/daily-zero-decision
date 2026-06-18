package com.campus.secondhand.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT 工具类：生成Token、验证Token、解析Token中的用户ID
 */
@Component
public class JwtUtil {

    // JWT密钥（建议在application.yml配置，这里先写死，后续可优化）
    @Value("${jwt.secret:campusSecondhandSecretKey1234567890}")
    private String secret;

    // Token过期时间：24小时（单位：毫秒）
    @Value("${jwt.expire:86400000}")
    private long expireTime;

    /**
     * 生成Token（传入用户ID）
     */
    public String generateToken(Long userId) {
        // 创建加密密钥
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

        // 生成Token
        return Jwts.builder()
                .setSubject(userId.toString()) // 将用户ID存在subject字段
                .setIssuedAt(new Date()) // 签发时间
                .setExpiration(new Date(System.currentTimeMillis() + expireTime)) // 过期时间
                .signWith(key) // 签名
                .compact();
    }

    /**
     * 验证Token是否有效（核心：解决找不到validateToken方法的报错）
     */
    public boolean validateToken(String token) {
        try {
            // 解析Token，若解析失败（过期/签名错误）会抛出异常
            Claims claims = parseToken(token);
            // 检查Token是否过期
            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            // 任何异常都表示Token无效
            return false;
        }
    }

    /**
     * 从Token中解析出用户ID
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = parseToken(token);
        return Long.parseLong(claims.getSubject());
    }

    /**
     * 私有方法：解析Token获取Claims（核心逻辑）
     */
    private Claims parseToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}