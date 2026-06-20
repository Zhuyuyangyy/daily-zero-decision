package com.campus.secondhand.audit;

public interface AuditLogger {
    void record(String action, Long actorUserId, Object target, String detail);
}
