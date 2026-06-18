package com.campus.secondhand.audit;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "template.audit.enabled", havingValue = "false", matchIfMissing = true)
public class NoopAuditLogger implements AuditLogger {
    @Override public void record(String action, Long actorUserId, Object target, String detail) { }
}
