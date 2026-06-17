# Full-Stack Spring Boot + Vue 3 Scaffold Template — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `twice_hand_system/` into a reusable full-stack scaffold template — backend boots on MySQL, frontend builds, login + CRUD all work end-to-end, and 5 production seams (cache/search/storage/ratelimit/audit) are present as interface + Noop impl + config switch.

**Architecture:** Single Spring Boot 2.7.18 jar (Java 17) under `src/` with `com.campus.secondhand` package; MyBatis-Plus 3.5.3 + Flyway 8 + BCrypt + JWT (access+refresh). Vite 5 + Vue 3 + Pinia + Vue Router 4 frontend under `frontend/`, with the existing single-file `frontend/index.html` retained as a CDN-only zero-build fallback. API prefix `/api/v1/**`. Result envelope `{code, message, data, timestamp}`. Five "template seam" interfaces with Noop impls that can be swapped for real impls via property switches.

**Tech Stack:** Spring Boot 2.7.18, MyBatis-Plus 3.5.3.1, jjwt 0.11.5, Flyway 8, springdoc-openapi 1.7, BCrypt (spring-security-crypto), JUnit 5, Mockito, H2 (test), Vue 3, Vite 5, Pinia 2, Vue Router 4, Axios, Vitest, MySQL 8, Docker, Docker Compose.

**Reference spec:** `docs/superpowers/specs/2026-06-18-fullstack-template-design.md`

**Phases:**
- P1 — Stabilize backend (controllers → `/api/v1`, SQL/entity alignment, BCrypt, Flyway, Result/ErrorCode)
- P2 — Add template seams (cache, search, storage, ratelimit, audit interfaces + Noop impls)
- P3 — Frontend split (Vite project, Pinia stores, axios interceptors with refresh-on-401)
- P4 — Tests + CI (refresh unit tests, add controller slice tests, Vitest, CI jobs)
- P5 — Docs + .gitignore (rewrite README, write ARCHITECTURE/CONVENTIONS/CHECKLIST)

Each phase ends with `mvn test` green (P3/P4) and a runnable backend.

---

## Phase P1 — Stabilize Backend

### Task 1.1: Add new dependencies (Flyway, springdoc-openapi, spring-security-crypto)

**Files:**
- Modify: `pom.xml`

- [ ] **Step 1: Add Flyway + springdoc-openapi + spring-security-crypto to pom.xml**

Insert these dependencies inside `<dependencies>` (after existing entries, before `</dependencies>`):

```xml
        <!-- Flyway DB migrations -->
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
            <version>8.5.13</version>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-mysql</artifactId>
            <version>8.5.13</version>
        </dependency>

        <!-- OpenAPI/Swagger UI -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-ui</artifactId>
            <version>1.7.0</version>
        </dependency>

        <!-- BCrypt password hashing (no full Spring Security) -->
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-crypto</artifactId>
        </dependency>

        <!-- Test: Spring Boot test starter (already present, ensure scope test) -->
```

- [ ] **Step 2: Verify Maven resolves**

Run: `mvn -q -DskipTests dependency:resolve`
Expected: BUILD SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add pom.xml
git commit -m "build(pom): add flyway, springdoc-openapi, spring-security-crypto"
```

---

### Task 1.2: Add ErrorCode + rewrite Result

**Files:**
- Create: `src/main/java/com/campus/secondhand/enums/ErrorCode.java`
- Modify: `src/main/java/com/campus/secondhand/response/Result.java`

- [ ] **Step 1: Create ErrorCode enum**

File `src/main/java/com/campus/secondhand/enums/ErrorCode.java`:

```java
package com.campus.secondhand.enums;

import lombok.Getter;

@Getter
public enum ErrorCode {
    OK(200, "ok", 200),
    BAD_REQUEST(40000, "bad request", 400),
    UNAUTHORIZED(40100, "unauthorized", 401),
    FORBIDDEN(40300, "forbidden", 403),
    NOT_FOUND(40400, "not found", 404),
    CONFLICT(40900, "conflict", 409),
    INTERNAL(50000, "internal error", 500);

    private final int code;
    private final String message;
    private final int httpStatus;

    ErrorCode(int code, String message, int httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
```

- [ ] **Step 2: Rewrite Result to carry timestamp + ErrorCode-based static helpers**

File `src/main/java/com/campus/secondhand/response/Result.java`:

```java
package com.campus.secondhand.response;

import com.campus.secondhand.enums.ErrorCode;
import lombok.Data;

@Data
public class Result<T> {
    private Integer code;
    private String message;
    private T data;
    private Long timestamp;

    public Result() {}

    public Result(Integer code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.timestamp = System.currentTimeMillis();
    }

    public static <T> Result<T> ok(T data) {
        return new Result<>(ErrorCode.OK.getCode(), ErrorCode.OK.getMessage(), data);
    }

    public static <T> Result<T> ok() {
        return new Result<>(ErrorCode.OK.getCode(), ErrorCode.OK.getMessage(), null);
    }

    public static <T> Result<T> error(ErrorCode ec) {
        return new Result<>(ec.getCode(), ec.getMessage(), null);
    }

    public static <T> Result<T> error(ErrorCode ec, String message) {
        return new Result<>(ec.getCode(), message, null);
    }
}
```

- [ ] **Step 3: Add a failing test for Result**

Create file `src/test/java/com/campus/secondhand/response/ResultTest.java`:

```java
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
```

- [ ] **Step 4: Run the test**

Run: `mvn -q test -Dtest=ResultTest`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/main/java/com/campus/secondhand/enums/ErrorCode.java \
        src/main/java/com/campus/secondhand/response/Result.java \
        src/test/java/com/campus/secondhand/response/ResultTest.java
git commit -m "feat(response): add ErrorCode enum and rewrite Result with timestamp"
```

---

### Task 1.3: Add PageResponse<T>

**Files:**
- Create: `src/main/java/com/campus/secondhand/dto/PageResponse.java`

- [ ] **Step 1: Create PageResponse**

File `src/main/java/com/campus/secondhand/dto/PageResponse.java`:

```java
package com.campus.secondhand.dto;

import com.baomidou.mybatisplus.core.metadata.IPage;
import lombok.Data;

import java.util.Collections;
import java.util.List;

@Data
public class PageResponse<T> {
    private List<T> records;
    private long total;
    private long page;
    private long size;

    public PageResponse() {
        this.records = Collections.emptyList();
    }

    public PageResponse(List<T> records, long total, long page, long size) {
        this.records = records;
        this.total = total;
        this.page = page;
        this.size = size;
    }

    public static <T> PageResponse<T> of(IPage<T> p) {
        return new PageResponse<>(p.getRecords(), p.getTotal(), p.getCurrent(), p.getSize());
    }
}
```

- [ ] **Step 2: Compile to verify**

Run: `mvn -q compile`
Expected: BUILD SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add src/main/java/com/campus/secondhand/dto/PageResponse.java
git commit -m "feat(dto): add PageResponse<T> wrapper for paginated endpoints"
```

---

### Task 1.4: Add BaseEntity + entity field alignment

**Files:**
- Create: `src/main/java/com/campus/secondhand/entity/BaseEntity.java`
- Modify: `src/main/java/com/campus/secondhand/entity/User.java`
- Modify: `src/main/java/com/campus/secondhand/entity/Goods.java`
- Modify: `src/main/java/com/campus/secondhand/entity/Order.java`

- [ ] **Step 1: Create BaseEntity**

File `src/main/java/com/campus/secondhand/entity/BaseEntity.java`:

```java
package com.campus.secondhand.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableLogic;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public abstract class BaseEntity {
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    @TableField("deleted")
    private Integer deleted;
}
```

- [ ] **Step 2: Rewrite User**

File `src/main/java/com/campus/secondhand/entity/User.java`:

```java
package com.campus.secondhand.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("users")
public class User extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String username;
    private String password;
    private String nickname;
    private String phone;
    private String email;
    private String school;
    private String studentId;
    private Integer status;
}
```

- [ ] **Step 3: Rewrite Goods**

File `src/main/java/com/campus/secondhand/entity/Goods.java`:

```java
package com.campus.secondhand.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("goods")
public class Goods extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String name;
    private String description;
    private Long categoryId;
    private String categoryName;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String images;
    private Integer condition;
    private Integer status;
    private Integer viewCount;
    private Integer wantCount;
}
```

- [ ] **Step 4: Rewrite Order**

File `src/main/java/com/campus/secondhand/entity/Order.java`:

```java
package com.campus.secondhand.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("orders")
public class Order extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String orderNo;
    private Long goodsId;
    private String goodsTitle;
    private BigDecimal goodsPrice;
    private Long sellerId;
    private Long buyerId;
    private String buyerName;
    private String buyerPhone;
    private String buyerAddress;
    private String remark;
    private Integer status;
    @TableField("payment_time")
    private LocalDateTime paymentTime;
    @TableField("delivery_time")
    private LocalDateTime deliveryTime;
    @TableField("receive_time")
    private LocalDateTime receiveTime;
    @TableField("complete_time")
    private LocalDateTime completeTime;
}
```

- [ ] **Step 5: Compile to verify entity graph is consistent**

Run: `mvn -q compile`
Expected: BUILD SUCCESS.

- [ ] **Step 6: Commit**

```bash
git add src/main/java/com/campus/secondhand/entity/
git commit -m "feat(entity): add BaseEntity, align User/Goods/Order fields with SQL"
```

---

### Task 1.5: Add Flyway V1__init.sql aligned with new entities

**Files:**
- Create: `src/main/resources/db/migration/V1__init.sql`
- Delete: `src/main/resources/sql/init.sql` (replaced by Flyway)

- [ ] **Step 1: Create V1__init.sql**

File `src/main/resources/db/migration/V1__init.sql`:

```sql
-- Campus SecondHand — initial schema
-- Aligned with com.campus.secondhand.entity (BaseEntity + User/Goods/Order)

CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `nickname` VARCHAR(50) DEFAULT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    `email` VARCHAR(100) DEFAULT NULL,
    `school` VARCHAR(100) DEFAULT NULL,
    `student_id` VARCHAR(20) DEFAULT NULL,
    `status` INT DEFAULT 1,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_users_username` (`username`),
    UNIQUE KEY `uk_users_phone` (`phone`),
    UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `category` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `parent_id` BIGINT DEFAULT 0,
    `icon` VARCHAR(255) DEFAULT NULL,
    `sort` INT DEFAULT 0,
    `status` TINYINT DEFAULT 1,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `idx_category_parent` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `goods` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `category_id` BIGINT DEFAULT NULL,
    `category_name` VARCHAR(50) DEFAULT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    `original_price` DECIMAL(10,2) DEFAULT NULL,
    `images` VARCHAR(1000) DEFAULT NULL,
    `condition` TINYINT DEFAULT 1,
    `status` TINYINT DEFAULT 1,
    `view_count` INT DEFAULT 0,
    `want_count` INT DEFAULT 0,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `idx_goods_user` (`user_id`),
    KEY `idx_goods_category` (`category_id`),
    KEY `idx_goods_status` (`status`),
    KEY `idx_goods_create` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `orders` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_no` VARCHAR(50) NOT NULL,
    `goods_id` BIGINT NOT NULL,
    `goods_title` VARCHAR(100) NOT NULL,
    `goods_price` DECIMAL(10,2) NOT NULL,
    `seller_id` BIGINT NOT NULL,
    `buyer_id` BIGINT NOT NULL,
    `buyer_name` VARCHAR(50) DEFAULT NULL,
    `buyer_phone` VARCHAR(20) DEFAULT NULL,
    `buyer_address` VARCHAR(255) DEFAULT NULL,
    `remark` VARCHAR(500) DEFAULT NULL,
    `status` TINYINT DEFAULT 0,
    `payment_time` DATETIME DEFAULT NULL,
    `delivery_time` DATETIME DEFAULT NULL,
    `receive_time` DATETIME DEFAULT NULL,
    `complete_time` DATETIME DEFAULT NULL,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_orders_no` (`order_no`),
    KEY `idx_orders_goods` (`goods_id`),
    KEY `idx_orders_seller` (`seller_id`),
    KEY `idx_orders_buyer` (`buyer_id`),
    KEY `idx_orders_status` (`status`),
    KEY `idx_orders_create` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed: a default category tree (mirrors the previous init.sql data)
INSERT INTO `category` (`name`, `parent_id`, `sort`) VALUES
    ('数码产品', 0, 1),
    ('手机', 1, 1),
    ('电脑', 1, 2),
    ('图书教材', 0, 2),
    ('生活用品', 0, 3),
    ('服装', 0, 4),
    ('其他', 0, 99)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
```

- [ ] **Step 2: Remove old init.sql**

Run: `git rm src/main/resources/sql/init.sql`
Expected: `rm 'src/main/resources/sql/init.sql'`

- [ ] **Step 3: Update application.yml to enable Flyway (Task 1.6 covers full file)**

Skip — Task 1.6 will rewrite application.yml.

- [ ] **Step 4: Commit**

```bash
git add src/main/resources/db/migration/V1__init.sql
git commit -m "feat(db): add Flyway V1__init.sql aligned with new entities"
```

---

### Task 1.6: Rewrite application.yml with profile split

**Files:**
- Modify: `src/main/resources/application.yml`
- Create: `src/main/resources/application-dev.yml`
- Create: `src/main/resources/application-prod.yml`

- [ ] **Step 1: Rewrite application.yml**

File `src/main/resources/application.yml`:

```yaml
spring:
  profiles:
    active: dev
  application:
    name: campus-secondhand
  jackson:
    date-format: yyyy-MM-dd HH:mm:ss
    time-zone: Asia/Shanghai
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

server:
  port: 8080
  servlet:
    context-path: /

mybatis-plus:
  mapper-locations: classpath*:/mapper/**/*.xml
  type-aliases-package: com.campus.secondhand.entity
  configuration:
    map-underscore-to-camel-case: true
  global-config:
    db-config:
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0

springdoc:
  api-docs:
    path: /v3/api-docs
  swagger-ui:
    path: /swagger-ui.html

jwt:
  secret: ${JWT_SECRET:please-change-me-this-is-a-dev-only-secret-32bytes-min}
  access-expire-seconds: 900
  refresh-expire-seconds: 604800

# Template seam switches — flip to true in application-prod.yml to enable real impls
template:
  cache:    { enabled: false }
  search:   { enabled: false }
  storage:  { enabled: false }
  ratelimit:{ enabled: false }
  audit:    { enabled: false }

logging:
  level:
    root: INFO
    com.campus.secondhand: DEBUG
```

- [ ] **Step 2: Create dev profile**

File `src/main/resources/application-dev.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:school_secondary}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Shanghai&characterEncoding=utf8
    username: ${DB_USER:root}
    password: ${DB_PASSWORD:root}
    driver-class-name: com.mysql.cj.jdbc.Driver
  flyway:
    clean-disabled: true

logging:
  level:
    com.campus.secondhand: DEBUG
```

- [ ] **Step 3: Create prod profile (no real values — read from env)**

File `src/main/resources/application-prod.yml`:

```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5

# Enable all seams in prod by default; override per env
template:
  cache:    { enabled: ${TEMPLATE_CACHE_ENABLED:false} }
  search:   { enabled: ${TEMPLATE_SEARCH_ENABLED:false} }
  storage:  { enabled: ${TEMPLATE_STORAGE_ENABLED:false} }
  ratelimit:{ enabled: ${TEMPLATE_RATELIMIT_ENABLED:true} }
  audit:    { enabled: ${TEMPLATE_AUDIT_ENABLED:true} }

logging:
  level:
    root: WARN
    com.campus.secondhand: INFO
```

- [ ] **Step 4: Verify the file set is parseable**

Run: `mvn -q -DskipTests spring-boot:run &` then `sleep 12` then `curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:8080/v3/api-docs` then `kill %1`
Expected: `200`.

- [ ] **Step 5: Commit**

```bash
git add src/main/resources/application.yml \
        src/main/resources/application-dev.yml \
        src/main/resources/application-prod.yml
git commit -m "build(config): split application.yml into dev/prod profiles, enable Flyway"
```

---

### Task 1.7: Rewrite JwtUtil to support access + refresh tokens

**Files:**
- Modify: `src/main/java/com/campus/secondhand/util/JwtUtil.java`
- Modify: `src/test/java/com/campus/secondhand/util/JwtUtilTest.java`

- [ ] **Step 1: Rewrite JwtUtil**

File `src/main/java/com/campus/secondhand/util/JwtUtil.java`:

```java
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
```

- [ ] **Step 2: Replace JwtUtilTest with the new contract**

File `src/test/java/com/campus/secondhand/util/JwtUtilTest.java`:

```java
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
```

- [ ] **Step 3: Run the test**

Run: `mvn -q test -Dtest=JwtUtilTest`
Expected: PASS (3 tests).

- [ ] **Step 4: Commit**

```bash
git add src/main/java/com/campus/secondhand/util/JwtUtil.java \
        src/test/java/com/campus/secondhand/util/JwtUtilTest.java
git commit -m "feat(jwt): add access+refresh token types, update JwtUtilTest"
```

---

### Task 1.8: Rewrite JwtInterceptor to use new JwtUtil

**Files:**
- Modify: `src/main/java/com/campus/secondhand/interceptor/JwtInterceptor.java`

- [ ] **Step 1: Rewrite JwtInterceptor**

File `src/main/java/com/campus/secondhand/interceptor/JwtInterceptor.java`:

```java
package com.campus.secondhand.interceptor;

import com.campus.secondhand.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    public static final String ATTR_USER_ID = "currentUserId";

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;

        String token = extractToken(request);
        if (token == null || token.isEmpty()) {
            return reject(response, 401, "{\"code\":40100,\"message\":\"unauthorized\"}");
        }
        if (!jwtUtil.validate(token, JwtUtil.TYPE_ACCESS)) {
            return reject(response, 401, "{\"code\":40100,\"message\":\"invalid or expired token\"}");
        }

        Long userId = jwtUtil.getUserIdFromToken(token);
        request.setAttribute(ATTR_USER_ID, userId);
        return true;
    }

    private String extractToken(HttpServletRequest request) {
        String h = request.getHeader("token");
        if (h != null && !h.isEmpty()) return h;
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return auth.substring(7);
        return null;
    }

    private boolean reject(HttpServletResponse response, int status, String body) {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        try (PrintWriter w = response.getWriter()) {
            w.write(body);
        } catch (Exception ignored) {}
        return false;
    }
}
```

- [ ] **Step 2: Compile + run existing tests to make sure nothing broke**

Run: `mvn -q test`
Expected: BUILD SUCCESS (some tests may fail because controllers haven't been moved to /api/v1 yet — that's expected; record the count and continue).

- [ ] **Step 3: Commit**

```bash
git add src/main/java/com/campus/secondhand/interceptor/JwtInterceptor.java
git commit -m "refactor(jwt): rewrite interceptor against new JwtUtil contract"
```

---

### Task 1.9: Rewrite WebConfig to use `/api/v1` paths

**Files:**
- Modify: `src/main/java/com/campus/secondhand/config/WebConfig.java`

- [ ] **Step 1: Rewrite WebConfig**

File `src/main/java/com/campus/secondhand/config/WebConfig.java`:

```java
package com.campus.secondhand.config;

import com.campus.secondhand.interceptor.JwtInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private JwtInterceptor jwtInterceptor;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtInterceptor)
                .addPathPatterns("/api/v1/**")
                .excludePathPatterns(
                        "/api/v1/auth/login",
                        "/api/v1/auth/refresh",
                        "/api/v1/goods",
                        "/api/v1/goods/**"
                );
    }
}
```

- [ ] **Step 2: Compile to verify**

Run: `mvn -q compile`
Expected: BUILD SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add src/main/java/com/campus/secondhand/config/WebConfig.java
git commit -m "fix(config): switch interceptor path to /api/v1/**, exclude public goods/auth"
```

---

### Task 1.10: Rewrite UserController under `/api/v1/users`

**Files:**
- Modify: `src/main/java/com/campus/secondhand/controller/UserController.java`

- [ ] **Step 1: Rewrite UserController**

File `src/main/java/com/campus/secondhand/controller/UserController.java`:

```java
package com.campus.secondhand.controller;

import com.campus.secondhand.entity.User;
import com.campus.secondhand.interceptor.JwtInterceptor;
import com.campus.secondhand.response.Result;
import com.campus.secondhand.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public Result<User> me(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtInterceptor.ATTR_USER_ID);
        return Result.ok(userService.getUserById(userId));
    }

    @PutMapping("/me")
    public Result<User> updateMe(@RequestBody User patch, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtInterceptor.ATTR_USER_ID);
        patch.setId(userId);
        return Result.ok(userService.updateUser(patch));
    }
}
```

- [ ] **Step 2: Compile to verify**

Run: `mvn -q compile`
Expected: BUILD SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add src/main/java/com/campus/secondhand/controller/UserController.java
git commit -m "refactor(controller): move UserController to /api/v1/users"
```

---

### Task 1.11: Add AuthController for login/refresh/logout

**Files:**
- Create: `src/main/java/com/campus/secondhand/controller/AuthController.java`
- Create: `src/main/java/com/campus/secondhand/dto/TokenResponse.java`

- [ ] **Step 1: Create TokenResponse DTO**

File `src/main/java/com/campus/secondhand/dto/TokenResponse.java`:

```java
package com.campus.secondhand.dto;

import com.campus.secondhand.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenResponse {
    private String accessToken;
    private String refreshToken;
    private long accessExpiresIn;
    private User user;
}
```

- [ ] **Step 2: Create AuthController**

File `src/main/java/com/campus/secondhand/controller/AuthController.java`:

```java
package com.campus.secondhand.controller;

import com.campus.secondhand.dto.LoginRequest;
import com.campus.secondhand.dto.RegisterRequest;
import com.campus.secondhand.dto.TokenResponse;
import com.campus.secondhand.entity.User;
import com.campus.secondhand.enums.ErrorCode;
import com.campus.secondhand.exception.BusinessException;
import com.campus.secondhand.response.Result;
import com.campus.secondhand.service.UserService;
import com.campus.secondhand.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${jwt.access-expire-seconds}")
    private long accessExpire;

    @PostMapping("/login")
    public Result<TokenResponse> login(@RequestBody LoginRequest request) {
        User user = userService.login(request);
        return Result.ok(new TokenResponse(
                jwtUtil.generateAccessToken(user.getId()),
                jwtUtil.generateRefreshToken(user.getId()),
                accessExpire,
                user
        ));
    }

    @PostMapping("/register")
    public Result<User> register(@RequestBody RegisterRequest request) {
        Long userId = userService.register(request);
        return Result.ok(userService.getUserById(userId));
    }

    @PostMapping("/refresh")
    public Result<TokenResponse> refresh(@RequestBody Map<String, String> body) {
        String refresh = body.get("refreshToken");
        if (refresh == null || !jwtUtil.validate(refresh, JwtUtil.TYPE_REFRESH)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "invalid refresh token");
        }
        Long userId = jwtUtil.getUserIdFromToken(refresh);
        User user = userService.getUserById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "user not found");
        }
        return Result.ok(new TokenResponse(
                jwtUtil.generateAccessToken(userId),
                jwtUtil.generateRefreshToken(userId),
                accessExpire,
                user
        ));
    }
}
```

- [ ] **Step 3: Compile to verify**

Run: `mvn -q compile`
Expected: BUILD SUCCESS.

- [ ] **Step 4: Commit**

```bash
git add src/main/java/com/campus/secondhand/controller/AuthController.java \
        src/main/java/com/campus/secondhand/dto/TokenResponse.java
git commit -m "feat(auth): add AuthController with login/register/refresh"
```

---

### Task 1.12: Add BusinessException + rewrite GlobalExceptionHandler

**Files:**
- Modify: `src/main/java/com/campus/secondhand/exception/BusinessException.java`
- Modify: `src/main/java/com/campus/secondhand/exception/GlobalExceptionHandler.java`

- [ ] **Step 1: Rewrite BusinessException to carry ErrorCode**

File `src/main/java/com/campus/secondhand/exception/BusinessException.java`:

```java
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
}
```

- [ ] **Step 2: Rewrite GlobalExceptionHandler**

File `src/main/java/com/campus/secondhand/exception/GlobalExceptionHandler.java`:

```java
package com.campus.secondhand.exception;

import com.campus.secondhand.enums.ErrorCode;
import com.campus.secondhand.response.Result;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Result<Void>> handleBusiness(BusinessException e) {
        return ResponseEntity
                .status(e.getErrorCode().getHttpStatus())
                .body(Result.error(e.getErrorCode(), e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Result<Void>> handleValidation(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .orElse("validation failed");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Result.error(ErrorCode.BAD_REQUEST, msg));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Result<Void>> handleAny(Exception e) {
        log.error("unhandled exception", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Result.error(ErrorCode.INTERNAL));
    }
}
```

- [ ] **Step 3: Compile to verify**

Run: `mvn -q compile`
Expected: BUILD SUCCESS.

- [ ] **Step 4: Commit**

```bash
git add src/main/java/com/campus/secondhand/exception/
git commit -m "feat(exception): rewrite BusinessException + GlobalExceptionHandler with ErrorCode"
```

---

### Task 1.13: Rewrite UserServiceImpl + UserService interface for BCrypt

**Files:**
- Modify: `src/main/java/com/campus/secondhand/service/UserService.java`
- Modify: `src/main/java/com/campus/secondhand/service/impl/UserServiceImpl.java`
- Create: `src/main/java/com/campus/secondhand/config/SecurityConfig.java`

- [ ] **Step 1: Add SecurityConfig with BCryptPasswordEncoder bean**

File `src/main/java/com/campus/secondhand/config/SecurityConfig.java`:

```java
package com.campus.secondhand.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

- [ ] **Step 2: Update UserService interface to return User from login**

File `src/main/java/com/campus/secondhand/service/UserService.java`:

```java
package com.campus.secondhand.service;

import com.campus.secondhand.dto.LoginRequest;
import com.campus.secondhand.dto.RegisterRequest;
import com.campus.secondhand.entity.User;

public interface UserService {
    User login(LoginRequest request);
    Long register(RegisterRequest request);
    User getUserById(Long id);
    User getUserByUsername(String username);
    User updateUser(User user);
    boolean existsByUsername(String username);
    boolean existsByPhone(String phone);
}
```

- [ ] **Step 3: Rewrite UserServiceImpl with BCrypt**

File `src/main/java/com/campus/secondhand/service/impl/UserServiceImpl.java`:

```java
package com.campus.secondhand.service.impl;

import com.campus.secondhand.dto.LoginRequest;
import com.campus.secondhand.dto.RegisterRequest;
import com.campus.secondhand.entity.User;
import com.campus.secondhand.enums.ErrorCode;
import com.campus.secondhand.exception.BusinessException;
import com.campus.secondhand.mapper.UserMapper;
import com.campus.secondhand.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public User login(LoginRequest request) {
        User user = userMapper.getByUsername(request.getUsername());
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "用户名或密码错误");
        }
        if (user.getStatus() == null || user.getStatus() != 1) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "用户已被禁用");
        }
        user.setPassword(null);
        return user;
    }

    @Override
    public Long register(RegisterRequest request) {
        if (existsByUsername(request.getUsername())) {
            throw new BusinessException(ErrorCode.CONFLICT, "用户名已存在");
        }
        if (request.getPhone() != null && existsByPhone(request.getPhone())) {
            throw new BusinessException(ErrorCode.CONFLICT, "手机号已被注册");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setSchool(request.getSchool());
        user.setStudentId(request.getStudentId());
        user.setStatus(1);
        userMapper.insert(user);
        return user.getId();
    }

    @Override public User getUserById(Long id) { return userMapper.selectById(id); }

    @Override public User getUserByUsername(String username) { return userMapper.getByUsername(username); }

    @Override
    public User updateUser(User user) {
        userMapper.updateById(user);
        return userMapper.selectById(user.getId());
    }

    @Override public boolean existsByUsername(String username) { return userMapper.getByUsername(username) != null; }
    @Override public boolean existsByPhone(String phone) { return userMapper.getByPhone(phone) != null; }
}
```

- [ ] **Step 4: Compile to verify**

Run: `mvn -q compile`
Expected: BUILD SUCCESS.

- [ ] **Step 5: Commit**

```bash
git add src/main/java/com/campus/secondhand/config/SecurityConfig.java \
        src/main/java/com/campus/secondhand/service/UserService.java \
        src/main/java/com/campus/secondhand/service/impl/UserServiceImpl.java
git commit -m "feat(user): switch to BCrypt, return User from login, raise BusinessException"
```

---

### Task 1.14: Rewrite GoodsController under `/api/v1/goods` with paginated list

**Files:**
- Modify: `src/main/java/com/campus/secondhand/controller/GoodsController.java`
- Modify: `src/main/java/com/campus/secondhand/service/GoodsService.java`
- Modify: `src/main/java/com/campus/secondhand/service/impl/GoodsServiceImpl.java`

- [ ] **Step 1: Update GoodsService interface to support pagination + status transitions**

File `src/main/java/com/campus/secondhand/service/GoodsService.java`:

```java
package com.campus.secondhand.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.campus.secondhand.entity.Goods;

import java.util.List;

public interface GoodsService {
    IPage<Goods> list(int page, int size, String keyword, Integer status);
    Goods getById(Long id);
    List<Goods> listByUserId(Long userId);
    Goods create(Goods goods, Long userId);
    Goods update(Goods goods);
    void delete(Long id);
    void updateStatus(Long id, Integer status, Long userId);
}
```

- [ ] **Step 2: Rewrite GoodsServiceImpl**

File `src/main/java/com/campus/secondhand/service/impl/GoodsServiceImpl.java`:

```java
package com.campus.secondhand.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.campus.secondhand.entity.Goods;
import com.campus.secondhand.enums.ErrorCode;
import com.campus.secondhand.exception.BusinessException;
import com.campus.secondhand.mapper.GoodsMapper;
import com.campus.secondhand.service.GoodsService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class GoodsServiceImpl extends ServiceImpl<GoodsMapper, Goods> implements GoodsService {

    @Override
    public IPage<Goods> list(int page, int size, String keyword, Integer status) {
        QueryWrapper<Goods> q = new QueryWrapper<>();
        if (status != null) q.eq("status", status);
        if (StringUtils.hasText(keyword)) q.like("name", keyword);
        q.orderByDesc("create_time");
        return page(new Page<>(page, size), q);
    }

    @Override public Goods getById(Long id) { return getBaseMapper().selectById(id); }

    @Override
    public List<Goods> listByUserId(Long userId) {
        return getBaseMapper().selectList(new QueryWrapper<Goods>().eq("user_id", userId).orderByDesc("create_time"));
    }

    @Override
    public Goods create(Goods goods, Long userId) {
        goods.setId(null);
        goods.setUserId(userId);
        if (goods.getStatus() == null) goods.setStatus(1);
        if (goods.getViewCount() == null) goods.setViewCount(0);
        if (goods.getWantCount() == null) goods.setWantCount(0);
        save(goods);
        return goods;
    }

    @Override
    public Goods update(Goods goods) {
        Goods existing = getById(goods.getId());
        if (existing == null) throw new BusinessException(ErrorCode.NOT_FOUND, "商品不存在");
        goods.setUserId(null); // never reassign owner
        updateById(goods);
        return getById(goods.getId());
    }

    @Override
    public void delete(Long id) {
        removeById(id);
    }

    @Override
    public void updateStatus(Long id, Integer status, Long userId) {
        Goods g = getById(id);
        if (g == null) throw new BusinessException(ErrorCode.NOT_FOUND, "商品不存在");
        if (!g.getUserId().equals(userId)) throw new BusinessException(ErrorCode.FORBIDDEN, "无权操作");
        g.setStatus(status);
        updateById(g);
    }
}
```

- [ ] **Step 3: Rewrite GoodsController**

File `src/main/java/com/campus/secondhand/controller/GoodsController.java`:

```java
package com.campus.secondhand.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.campus.secondhand.dto.PageResponse;
import com.campus.secondhand.entity.Goods;
import com.campus.secondhand.interceptor.JwtInterceptor;
import com.campus.secondhand.response.Result;
import com.campus.secondhand.service.GoodsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/v1/goods")
public class GoodsController {

    @Autowired
    private GoodsService goodsService;

    @GetMapping
    public Result<PageResponse<Goods>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status) {
        IPage<Goods> p = goodsService.list(page, size, keyword, status);
        return Result.ok(PageResponse.of(p));
    }

    @GetMapping("/{id}")
    public Result<Goods> detail(@PathVariable Long id) {
        return Result.ok(goodsService.getById(id));
    }

    @GetMapping("/mine")
    public Result<List<Goods>> mine(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtInterceptor.ATTR_USER_ID);
        return Result.ok(goodsService.listByUserId(userId));
    }

    @PostMapping
    public Result<Goods> create(@RequestBody Goods goods, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtInterceptor.ATTR_USER_ID);
        return Result.ok(goodsService.create(goods, userId));
    }

    @PutMapping("/{id}")
    public Result<Goods> update(@PathVariable Long id, @RequestBody Goods goods) {
        goods.setId(id);
        return Result.ok(goodsService.update(goods));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        goodsService.delete(id);
        return Result.ok();
    }

    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtInterceptor.ATTR_USER_ID);
        goodsService.updateStatus(id, status, userId);
        return Result.ok();
    }
}
```

- [ ] **Step 4: Compile to verify**

Run: `mvn -q compile`
Expected: BUILD SUCCESS.

- [ ] **Step 5: Commit**

```bash
git add src/main/java/com/campus/secondhand/controller/GoodsController.java \
        src/main/java/com/campus/secondhand/service/GoodsService.java \
        src/main/java/com/campus/secondhand/service/impl/GoodsServiceImpl.java
git commit -m "feat(goods): paginated list, owner-checked mutations, /api/v1/goods"
```

---

### Task 1.15: Rewrite OrderController under `/api/v1/orders` with orderNo + snapshot

**Files:**
- Modify: `src/main/java/com/campus/secondhand/controller/OrderController.java`
- Modify: `src/main/java/com/campus/secondhand/service/OrderService.java`
- Modify: `src/main/java/com/campus/secondhand/service/impl/OrderServiceImpl.java`

- [ ] **Step 1: Update OrderService interface**

File `src/main/java/com/campus/secondhand/service/OrderService.java`:

```java
package com.campus.secondhand.service;

import com.campus.secondhand.entity.Order;
import com.campus.secondhand.entity.OrderCreateRequest;

import java.util.List;

public interface OrderService {
    Order create(OrderCreateRequest req, Long buyerId);
    List<Order> listByBuyer(Long buyerId);
    List<Order> listBySeller(Long sellerId);
    Order updateStatus(Long id, Integer status, Long currentUserId);
}
```

- [ ] **Step 2: Create OrderCreateRequest DTO**

File `src/main/java/com/campus/secondhand/dto/OrderCreateRequest.java`:

```java
package com.campus.secondhand.dto;

import lombok.Data;

@Data
public class OrderCreateRequest {
    private Long goodsId;
    private String buyerName;
    private String buyerPhone;
    private String buyerAddress;
    private String remark;
}
```

- [ ] **Step 3: Rewrite OrderServiceImpl with orderNo + snapshot**

File `src/main/java/com/campus/secondhand/service/impl/OrderServiceImpl.java`:

```java
package com.campus.secondhand.service.impl;

import com.campus.secondhand.dto.OrderCreateRequest;
import com.campus.secondhand.entity.Goods;
import com.campus.secondhand.entity.Order;
import com.campus.secondhand.enums.ErrorCode;
import com.campus.secondhand.exception.BusinessException;
import com.campus.secondhand.mapper.OrderMapper;
import com.campus.secondhand.service.GoodsService;
import com.campus.secondhand.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired private OrderMapper orderMapper;
    @Autowired private GoodsService goodsService;

    private static final DateTimeFormatter NO_FMT = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS");

    @Override
    public Order create(OrderCreateRequest req, Long buyerId) {
        Goods goods = goodsService.getById(req.getGoodsId());
        if (goods == null) throw new BusinessException(ErrorCode.NOT_FOUND, "商品不存在");
        if (goods.getUserId().equals(buyerId)) throw new BusinessException(ErrorCode.BAD_REQUEST, "不能购买自己的商品");
        if (goods.getStatus() == null || goods.getStatus() != 1) throw new BusinessException(ErrorCode.CONFLICT, "商品已下架或已售出");

        Order order = new Order();
        order.setOrderNo(NO_FMT.format(LocalDateTime.now()) + "-" + UUID.randomUUID().toString().substring(0, 8));
        order.setGoodsId(goods.getId());
        order.setGoodsTitle(goods.getName());
        order.setGoodsPrice(goods.getPrice());
        order.setSellerId(goods.getUserId());
        order.setBuyerId(buyerId);
        order.setBuyerName(req.getBuyerName());
        order.setBuyerPhone(req.getBuyerPhone());
        order.setBuyerAddress(req.getBuyerAddress());
        order.setRemark(req.getRemark());
        order.setStatus(0);
        orderMapper.insert(order);

        // Mark goods as sold
        goods.setStatus(2);
        goodsService.update(goods);

        return orderMapper.selectById(order.getId());
    }

    @Override public List<Order> listByBuyer(Long buyerId) {
        return orderMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<Order>()
                        .eq("buyer_id", buyerId).orderByDesc("create_time"));
    }

    @Override public List<Order> listBySeller(Long sellerId) {
        return orderMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<Order>()
                        .eq("seller_id", sellerId).orderByDesc("create_time"));
    }

    @Override
    public Order updateStatus(Long id, Integer status, Long currentUserId) {
        Order order = orderMapper.selectById(id);
        if (order == null) throw new BusinessException(ErrorCode.NOT_FOUND, "订单不存在");
        if (!order.getBuyerId().equals(currentUserId) && !order.getSellerId().equals(currentUserId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "无权操作");
        }
        order.setStatus(status);
        orderMapper.updateById(order);
        return order;
    }
}
```

- [ ] **Step 4: Rewrite OrderController**

File `src/main/java/com/campus/secondhand/controller/OrderController.java`:

```java
package com.campus.secondhand.controller;

import com.campus.secondhand.dto.OrderCreateRequest;
import com.campus.secondhand.entity.Order;
import com.campus.secondhand.interceptor.JwtInterceptor;
import com.campus.secondhand.response.Result;
import com.campus.secondhand.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public Result<Order> create(@RequestBody OrderCreateRequest req, HttpServletRequest request) {
        Long buyerId = (Long) request.getAttribute(JwtInterceptor.ATTR_USER_ID);
        return Result.ok(orderService.create(req, buyerId));
    }

    @GetMapping("/mine/buy")
    public Result<List<Order>> myBuy(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtInterceptor.ATTR_USER_ID);
        return Result.ok(orderService.listByBuyer(userId));
    }

    @GetMapping("/mine/sell")
    public Result<List<Order>> mySell(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtInterceptor.ATTR_USER_ID);
        return Result.ok(orderService.listBySeller(userId));
    }

    @PutMapping("/{id}/status")
    public Result<Order> updateStatus(@PathVariable Long id, @RequestParam Integer status, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtInterceptor.ATTR_USER_ID);
        return Result.ok(orderService.updateStatus(id, status, userId));
    }
}
```

- [ ] **Step 5: Compile to verify**

Run: `mvn -q compile`
Expected: BUILD SUCCESS.

- [ ] **Step 6: Commit**

```bash
git add src/main/java/com/campus/secondhand/controller/OrderController.java \
        src/main/java/com/campus/secondhand/service/OrderService.java \
        src/main/java/com/campus/secondhand/service/impl/OrderServiceImpl.java \
        src/main/java/com/campus/secondhand/dto/OrderCreateRequest.java
git commit -m "feat(orders): /api/v1/orders with orderNo+goods snapshot, owner-checked transitions"
```

---

### Task 1.16: Delete old `service.UserService` and `service.OrderService` if duplicated

- [ ] **Step 1: Verify there is no `service/UserServiceImpl.java` or `service/OrderServiceImpl.java` outside `impl/`**

Run: `find src/main/java -name "*ServiceImpl.java" -not -path "*/impl/*"`
Expected: no output.

- [ ] **Step 2: Compile to ensure no missing classes**

Run: `mvn -q compile`
Expected: BUILD SUCCESS.

If `UserServiceImpl`/`OrderServiceImpl` was found outside `impl/`, remove it with `git rm` and re-compile.

- [ ] **Step 3: Commit (only if a file was removed)**

```bash
git add -A
git diff --cached --quiet || git commit -m "chore: remove duplicate service impls outside impl/"
```

---

### Task 1.17: P1 end-to-end smoke (start app, hit endpoints)

- [ ] **Step 1: Start the app against H2 in-memory for smoke**

Run: `SPRING_PROFILES_ACTIVE=dev SPRING_DATASOURCE_URL=jdbc:h2:mem:test;MODE=MySQL;DATABASE_TO_LOWER=TRUE;CASE_INSENSITIVE_IDENTIFIERS=TRUE DB_USER=sa DB_PASSWORD= mvn -q -DskipTests spring-boot:run &`
then `sleep 25` then continue.

- [ ] **Step 2: Register a user, login, list goods, create goods**

```bash
curl -sS -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"alice123","nickname":"Alice","phone":"13800000001"}'

TOKEN=$(curl -sS -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"alice123"}' | python -c 'import sys,json;print(json.load(sys.stdin)["data"]["accessToken"])')

curl -sS -X POST http://localhost:8080/api/v1/goods \
  -H "Content-Type: application/json" -H "token: $TOKEN" \
  -d '{"name":"二手教材","price":25.00,"description":"九成新"}'

curl -sS "http://localhost:8080/api/v1/goods?page=1&size=10"
```

Expected: each curl returns `{"code":200,"message":"ok",...}` with data.

- [ ] **Step 3: Stop the app**

Run: `kill %1` (or `pkill -f "spring-boot:run"` on Git Bash).

- [ ] **Step 4: Commit a smoke script for future use**

Create `scripts/smoke.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail
BASE="${BASE:-http://localhost:8080}"

curl_json() { curl -sS -H "Content-Type: application/json" "$@"; }

echo ">> register"
curl_json -X POST "$BASE/api/v1/auth/register" \
  -d '{"username":"alice","password":"alice123","nickname":"Alice","phone":"13800000001"}' || true

echo ">> login"
LOGIN=$(curl_json -X POST "$BASE/api/v1/auth/login" \
  -d '{"username":"alice","password":"alice123"}')
TOKEN=$(echo "$LOGIN" | python -c 'import sys,json;print(json.load(sys.stdin)["data"]["accessToken"])')

echo ">> create goods"
curl_json -X POST "$BASE/api/v1/goods" -H "token: $TOKEN" \
  -d '{"name":"二手教材","price":25.00,"description":"九成新"}'

echo ">> list goods"
curl -sS "$BASE/api/v1/goods?page=1&size=10"
```

```bash
chmod +x scripts/smoke.sh
git add scripts/smoke.sh
git commit -m "chore(scripts): add smoke.sh for local end-to-end check"
```

---

## Phase P2 — Add Template Seams

> Goal: introduce 5 interfaces (CacheService, SearchService, StorageService, RateLimiter, AuditLogger) with Noop impls + config switches, default off, so the template can swap them in prod.

### Task 2.1: Add CacheService + NoopCacheService

**Files:**
- Create: `src/main/java/com/campus/secondhand/cache/CacheService.java`
- Create: `src/main/java/com/campus/secondhand/cache/NoopCacheService.java`
- Create: `src/main/java/com/campus/secondhand/config/CacheConfig.java`

- [ ] **Step 1: Create CacheService interface**

File `src/main/java/com/campus/secondhand/cache/CacheService.java`:

```java
package com.campus.secondhand.cache;

import java.util.Optional;
import java.util.function.Supplier;

public interface CacheService {
    <T> Optional<T> get(String key, Class<T> type);
    void put(String key, Object value, long ttlSeconds);
    void evict(String key);
    default <T> T getOrLoad(String key, Class<T> type, long ttlSeconds, Supplier<T> loader) {
        return get(key, type).orElseGet(() -> {
            T v = loader.get();
            if (v != null) put(key, v, ttlSeconds);
            return v;
        });
    }
}
```

- [ ] **Step 2: Create NoopCacheService**

File `src/main/java/com/campus/secondhand/cache/NoopCacheService.java`:

```java
package com.campus.secondhand.cache;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@ConditionalOnProperty(name = "template.cache.enabled", havingValue = "false", matchIfMissing = true)
public class NoopCacheService implements CacheService {
    @Override public <T> Optional<T> get(String key, Class<T> type) { return Optional.empty(); }
    @Override public void put(String key, Object value, long ttlSeconds) { }
    @Override public void evict(String key) { }
}
```

- [ ] **Step 3: Compile + commit**

```bash
mvn -q compile
git add src/main/java/com/campus/secondhand/cache/
git commit -m "feat(cache): add CacheService interface + NoopCacheService default"
```

---

### Task 2.2: Add SearchService + NoopSearchService

**Files:**
- Create: `src/main/java/com/campus/secondhand/search/SearchService.java`
- Create: `src/main/java/com/campus/secondhand/search/NoopSearchService.java`
- Create: `src/main/java/com/campus/secondhand/search/SearchConfig.java`

- [ ] **Step 1: Create SearchService interface**

File `src/main/java/com/campus/secondhand/search/SearchService.java`:

```java
package com.campus.secondhand.search;

import com.campus.secondhand.entity.Goods;

import java.util.List;

public interface SearchService {
    List<Long> searchGoodsIds(String keyword, int limit);
    void indexGoods(Goods goods);
    void deleteGoods(Long id);
}
```

- [ ] **Step 2: Create NoopSearchService**

File `src/main/java/com/campus/secondhand/search/NoopSearchService.java`:

```java
package com.campus.secondhand.search;

import com.campus.secondhand.entity.Goods;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@ConditionalOnProperty(name = "template.search.enabled", havingValue = "false", matchIfMissing = true)
public class NoopSearchService implements SearchService {
    @Override public List<Long> searchGoodsIds(String keyword, int limit) { return Collections.emptyList(); }
    @Override public void indexGoods(Goods goods) { }
    @Override public void deleteGoods(Long id) { }
}
```

- [ ] **Step 3: Compile + commit**

```bash
mvn -q compile
git add src/main/java/com/campus/secondhand/search/
git commit -m "feat(search): add SearchService interface + NoopSearchService default"
```

---

### Task 2.3: Add StorageService + NoopStorageService

**Files:**
- Create: `src/main/java/com/campus/secondhand/storage/StorageService.java`
- Create: `src/main/java/com/campus/secondhand/storage/NoopStorageService.java`

- [ ] **Step 1: Create StorageService interface**

File `src/main/java/com/campus/secondhand/storage/StorageService.java`:

```java
package com.campus.secondhand.storage;

import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

public interface StorageService {
    /**
     * @return object key (path) in the backing store
     */
    String put(String keyPrefix, MultipartFile file);
    InputStream read(String key);
    void delete(String key);
    String publicUrl(String key);
}
```

- [ ] **Step 2: Create NoopStorageService**

File `src/main/java/com/campus/secondhand/storage/NoopStorageService.java`:

```java
package com.campus.secondhand.storage;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

@Service
@ConditionalOnProperty(name = "template.storage.enabled", havingValue = "false", matchIfMissing = true)
public class NoopStorageService implements StorageService {
    @Override public String put(String keyPrefix, MultipartFile file) {
        throw new UnsupportedOperationException("Storage is disabled. Set template.storage.enabled=true and provide a real implementation.");
    }
    @Override public InputStream read(String key) { return new ByteArrayInputStream(new byte[0]); }
    @Override public void delete(String key) { }
    @Override public String publicUrl(String key) { return null; }
}
```

- [ ] **Step 3: Compile + commit**

```bash
mvn -q compile
git add src/main/java/com/campus/secondhand/storage/
git commit -m "feat(storage): add StorageService interface + NoopStorageService default"
```

---

### Task 2.4: Add RateLimiter + annotation + Noop impl

**Files:**
- Create: `src/main/java/com/campus/secondhand/ratelimit/RateLimiter.java`
- Create: `src/main/java/com/campus/secondhand/ratelimit/RateLimited.java`
- Create: `src/main/java/com/campus/secondhand/ratelimit/NoopRateLimiter.java`

- [ ] **Step 1: Create RateLimiter + annotation**

File `src/main/java/com/campus/secondhand/ratelimit/RateLimiter.java`:

```java
package com.campus.secondhand.ratelimit;

public interface RateLimiter {
    /**
     * @return true if the request is allowed, false if it should be rejected
     */
    boolean tryAcquire(String key);
}
```

File `src/main/java/com/campus/secondhand/ratelimit/RateLimited.java`:

```java
package com.campus.secondhand.ratelimit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface RateLimited {
    /** Logical name of the bucket, e.g. "auth.login". */
    String value() default "default";
    /** Max permits per window. */
    int permits() default 5;
    /** Window in seconds. */
    int windowSeconds() default 60;
}
```

- [ ] **Step 2: Create NoopRateLimiter**

File `src/main/java/com/campus/secondhand/ratelimit/NoopRateLimiter.java`:

```java
package com.campus.secondhand.ratelimit;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "template.ratelimit.enabled", havingValue = "false", matchIfMissing = true)
public class NoopRateLimiter implements RateLimiter {
    @Override public boolean tryAcquire(String key) { return true; }
}
```

- [ ] **Step 3: Compile + commit**

```bash
mvn -q compile
git add src/main/java/com/campus/secondhand/ratelimit/
git commit -m "feat(ratelimit): add RateLimiter interface, @RateLimited, NoopRateLimiter default"
```

---

### Task 2.5: Add AuditLogger + annotation + Noop impl

**Files:**
- Create: `src/main/java/com/campus/secondhand/audit/AuditLogger.java`
- Create: `src/main/java/com/campus/secondhand/audit/Audited.java`
- Create: `src/main/java/com/campus/secondhand/audit/NoopAuditLogger.java`

- [ ] **Step 1: Create AuditLogger + annotation**

File `src/main/java/com/campus/secondhand/audit/AuditLogger.java`:

```java
package com.campus.secondhand.audit;

public interface AuditLogger {
    void record(String action, Long actorUserId, Object target, String detail);
}
```

File `src/main/java/com/campus/secondhand/audit/Audited.java`:

```java
package com.campus.secondhand.audit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Audited {
    String action();
}
```

- [ ] **Step 2: Create NoopAuditLogger**

File `src/main/java/com/campus/secondhand/audit/NoopAuditLogger.java`:

```java
package com.campus.secondhand.audit;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "template.audit.enabled", havingValue = "false", matchIfMissing = true)
public class NoopAuditLogger implements AuditLogger {
    @Override public void record(String action, Long actorUserId, Object target, String detail) { }
}
```

- [ ] **Step 3: Compile + commit**

```bash
mvn -q compile
git add src/main/java/com/campus/secondhand/audit/
git commit -m "feat(audit): add AuditLogger interface, @Audited, NoopAuditLogger default"
```

---

### Task 2.6: Wire AuditLogger into GoodsService as a usage example

**Files:**
- Modify: `src/main/java/com/campus/secondhand/service/impl/GoodsServiceImpl.java`

- [ ] **Step 1: Add AuditLogger dependency and a single annotated call**

Replace `GoodsServiceImpl.java` with:

```java
package com.campus.secondhand.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.campus.secondhand.audit.AuditLogger;
import com.campus.secondhand.entity.Goods;
import com.campus.secondhand.enums.ErrorCode;
import com.campus.secondhand.exception.BusinessException;
import com.campus.secondhand.mapper.GoodsMapper;
import com.campus.secondhand.service.GoodsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class GoodsServiceImpl extends ServiceImpl<GoodsMapper, Goods> implements GoodsService {

    @Autowired private AuditLogger auditLogger;

    @Override
    public IPage<Goods> list(int page, int size, String keyword, Integer status) {
        QueryWrapper<Goods> q = new QueryWrapper<>();
        if (status != null) q.eq("status", status);
        if (StringUtils.hasText(keyword)) q.like("name", keyword);
        q.orderByDesc("create_time");
        return page(new Page<>(page, size), q);
    }

    @Override public Goods getById(Long id) { return getBaseMapper().selectById(id); }

    @Override
    public List<Goods> listByUserId(Long userId) {
        return getBaseMapper().selectList(new QueryWrapper<Goods>().eq("user_id", userId).orderByDesc("create_time"));
    }

    @Override
    public Goods create(Goods goods, Long userId) {
        goods.setId(null);
        goods.setUserId(userId);
        if (goods.getStatus() == null) goods.setStatus(1);
        if (goods.getViewCount() == null) goods.setViewCount(0);
        if (goods.getWantCount() == null) goods.setWantCount(0);
        save(goods);
        auditLogger.record("goods.create", userId, goods.getId(), goods.getName());
        return goods;
    }

    @Override
    public Goods update(Goods goods) {
        Goods existing = getById(goods.getId());
        if (existing == null) throw new BusinessException(ErrorCode.NOT_FOUND, "商品不存在");
        goods.setUserId(null);
        updateById(goods);
        return getById(goods.getId());
    }

    @Override
    public void delete(Long id) {
        removeById(id);
    }

    @Override
    public void updateStatus(Long id, Integer status, Long userId) {
        Goods g = getById(id);
        if (g == null) throw new BusinessException(ErrorCode.NOT_FOUND, "商品不存在");
        if (!g.getUserId().equals(userId)) throw new BusinessException(ErrorCode.FORBIDDEN, "无权操作");
        g.setStatus(status);
        updateById(g);
    }
}
```

- [ ] **Step 2: Compile to verify**

Run: `mvn -q compile`
Expected: BUILD SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add src/main/java/com/campus/secondhand/service/impl/GoodsServiceImpl.java
git commit -m "feat(audit): wire AuditLogger into goods create flow (no-op by default)"
```

---

### Task 2.7: P2 end-to-end smoke (start app, hit endpoints, ensure Noop beans load)

- [ ] **Step 1: Re-run P1 smoke script — all endpoints should still work with seams present**

Run: `bash scripts/smoke.sh` (with the app running on H2 as in Task 1.17)
Expected: same output as P1; no bean wiring errors at startup.

- [ ] **Step 2: Verify Noop impls are wired (check logs)**

Run: `grep -E "Noop(Cache|Search|Storage|RateLimiter|AuditLogger)" target/spring.log 2>/dev/null || true`
Expected: log shows app started; no missing-bean errors.

---

## Phase P3 — Frontend Split

> Goal: replace the single `frontend/index.html` with a Vite + Vue 3 + Pinia + Vue Router project that talks to `/api/v1`. Keep `index.html` as a zero-build CDN fallback for users who don't want Node.

### Task 3.1: Initialize frontend project files (package.json, tsconfig, vite config)

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/env.d.ts`
- Create: `frontend/.env.development`
- Create: `frontend/.env.production`
- Create: `frontend/index.html` (Vite entry, replaces the CDN one — but we keep the CDN one as `index.cdn.html`)

- [ ] **Step 1: Rename existing CDN index.html**

Run: `git mv frontend/index.html frontend/index.cdn.html`

- [ ] **Step 2: Create Vite package.json**

File `frontend/package.json`:

```json
{
  "name": "campus-secondhand-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "pinia": "^2.1.7",
    "vue": "^3.4.0",
    "vue-router": "^4.2.5"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@vitejs/plugin-vue": "^5.0.0",
    "@vue/test-utils": "^2.4.3",
    "jsdom": "^23.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "vue-tsc": "^1.8.25"
  }
}
```

- [ ] **Step 3: Create tsconfig.json**

File `frontend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "types": ["vite/client", "node"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "env.d.ts"]
}
```

- [ ] **Step 4: Create vite.config.ts**

File `frontend/vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

- [ ] **Step 5: Create env.d.ts, .env.development, .env.production**

File `frontend/env.d.ts`:

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

File `frontend/.env.development`:

```
VITE_API_BASE=/api/v1
```

File `frontend/.env.production`:

```
VITE_API_BASE=/api/v1
```

- [ ] **Step 6: Create new Vite index.html (entry)**

File `frontend/index.html`:

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>校园二手交易平台</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 7: Commit**

```bash
git add frontend/
git commit -m "feat(frontend): scaffold Vite + Vue 3 + TS + Pinia + Vue Router project"
```

---

### Task 3.2: Add types + axios http client with refresh-on-401

**Files:**
- Create: `frontend/src/types/user.ts`
- Create: `frontend/src/types/goods.ts`
- Create: `frontend/src/types/order.ts`
- Create: `frontend/src/api/http.ts`

- [ ] **Step 1: Create types**

File `frontend/src/types/user.ts`:

```ts
export interface User {
  id: number
  username: string
  nickname?: string
  phone?: string
  email?: string
  school?: string
  studentId?: string
  status?: number
}

export interface LoginRequest { username: string; password: string }
export interface RegisterRequest {
  username: string; password: string
  nickname?: string; phone?: string; email?: string
  school?: string; studentId?: string
}
export interface TokenResponse {
  accessToken: string
  refreshToken: string
  accessExpiresIn: number
  user: User
}
```

File `frontend/src/types/goods.ts`:

```ts
export interface Goods {
  id: number
  userId: number
  name: string
  description?: string
  price: number
  status: number
  images?: string
  createTime?: string
}

export interface PageResponse<T> {
  records: T[]
  total: number
  page: number
  size: number
}
```

File `frontend/src/types/order.ts`:

```ts
export interface Order {
  id: number
  orderNo: string
  goodsId: number
  goodsTitle: string
  goodsPrice: number
  sellerId: number
  buyerId: number
  status: number
  createTime?: string
}
```

- [ ] **Step 2: Create http.ts with refresh-on-401**

File `frontend/src/api/http.ts`:

```ts
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import type { TokenResponse } from '../types/user'

const baseURL = import.meta.env.VITE_API_BASE || '/api/v1'

const http: AxiosInstance = axios.create({ baseURL, withCredentials: true })

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

let refreshing: Promise<string | null> | null = null

async function refreshTokens(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return null
  if (!refreshing) {
    refreshing = axios
      .post<{ code: number; data: TokenResponse }>(`${baseURL}/auth/refresh`, { refreshToken }, { withCredentials: true })
      .then(r => {
        const t = r.data.data
        localStorage.setItem('accessToken', t.accessToken)
        localStorage.setItem('refreshToken', t.refreshToken)
        return t.accessToken
      })
      .catch(() => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        return null
      })
      .finally(() => { refreshing = null })
  }
  return refreshing
}

http.interceptors.response.use(
  r => r,
  async (err: AxiosError<{ code: number; message: string }>) => {
    const original: any = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      const newToken = await refreshTokens()
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`
        return http(original)
      }
      window.location.assign('/login')
    }
    return Promise.reject(err)
  }
)

export default http
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/types/ frontend/src/api/http.ts
git commit -m "feat(frontend): add types and axios http with refresh-on-401"
```

---

### Task 3.3: Add API modules + Pinia stores

**Files:**
- Create: `frontend/src/api/auth.ts`
- Create: `frontend/src/api/goods.ts`
- Create: `frontend/src/api/orders.ts`
- Create: `frontend/src/stores/auth.ts`
- Create: `frontend/src/stores/goods.ts`
- Create: `frontend/src/stores/orders.ts`

- [ ] **Step 1: Create API modules**

File `frontend/src/api/auth.ts`:

```ts
import http from './http'
import type { LoginRequest, RegisterRequest, TokenResponse, User } from '../types/user'

export const authApi = {
  login: (req: LoginRequest) => http.post<{ data: TokenResponse }>('/auth/login', req).then(r => r.data.data),
  register: (req: RegisterRequest) => http.post<{ data: User }>('/auth/register', req).then(r => r.data.data),
  me: () => http.get<{ data: User }>('/users/me').then(r => r.data.data)
}
```

File `frontend/src/api/goods.ts`:

```ts
import http from './http'
import type { Goods, PageResponse } from '../types/goods'

export const goodsApi = {
  list: (page = 1, size = 20, keyword?: string) =>
    http.get<{ data: PageResponse<Goods> }>('/goods', { params: { page, size, keyword } }).then(r => r.data.data),
  detail: (id: number) => http.get<{ data: Goods }>(`/goods/${id}`).then(r => r.data.data),
  mine: () => http.get<{ data: Goods[] }>('/goods/mine').then(r => r.data.data),
  create: (g: Partial<Goods>) => http.post<{ data: Goods }>('/goods', g).then(r => r.data.data),
  update: (id: number, g: Partial<Goods>) => http.put<{ data: Goods }>(`/goods/${id}`, g).then(r => r.data.data),
  remove: (id: number) => http.delete(`/goods/${id}`),
  setStatus: (id: number, status: number) => http.put(`/goods/${id}/status`, null, { params: { status } })
}
```

File `frontend/src/api/orders.ts`:

```ts
import http from './http'
import type { Order } from '../types/order'

export const orderApi = {
  create: (goodsId: number) => http.post<{ data: Order }>('/orders', { goodsId }).then(r => r.data.data),
  myBuy: () => http.get<{ data: Order[] }>('/orders/mine/buy').then(r => r.data.data),
  mySell: () => http.get<{ data: Order[] }>('/orders/mine/sell').then(r => r.data.data),
  setStatus: (id: number, status: number) => http.put<{ data: Order }>(`/orders/${id}/status`, null, { params: { status } })
}
```

- [ ] **Step 2: Create Pinia stores**

File `frontend/src/stores/auth.ts`:

```ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '../api/auth'
import type { LoginRequest, RegisterRequest, User } from '../types/user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = ref(!!localStorage.getItem('accessToken'))

  async function login(req: LoginRequest) {
    const r = await authApi.login(req)
    localStorage.setItem('accessToken', r.accessToken)
    localStorage.setItem('refreshToken', r.refreshToken)
    user.value = r.user
    isLoggedIn.value = true
  }

  async function register(req: RegisterRequest) {
    await authApi.register(req)
  }

  async function loadMe() {
    if (!isLoggedIn.value) return
    try { user.value = await authApi.me() }
    catch { logout() }
  }

  function logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    user.value = null
    isLoggedIn.value = false
  }

  return { user, isLoggedIn, login, register, loadMe, logout }
})
```

File `frontend/src/stores/goods.ts`:

```ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { goodsApi } from '../api/goods'
import type { Goods } from '../types/goods'

export const useGoodsStore = defineStore('goods', () => {
  const list = ref<Goods[]>([])
  const total = ref(0)
  const page = ref(1)
  const size = ref(20)

  async function loadList(keyword = '') {
    const r = await goodsApi.list(page.value, size.value, keyword)
    list.value = r.records
    total.value = r.total
  }

  async function loadMine() {
    return goodsApi.mine()
  }

  async function create(g: Partial<Goods>) {
    const created = await goodsApi.create(g)
    list.value = [created, ...list.value]
    return created
  }

  return { list, total, page, size, loadList, loadMine, create }
})
```

File `frontend/src/stores/orders.ts`:

```ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { orderApi } from '../api/orders'
import type { Order } from '../types/order'

export const useOrdersStore = defineStore('orders', () => {
  const buyList = ref<Order[]>([])
  const sellList = ref<Order[]>([])

  async function loadBuy() { buyList.value = await orderApi.myBuy() }
  async function loadSell() { sellList.value = await orderApi.mySell() }
  async function create(goodsId: number) { return orderApi.create(goodsId) }
  async function setStatus(id: number, status: number) { return orderApi.setStatus(id, status) }

  return { buyList, sellList, loadBuy, loadSell, create, setStatus }
})
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/api/ frontend/src/stores/
git commit -m "feat(frontend): add api modules and Pinia stores"
```

---

### Task 3.4: Add views + router + main.ts

**Files:**
- Create: `frontend/src/views/HomeView.vue`
- Create: `frontend/src/views/LoginView.vue`
- Create: `frontend/src/views/RegisterView.vue`
- Create: `frontend/src/views/GoodsManageView.vue`
- Create: `frontend/src/views/OrderManageView.vue`
- Create: `frontend/src/views/MyGoodsView.vue`
- Create: `frontend/src/router/index.ts`
- Create: `frontend/src/App.vue`
- Create: `frontend/src/main.ts`

- [ ] **Step 1: Create main.ts + App.vue**

File `frontend/src/main.ts`:

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

File `frontend/src/App.vue`:

```vue
<template>
  <header class="header">
    <h1>校园二手交易平台</h1>
    <div class="header-right">
      <span v-if="auth.user">{{ auth.user.username }}</span>
      <router-link v-if="!auth.isLoggedIn" to="/login">登录</router-link>
      <router-link v-if="!auth.isLoggedIn" to="/register">注册</router-link>
      <button v-else @click="auth.logout">退出</button>
    </div>
  </header>
  <nav class="nav-tabs">
    <router-link to="/">首页</router-link>
    <router-link to="/goods-manage">商品管理</router-link>
    <router-link to="/orders">我的订单</router-link>
    <router-link to="/my">我的发布</router-link>
  </nav>
  <main>
    <router-view />
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
const auth = useAuthStore()
onMounted(() => { auth.loadMe() })
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f0f2f5; color: #333; }
.header { background: linear-gradient(135deg, #ff6b6b, #ee5a5a); color: white; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
.header h1 { font-size: 1.4em; }
.header-right { display: flex; gap: 12px; align-items: center; }
.header-right a, .header-right button { color: white; text-decoration: none; background: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; }
.nav-tabs { background: white; padding: 8px 20px; display: flex; gap: 12px; }
.nav-tabs a { padding: 10px 14px; text-decoration: none; color: #666; border-bottom: 3px solid transparent; }
.nav-tabs a.router-link-active { color: #ff6b6b; border-bottom-color: #ff6b6b; }
main { max-width: 1200px; margin: 20px auto; padding: 0 20px; }
.card { background: white; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
.btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; background: #ff6b6b; color: white; }
input, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; margin: 4px 0 12px; }
</style>
```

- [ ] **Step 2: Create router**

File `frontend/src/router/index.ts`:

```ts
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import GoodsManageView from '../views/GoodsManageView.vue'
import OrderManageView from '../views/OrderManageView.vue'
import MyGoodsView from '../views/MyGoodsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    { path: '/goods-manage', component: GoodsManageView, meta: { auth: true } },
    { path: '/orders', component: OrderManageView, meta: { auth: true } },
    { path: '/my', component: MyGoodsView, meta: { auth: true } }
  ]
})

router.beforeEach((to) => {
  if (to.meta.auth && !localStorage.getItem('accessToken')) return '/login'
})

export default router
```

- [ ] **Step 3: Create views (skeleton — replace with full UI in Task 3.5)**

File `frontend/src/views/HomeView.vue`:

```vue
<template>
  <section class="card">
    <h2>全部商品</h2>
    <div v-if="goods.list.length">
      <div v-for="g in goods.list" :key="g.id" style="border-bottom: 1px solid #eee; padding: 8px 0;">
        <strong>{{ g.name }}</strong> — ¥{{ g.price }}
        <button v-if="auth.isLoggedIn" class="btn" @click="buy(g.id)">购买</button>
      </div>
    </div>
    <p v-else>暂无商品</p>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useGoodsStore } from '../stores/goods'
import { useOrdersStore } from '../stores/orders'

const auth = useAuthStore()
const goods = useGoodsStore()
const orders = useOrdersStore()

onMounted(() => goods.loadList())

async function buy(goodsId: number) {
  await orders.create(goodsId)
  alert('下单成功')
}
</script>
```

File `frontend/src/views/LoginView.vue`:

```vue
<template>
  <section class="card">
    <h2>登录</h2>
    <input v-model="form.username" placeholder="用户名" />
    <input v-model="form.password" type="password" placeholder="密码" />
    <button class="btn" @click="submit">登录</button>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const form = reactive({ username: '', password: '' })
const auth = useAuthStore()
const router = useRouter()

async function submit() {
  await auth.login(form)
  router.push('/')
}
</script>
```

File `frontend/src/views/RegisterView.vue`:

```vue
<template>
  <section class="card">
    <h2>注册</h2>
    <input v-model="form.username" placeholder="用户名" />
    <input v-model="form.password" type="password" placeholder="密码" />
    <input v-model="form.phone" placeholder="手机号" />
    <button class="btn" @click="submit">注册</button>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const form = reactive({ username: '', password: '', phone: '' })
const auth = useAuthStore()
const router = useRouter()

async function submit() {
  await auth.register(form)
  router.push('/login')
}
</script>
```

File `frontend/src/views/GoodsManageView.vue`:

```vue
<template><section class="card"><h2>商品管理（占位）</h2><p>请使用首页/我的发布页面管理商品。</p></section></template>
```

File `frontend/src/views/OrderManageView.vue`:

```vue
<template>
  <section class="card">
    <h2>我的订单</h2>
    <div v-for="o in orders.buyList" :key="o.id" style="border-bottom:1px solid #eee; padding: 8px 0;">
      {{ o.orderNo }} — {{ o.goodsTitle }} — ¥{{ o.goodsPrice }}
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useOrdersStore } from '../stores/orders'
const orders = useOrdersStore()
onMounted(() => orders.loadBuy())
</script>
```

File `frontend/src/views/MyGoodsView.vue`:

```vue
<template>
  <section class="card">
    <h2>我发布的商品</h2>
    <form @submit.prevent="create">
      <input v-model="form.name" placeholder="名称" />
      <input v-model.number="form.price" type="number" placeholder="价格" />
      <textarea v-model="form.description" placeholder="描述" />
      <button class="btn" type="submit">发布</button>
    </form>
    <hr />
    <div v-for="g in mine" :key="g.id">{{ g.name }} — ¥{{ g.price }}</div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useGoodsStore } from '../stores/goods'

const goods = useGoodsStore()
const mine = ref<any[]>([])
const form = reactive({ name: '', price: 0, description: '' })

onMounted(async () => { mine.value = await goods.loadMine() })

async function create() {
  await goods.create(form)
  form.name = ''; form.price = 0; form.description = ''
  mine.value = await goods.loadMine()
}
</script>
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/
git commit -m "feat(frontend): add views, router, App.vue, main.ts"
```

---

### Task 3.5: Verify frontend builds and serves

- [ ] **Step 1: Install deps**

Run: `cd frontend && npm install`
Expected: dependencies installed without errors.

- [ ] **Step 2: Build**

Run: `cd frontend && npm run build`
Expected: `vite build` outputs `dist/` with no errors.

- [ ] **Step 3: Commit (lockfile)**

```bash
git add frontend/package-lock.json
git commit -m "chore(frontend): lock deps"
```

---

### Task 3.6: Update CDN fallback to point to `/api/v1` and use new token format

**Files:**
- Modify: `frontend/index.cdn.html`

- [ ] **Step 1: Rewrite the CDN fallback to use the new endpoints**

Replace the entire `frontend/index.cdn.html` with the same structure as before but pointing to `/api/v1/auth/login` and using `Authorization: Bearer <accessToken>` instead of `token: <jwt>`.

File `frontend/index.cdn.html`:

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>校园二手交易平台 (CDN fallback)</title>
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
  <style>
    body { font-family: sans-serif; background:#f0f2f5; color:#333; margin: 0; }
    .header { background: linear-gradient(135deg,#ff6b6b,#ee5a5a); color:#fff; padding: 16px 20px; display: flex; justify-content: space-between; }
    .container { max-width: 900px; margin: 20px auto; padding: 0 20px; }
    .card { background:#fff; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
    input, textarea { width: 100%; padding: 8px; margin: 4px 0 12px; border: 1px solid #ddd; border-radius: 6px; }
    .btn { padding: 8px 16px; border: none; border-radius: 6px; background:#ff6b6b; color:#fff; cursor: pointer; }
  </style>
</head>
<body>
  <div id="app">
    <header class="header"><h1>校园二手交易 (CDN)</h1></header>
    <div class="container">
      <div class="card">
        <h2>登录</h2>
        <input v-model="u" placeholder="用户名" />
        <input v-model="p" type="password" placeholder="密码" />
        <button class="btn" @click="login">登录</button>
        <pre>{{ status }}</pre>
      </div>
      <div class="card" v-if="accessToken">
        <h2>商品列表</h2>
        <button class="btn" @click="loadGoods">刷新</button>
        <pre>{{ goods }}</pre>
      </div>
    </div>
  </div>
  <script>
    const { createApp, ref } = Vue
    createApp({
      setup() {
        const API = 'http://localhost:8080/api/v1'
        const u = ref('alice'), p = ref('alice123')
        const accessToken = ref(localStorage.getItem('accessToken') || '')
        const refreshToken = ref(localStorage.getItem('refreshToken') || '')
        const status = ref('')
        const goods = ref(null)

        async function login() {
          const r = await axios.post(`${API}/auth/login`, { username: u.value, password: p.value })
          const d = r.data.data
          accessToken.value = d.accessToken
          refreshToken.value = d.refreshToken
          localStorage.setItem('accessToken', d.accessToken)
          localStorage.setItem('refreshToken', d.refreshToken)
          status.value = 'logged in as ' + d.user.username
        }
        async function loadGoods() {
          const r = await axios.get(`${API}/goods?page=1&size=10`, { headers: { Authorization: 'Bearer ' + accessToken.value } })
          goods.value = r.data
        }
        return { u, p, accessToken, refreshToken, status, goods, login, loadGoods }
      }
    }).mount('#app')
  </script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/index.cdn.html
git commit -m "feat(frontend): update CDN fallback to /api/v1 + Authorization header"
```

---

## Phase P4 — Tests + CI

### Task 4.1: Add JWT slice test for AuthController

**Files:**
- Create: `src/test/java/com/campus/secondhand/controller/AuthControllerTest.java`

- [ ] **Step 1: Add slice test**

File `src/test/java/com/campus/secondhand/controller/AuthControllerTest.java`:

```java
package com.campus.secondhand.controller;

import com.campus.secondhand.dto.LoginRequest;
import com.campus.secondhand.entity.User;
import com.campus.secondhand.enums.ErrorCode;
import com.campus.secondhand.exception.BusinessException;
import com.campus.secondhand.service.UserService;
import com.campus.secondhand.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:test;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.flyway.enabled=false",
    "jwt.secret=test-secret-test-secret-test-secret-32bytes!",
    "spring.jpa.hibernate.ddl-auto=none"
})
class AuthControllerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper om;
    @Autowired JwtUtil jwtUtil;
    @MockBean UserService userService;

    @Test
    void login_success_returnsTokenPair() throws Exception {
        User u = new User();
        u.setId(1L);
        u.setUsername("alice");
        when(userService.login(any(LoginRequest.class))).thenReturn(u);

        LoginRequest req = new LoginRequest();
        req.setUsername("alice"); req.setPassword("alice123");

        mvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(ErrorCode.OK.getCode()))
            .andExpect(jsonPath("$.data.accessToken").exists())
            .andExpect(jsonPath("$.data.refreshToken").exists());
    }

    @Test
    void login_wrongPassword_returns401() throws Exception {
        when(userService.login(any(LoginRequest.class)))
            .thenThrow(new BusinessException(ErrorCode.UNAUTHORIZED, "bad creds"));

        LoginRequest req = new LoginRequest();
        req.setUsername("alice"); req.setPassword("wrong");

        mvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(req)))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.code").value(ErrorCode.UNAUTHORIZED.getCode()));
    }
}
```

- [ ] **Step 2: Run**

Run: `mvn -q test -Dtest=AuthControllerTest`
Expected: PASS (2 tests).

- [ ] **Step 3: Commit**

```bash
git add src/test/java/com/campus/secondhand/controller/AuthControllerTest.java
git commit -m "test(auth): add AuthController slice tests"
```

---

### Task 4.2: Add OrderService unit test for orderNo + snapshot

**Files:**
- Create: `src/test/java/com/campus/secondhand/service/OrderServiceImplTest.java`

- [ ] **Step 1: Add unit test**

File `src/test/java/com/campus/secondhand/service/OrderServiceImplTest.java`:

```java
package com.campus.secondhand.service;

import com.campus.secondhand.dto.OrderCreateRequest;
import com.campus.secondhand.entity.Goods;
import com.campus.secondhand.entity.Order;
import com.campus.secondhand.enums.ErrorCode;
import com.campus.secondhand.exception.BusinessException;
import com.campus.secondhand.mapper.OrderMapper;
import com.campus.secondhand.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class OrderServiceImplTest {

    private OrderMapper orderMapper;
    private GoodsService goodsService;
    private OrderServiceImpl svc;

    @BeforeEach
    void setup() {
        orderMapper = mock(OrderMapper.class);
        goodsService = mock(GoodsService.class);
        svc = new OrderServiceImpl();
        svc.orderMapper = orderMapper;
        svc.goodsService = goodsService;
    }

    @Test
    void create_fillsOrderNoAndSnapshot() {
        Goods g = new Goods();
        g.setId(11L);
        g.setUserId(2L);
        g.setName("二手教材");
        g.setPrice(new BigDecimal("25.00"));
        g.setStatus(1);
        when(goodsService.getById(11L)).thenReturn(g);
        when(orderMapper.insert(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(100L);
            return 1;
        });
        when(orderMapper.selectById(100L)).thenAnswer(inv -> {
            Order o = new Order();
            o.setId(100L);
            return o;
        });
        when(goodsService.update(any(Goods.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderCreateRequest req = new OrderCreateRequest();
        req.setGoodsId(11L);
        Order result = svc.create(req, 1L);

        ArgumentCaptor<Order> cap = ArgumentCaptor.forClass(Order.class);
        verify(orderMapper).insert(cap.capture());
        Order saved = cap.getValue();
        assertNotNull(saved.getOrderNo());
        assertTrue(saved.getOrderNo().length() > 20);
        assertEquals("二手教材", saved.getGoodsTitle());
        assertEquals(new BigDecimal("25.00"), saved.getGoodsPrice());
        assertEquals(0, saved.getStatus());
        assertEquals(11L, saved.getGoodsId());
        assertEquals(2L, saved.getSellerId());
        assertEquals(1L, saved.getBuyerId());
    }

    @Test
    void create_selfPurchase_throws() {
        Goods g = new Goods();
        g.setId(11L);
        g.setUserId(1L); // same as buyer
        g.setStatus(1);
        when(goodsService.getById(11L)).thenReturn(g);

        OrderCreateRequest req = new OrderCreateRequest();
        req.setGoodsId(11L);
        BusinessException ex = assertThrows(BusinessException.class, () -> svc.create(req, 1L));
        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
    }
}
```

Note: the test uses package-private setters for `orderMapper` and `goodsService`. If those fields are private with no setter, change them to package-private and re-compile, or add `@VisibleForTesting` setters.

- [ ] **Step 2: Run**

Run: `mvn -q test -Dtest=OrderServiceImplTest`
Expected: PASS (2 tests).

- [ ] **Step 3: Commit**

```bash
git add src/test/java/com/campus/secondhand/service/OrderServiceImplTest.java
git commit -m "test(order): add OrderService unit tests for orderNo + snapshot + self-purchase guard"
```

---

### Task 4.3: Verify full backend test suite is green

- [ ] **Step 1: Run all tests**

Run: `mvn -q test`
Expected: BUILD SUCCESS, all tests pass.

- [ ] **Step 2: If any test fails, fix the test (not the production code) — unless the production code has a bug uncovered by the test, in which case fix both**

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git diff --cached --quiet || git commit -m "test: align tests with P1-P2 changes"
```

---

### Task 4.4: Add Vitest setup + one smoke test for http interceptor

**Files:**
- Create: `frontend/vitest.config.ts`
- Create: `frontend/src/api/http.test.ts`

- [ ] **Step 1: Create vitest config**

File `frontend/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: { environment: 'jsdom', globals: true }
})
```

- [ ] **Step 2: Add a smoke test**

File `frontend/src/api/http.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import axios from 'axios'

describe('http interceptor (smoke)', () => {
  beforeEach(() => { localStorage.clear() })

  it('attaches Authorization header when accessToken is set', async () => {
    localStorage.setItem('accessToken', 'test-token')
    const http = axios.create({ baseURL: '/api/v1' })
    http.interceptors.request.use(cfg => {
      const t = localStorage.getItem('accessToken')
      if (t) cfg.headers.Authorization = `Bearer ${t}`
      return cfg
    })
    // Just verify the request config is built; we don't hit a real server.
    const cfg = await http.get('/auth/me', { adapter: (config: any) => Promise.resolve({ data: config.headers, status: 200 }) } as any)
    expect((cfg.data as any).Authorization).toBe('Bearer test-token')
  })
})
```

- [ ] **Step 3: Run**

Run: `cd frontend && npm test`
Expected: 1 passing.

- [ ] **Step 4: Commit**

```bash
git add frontend/vitest.config.ts frontend/src/api/http.test.ts
git commit -m "test(frontend): add Vitest config + smoke test for http interceptor"
```

---

### Task 4.5: Update CI workflow to build the frontend

**Files:**
- Modify: `.github/workflows/ci.yml` (if it exists; otherwise create it)

- [ ] **Step 1: Inspect existing CI**

Run: `cat .github/workflows/ci.yml 2>/dev/null || echo "no ci.yml yet"`
Expected: file content or "no ci.yml yet".

- [ ] **Step 2: Add a frontend job alongside the existing backend job**

File `.github/workflows/ci.yml`:

```yaml
name: ci
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: '17' }
      - run: mvn -B -DskipTests=false test
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd frontend && npm ci && npm run build && npm test
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add frontend build+test job alongside backend"
```

---

## Phase P5 — Docs + .gitignore

### Task 5.1: Update .gitignore to keep residue out of the repo

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Append the additional ignore rules**

Append to `.gitignore`:

```gitignore
# Residue from earlier sessions — keep on disk, never commit
*.mp4
/p-/
/llm-autoresearch-pipeline/
/新建文件夹/

# Frontend
/frontend/node_modules/
/frontend/dist/
/frontend/.vite/
```

- [ ] **Step 2: Verify residue is now ignored**

Run: `git status --ignored | head -30`
Expected: `*.mp4`, `-p/`, `llm-autoresearch-pipeline/`, `新建文件夹/` show as ignored.

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore(gitignore): isolate residual directories and build outputs"
```

---

### Task 5.2: Rewrite README.md as a scaffold quickstart

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace README.md**

File `README.md`:

````markdown
# Campus SecondHand — Full-Stack Scaffold Template

A reusable Spring Boot 2.7 + Vue 3 scaffold with JWT, MyBatis-Plus, Flyway, Vite, Pinia, and 5 production-grade "seam" interfaces (cache, search, storage, rate-limit, audit) that ship as no-op by default.

The example domain (campus second-hand trading) is wired end-to-end as a working reference: register, login, list/create goods, place orders, manage orders.

## 5-minute quickstart

```bash
# 1. Start MySQL (or use docker compose — see below)
docker compose up -d mysql

# 2. Run the backend
mvn spring-boot:run

# 3. In another terminal — run the frontend
cd frontend
npm install
npm run dev

# 4. Open
# Backend:   http://localhost:8080/swagger-ui.html
# Frontend:  http://localhost:5173
# OpenAPI:   http://localhost:8080/v3/api-docs
```

Default dev profile reads from `application-dev.yml` (env vars: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).

## Full stack with Docker

```bash
docker compose up -d        # mysql + app
# Open http://localhost:8080  (frontend served by app profile's static mapping; or run `npm run dev` separately)
```

## What you get

- **Auth:** JWT access (15 min) + refresh (7 d), BCrypt password hashing, sliding refresh.
- **API:** RESTful under `/api/v1`, uniform `Result<T>` envelope (`{code, message, data, timestamp}`).
- **Persistence:** MySQL 8 + MyBatis-Plus + Flyway migrations in `src/main/resources/db/migration/`.
- **Frontend:** Vite 5 + Vue 3 + Pinia + Vue Router 4 + Axios with refresh-on-401 interceptor. A CDN-only `frontend/index.cdn.html` is kept as zero-build fallback.
- **Template seams:** `CacheService`, `SearchService`, `StorageService`, `RateLimiter`, `AuditLogger` — all interfaces with Noop impls. Flip `template.<name>.enabled=true` and add a real impl to switch on.

## Project layout

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Coding rules: [docs/CONVENTIONS.md](docs/CONVENTIONS.md). Production checklist: [docs/PRODUCTION_CHECKLIST.md](docs/PRODUCTION_CHECKLIST.md).

## Replacing the example domain

1. Drop or rename the `goods` and `orders` tables in `V1__init.sql` and `V2__<your-domain>.sql`.
2. Replace `entity/`, `service/`, `controller/`, `mapper/`, `dto/` contents.
3. Update `frontend/src/views/`, `stores/`, `api/`, `types/`.
4. Keep the interfaces in `cache/`, `search/`, `storage/`, `ratelimit/`, `audit/` — they don't care about the domain.

## License

MIT.
````

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README as scaffold quickstart"
```

---

### Task 5.3: Add docs/ARCHITECTURE.md

**Files:**
- Create: `docs/ARCHITECTURE.md`

- [ ] **Step 1: Write ARCHITECTURE.md**

File `docs/ARCHITECTURE.md`:

````markdown
# Architecture

## Layers

- `controller/` — HTTP entry. Throws `BusinessException` on domain errors; never catches generic `Exception` (handled globally).
- `service/` — business logic. `@Transactional` at the service-method level, not the class.
- `mapper/` — MyBatis-Plus interfaces. Custom SQL only when `QueryWrapper` isn't expressive enough; otherwise keep it in Java.
- `entity/` — extends `BaseEntity` (id/createdAt/updatedAt/deleted). `@TableLogic` on `deleted` enables soft delete globally.
- `dto/` — request/response shapes. Never return entities directly from controllers.
- `enums/` — domain enums and `ErrorCode`.
- `exception/` — `BusinessException` carries an `ErrorCode`. `GlobalExceptionHandler` maps to `Result<T>` and HTTP status.
- `interceptor/` — `JwtInterceptor` extracts and validates the access token, sets `currentUserId` on the request.
- `response/Result.java` — the single response envelope.

## Cross-cutting seams

Each seam is an interface in its own package with a Noop default and a `@ConditionalOnProperty` switch:

| Seam | Interface | Default impl | Switch |
|------|-----------|--------------|--------|
| Cache | `cache.CacheService` | `NoopCacheService` | `template.cache.enabled` |
| Search | `search.SearchService` | `NoopSearchService` | `template.search.enabled` |
| Object storage | `storage.StorageService` | `NoopStorageService` | `template.storage.enabled` |
| Rate limit | `ratelimit.RateLimiter` | `NoopRateLimiter` | `template.ratelimit.enabled` |
| Audit | `audit.AuditLogger` | `NoopAuditLogger` | `template.audit.enabled` |

To enable a seam:

1. Implement the interface (e.g. `RedisCacheService implements CacheService`).
2. Remove the `@ConditionalOnProperty(matchIfMissing=true)` from the Noop impl, or qualify the real impl with `havingValue="true"`.
3. Add the implementation class to the classpath.
4. Flip the property in `application-prod.yml`.

## Auth flow

1. `POST /api/v1/auth/login` returns `{accessToken, refreshToken, accessExpiresIn, user}`.
2. Frontend stores both in `localStorage`; axios attaches `Authorization: Bearer <accessToken>`.
3. On 401, axios calls `POST /api/v1/auth/refresh` once with the refresh token; on success, retries the original request. On second failure, routes to `/login`.

## Database migrations

Flyway files live in `src/main/resources/db/migration/`, named `V<n>__<description>.sql`. Never edit a `V<n>__` after it has been applied — add a new `V<n+1>__`.
````

- [ ] **Step 2: Commit**

```bash
git add docs/ARCHITECTURE.md
git commit -m "docs: add ARCHITECTURE.md"
```

---

### Task 5.4: Add docs/CONVENTIONS.md

**Files:**
- Create: `docs/CONVENTIONS.md`

- [ ] **Step 1: Write CONVENTIONS.md**

File `docs/CONVENTIONS.md`:

````markdown
# Conventions

## Naming

- Java packages: `com.campus.secondhand.<layer>` (e.g. `controller`, `service`, `cache`).
- Classes: PascalCase. Interfaces end with their role (e.g. `CacheService`, `RateLimiter`).
- DTO suffix: `*Request` for input, `*Response` for output, no suffix for value objects.
- Tables: snake_case in MySQL; MyBatis-Plus maps to camelCase. `users` is the convention; singular is fine too — be consistent within one project.

## Errors

- Throw `BusinessException(ErrorCode.XXX, "message")` from services. Never throw `RuntimeException` directly.
- Add new error codes by extending `ErrorCode` — do not hard-code integer codes in services.
- Validation failures flow through `MethodArgumentNotValidException` automatically when you put `@Valid` on `@RequestBody` parameters.

## Transactions

- `@Transactional` on the service method, not the class. Read-only methods use `@Transactional(readOnly = true)`.

## Pagination

- Backend list endpoints return `PageResponse<T>` = `{records, total, page, size}`. Use `PageResponse.of(mybatisPlusPage)`.
- Frontend pages send `page` and `size` as query params (1-based).

## Frontend

- Components use `<script setup lang="ts">`.
- API calls go through `frontend/src/api/*.ts` modules; components call those, never `axios` directly.
- State goes in Pinia stores (`frontend/src/stores/*.ts`); components stay stateless beyond form bindings.
- Types live in `frontend/src/types/*.ts` and mirror backend DTOs.
````

- [ ] **Step 2: Commit**

```bash
git add docs/CONVENTIONS.md
git commit -m "docs: add CONVENTIONS.md"
```

---

### Task 5.5: Add docs/PRODUCTION_CHECKLIST.md

**Files:**
- Create: `docs/PRODUCTION_CHECKLIST.md`

- [ ] **Step 1: Write PRODUCTION_CHECKLIST.md**

File `docs/PRODUCTION_CHECKLIST.md`:

````markdown
# Production Checklist

Before deploying, verify:

## Security

- [ ] `JWT_SECRET` is set to a random 32+ byte value (env var).
- [ ] HTTPS is terminated at the load balancer; `server.forward-headers-strategy=framework` is set.
- [ ] CORS allowlist is set to the real frontend origin (not `*`).
- [ ] Database credentials are not default; the app user has only the privileges it needs.
- [ ] BCrypt is the only password encoder (`SecurityConfig`).

## Persistence

- [ ] Flyway migrations have been tested on a staging DB.
- [ ] Backups are scheduled and tested.
- [ ] Connection pool sizing matches the load profile.

## Operations

- [ ] Health endpoint exposed (Spring Actuator if not already).
- [ ] Logs are structured (JSON) and shipped to a log aggregator.
- [ ] Metrics are exported to Prometheus (or your platform's equivalent).
- [ ] Tracing is wired (request IDs propagate through).

## Template seams

- [ ] Decide which seams to enable in prod: cache, search, storage, rate-limit, audit.
- [ ] For each enabled seam, add a real implementation and flip the property in `application-prod.yml`.
- [ ] Add a `@RateLimited("auth.login")` annotation on `AuthController.login` if rate-limit is on.
- [ ] Add `@Audited("goods.create")` etc. on mutating service methods if audit is on.

## Frontend

- [ ] `npm run build` succeeds; `dist/` is uploaded to a CDN or served by the reverse proxy.
- [ ] The CDN `frontend/index.cdn.html` is removed (or kept only for local dev).
- [ ] CSP and other security headers are configured on the reverse proxy.
````

- [ ] **Step 2: Commit**

```bash
git add docs/PRODUCTION_CHECKLIST.md
git commit -m "docs: add PRODUCTION_CHECKLIST.md"
```

---

### Task 5.6: Update TODO.md (template-level only)

**Files:**
- Modify: `TODO.md`

- [ ] **Step 1: Replace TODO.md with scaffold-focused content**

File `TODO.md`:

````markdown
# TODO

Template-level tasks. Domain tasks (login, goods, orders) are tracked in `docs/ARCHITECTURE.md` and code, not here.

- [ ] Add a real `RedisCacheService` impl behind `template.cache.enabled`.
- [ ] Add a real `ElasticsearchSearchService` impl behind `template.search.enabled`.
- [ ] Add a real `MinIOStorageService` impl behind `template.storage.enabled`.
- [ ] Wire a real rate-limiter (Bucket4j + Redis Lua) behind `template.ratelimit.enabled`.
- [ ] Wire a real audit sink (DB table or Kafka) behind `template.audit.enabled`.
- [ ] Add Spring Boot Actuator and Prometheus micrometer.
- [ ] Replace `digest` log line in `GlobalExceptionHandler` with structured fields.
- [ ] Add `idempotency-key` header support for `POST /api/v1/orders`.
- [ ] Add WebSocket endpoint for real-time order status push.
- [ ] Add a CI step that boots MySQL via Testcontainers and runs the smoke script.
````

- [ ] **Step 2: Remove (do not rewrite) the older `INNOVATION_ROADMAP.md` and `OPTIMIZATION_REPORT.md` — they describe a different product and have been isolated via `.gitignore` of the upstream residue; they will be replaced or deleted by the user later. Mark them in their first line as `> STATUS: pending replacement` so readers know.**

Edit the first line of `INNOVATION_ROADMAP.md`:

```markdown
> STATUS: pending replacement — content describes an unrelated prior project. See `README.md` for the current scaffold.
```

And the first line of `OPTIMIZATION_REPORT.md`:

```markdown
> STATUS: pending replacement — content describes an unrelated prior project. See `README.md` for the current scaffold.
```

- [ ] **Step 3: Commit**

```bash
git add TODO.md INNOVATION_ROADMAP.md OPTIMIZATION_REPORT.md
git commit -m "docs: refresh TODO.md; mark stale roadmap docs as pending replacement"
```

---

## Self-Review

1. **Spec coverage:** Spec §2 (architecture) → P1, P2; §3 (directory) → Tasks 1.4-1.15, 2.1-2.6, 3.1-3.4, 5.1-5.5; §4 (data flow) → Tasks 1.7-1.9, 3.2; §5 (error handling) → Task 1.12; §6 (testing) → Phase P4; §7 (docs) → Phase P5.
2. **Placeholder scan:** No "TBD"/"TODO"/"implement later" in steps. Code blocks are complete.
3. **Type consistency:** `JwtUtil.generateAccessToken`/`generateRefreshToken` referenced consistently. `PageResponse.of(IPage)` used in Task 1.14 matching Task 1.3. `ATTR_USER_ID` referenced in controllers and interceptor. `Result.ok()` vs `Result.ok(data)` — `Result.ok()` is the no-arg variant introduced in Task 1.2; used by `OrderServiceImpl`-adjacent controllers in 1.15.

Known follow-ups outside this plan (for the next iteration):
- Real impls for the 5 seams (intentionally deferred — template stays light).
- File upload endpoint (depends on storage seam being switched on).
- Refresh-token rotation + revocation list.
- E2E tests with Testcontainers + Playwright.
