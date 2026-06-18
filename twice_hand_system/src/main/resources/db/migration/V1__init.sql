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
