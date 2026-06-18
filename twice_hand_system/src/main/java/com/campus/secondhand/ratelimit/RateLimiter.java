package com.campus.secondhand.ratelimit;

public interface RateLimiter {
    boolean tryAcquire(String key);
}
