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
