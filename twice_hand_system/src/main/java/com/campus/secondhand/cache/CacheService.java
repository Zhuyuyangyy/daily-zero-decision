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
