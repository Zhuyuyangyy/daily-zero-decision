-- 校园二手交易平台数据库初始化脚本
-- 数据库：campus_secondhand

-- ===========================
-- 1. 用户表 (users)
-- ===========================
DROP TABLE IF EXISTS `users`;
CREATE TABLE user (
                      id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
                      username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
                      password VARCHAR(32) NOT NULL COMMENT '密码（MD5加密）',
                      nickname VARCHAR(50) COMMENT '昵称',
                      phone VARCHAR(20) UNIQUE COMMENT '手机号',
                      email VARCHAR(100) UNIQUE COMMENT '邮箱',
                      school VARCHAR(100) COMMENT '学校',
                      student_id VARCHAR(20) COMMENT '学号',
                      status INT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
                      create_time DATETIME DEFAULT NOW() COMMENT '创建时间',
                      update_time DATETIME DEFAULT NOW() ON UPDATE NOW() COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ===========================
-- 2. 商品表 (goods)
-- ===========================
DROP TABLE IF EXISTS `goods`;
CREATE TABLE `goods` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '商品 ID',
    `user_id` BIGINT(20) NOT NULL COMMENT '卖家 ID',
    `title` VARCHAR(100) NOT NULL COMMENT '商品标题',
    `description` TEXT COMMENT '商品描述',
    `category_id` BIGINT(20) DEFAULT NULL COMMENT '分类 ID',
    `category_name` VARCHAR(50) DEFAULT NULL COMMENT '分类名称',
    `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
    `original_price` DECIMAL(10,2) DEFAULT NULL COMMENT '原价',
    `images` VARCHAR(1000) DEFAULT NULL COMMENT '图片 URL 列表 (逗号分隔)',
    `condition` TINYINT(1) DEFAULT 1 COMMENT '新旧程度 1-全新 2-99 新 3-9 成新 4-8 成新 5-7 成新及以下',
    `status` TINYINT(1) DEFAULT 1 COMMENT '状态 0-下架 1-在售 2-已售出 3-锁定',
    `view_count` INT(11) DEFAULT 0 COMMENT '浏览次数',
    `want_count` INT(11) DEFAULT 0 COMMENT '想要人数',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_category_id` (`category_id`),
    KEY `idx_status` (`status`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

-- ===========================
-- 3. 订单表 (orders)
-- ===========================
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '订单 ID',
    `order_no` VARCHAR(50) NOT NULL COMMENT '订单编号',
    `goods_id` BIGINT(20) NOT NULL COMMENT '商品 ID',
    `goods_title` VARCHAR(100) NOT NULL COMMENT '商品标题 (快照)',
    `goods_price` DECIMAL(10,2) NOT NULL COMMENT '商品价格 (快照)',
    `seller_id` BIGINT(20) NOT NULL COMMENT '卖家 ID',
    `buyer_id` BIGINT(20) NOT NULL COMMENT '买家 ID',
    `buyer_name` VARCHAR(50) DEFAULT NULL COMMENT '买家姓名',
    `buyer_phone` VARCHAR(20) DEFAULT NULL COMMENT '买家电话',
    `buyer_address` VARCHAR(255) DEFAULT NULL COMMENT '买家地址',
    `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `status` TINYINT(1) DEFAULT 0 COMMENT '订单状态 0-待付款 1-待发货 2-待收货 3-已完成 4-已取消 5-售后中',
    `payment_time` DATETIME DEFAULT NULL COMMENT '付款时间',
    `delivery_time` DATETIME DEFAULT NULL COMMENT '发货时间',
    `receive_time` DATETIME DEFAULT NULL COMMENT '收货时间',
    `complete_time` DATETIME DEFAULT NULL COMMENT '完成时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_order_no` (`order_no`),
    KEY `idx_goods_id` (`goods_id`),
    KEY `idx_seller_id` (`seller_id`),
    KEY `idx_buyer_id` (`buyer_id`),
    KEY `idx_status` (`status`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- ===========================
-- 4. 商品分类表 (category)
-- ===========================
DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '分类 ID',
    `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
    `parent_id` BIGINT(20) DEFAULT 0 COMMENT '父分类 ID',
    `icon` VARCHAR(255) DEFAULT NULL COMMENT '图标',
    `sort` INT(11) DEFAULT 0 COMMENT '排序',
    `status` TINYINT(1) DEFAULT 1 COMMENT '状态 0-禁用 1-启用',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';

-- ===========================
-- 5. 收藏表 (favorites)
-- ===========================
DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '收藏 ID',
    `user_id` BIGINT(20) NOT NULL COMMENT '用户 ID',
    `goods_id` BIGINT(20) NOT NULL COMMENT '商品 ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_goods` (`user_id`, `goods_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_goods_id` (`goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- ===========================
-- 6. 留言/评论表 (comments)
-- ===========================
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '评论 ID',
    `goods_id` BIGINT(20) NOT NULL COMMENT '商品 ID',
    `user_id` BIGINT(20) NOT NULL COMMENT '用户 ID',
    `nickname` VARCHAR(50) DEFAULT NULL COMMENT '用户昵称 (快照)',
    `avatar` VARCHAR(255) DEFAULT NULL COMMENT '用户头像 (快照)',
    `content` VARCHAR(500) NOT NULL COMMENT '评论内容',
    `reply_content` VARCHAR(500) DEFAULT NULL COMMENT '回复内容',
    `reply_time` DATETIME DEFAULT NULL COMMENT '回复时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    KEY `idx_goods_id` (`goods_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='留言/评论表';

-- ===========================
-- 7. 聊天消息表 (chat_messages)
-- ===========================
DROP TABLE IF EXISTS `chat_messages`;
CREATE TABLE `chat_messages` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '消息 ID',
    `sender_id` BIGINT(20) NOT NULL COMMENT '发送者 ID',
    `receiver_id` BIGINT(20) NOT NULL COMMENT '接收者 ID',
    `goods_id` BIGINT(20) DEFAULT NULL COMMENT '关联商品 ID',
    `content` VARCHAR(1000) NOT NULL COMMENT '消息内容',
    `type` TINYINT(1) DEFAULT 1 COMMENT '消息类型 1-文本 2-图片 3-商品卡片',
    `status` TINYINT(1) DEFAULT 0 COMMENT '状态 0-未读 1-已读',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    PRIMARY KEY (`id`),
    KEY `idx_sender_id` (`sender_id`),
    KEY `idx_receiver_id` (`receiver_id`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='聊天消息表';

-- ===========================
-- 初始化数据
-- ===========================

-- 插入默认管理员账号 (密码：admin123)
INSERT INTO `users` (`username`, `password`, `nickname`, `status`) 
VALUES ('admin', '$2a$10$XoLvF5C2dz9.7.N9y8qQZeKZ8qQZeKZ8qQZeKZ8qQZeKZ8qQZeKZ8', '管理员', 1);

-- 插入商品分类
INSERT INTO `category` (`name`, `parent_id`, `sort`) VALUES 
('数码产品', 0, 1),
('手机', 1, 1),
('电脑', 1, 2),
('平板', 1, 3),
('图书教材', 0, 2),
('教材', 5, 1),
('小说', 5, 2),
('生活用品', 0, 3),
('服装', 0, 4),
('运动户外', 0, 5),
('其他', 0, 99);
