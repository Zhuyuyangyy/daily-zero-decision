package com.campus.secondhand.ratelimit;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "template.ratelimit.enabled", havingValue = "false", matchIfMissing = true)
public class NoopRateLimiter implements RateLimiter {
    @Override public boolean tryAcquire(String key) { return true; }
}
