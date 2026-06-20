package com.campus.secondhand.storage;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

@Service
@ConditionalOnProperty(name = "template.storage.enabled", havingValue = "false", matchIfMissing = true)
public class NoopStorageService implements StorageService {
    @Override
    public String put(String keyPrefix, MultipartFile file) {
        throw new UnsupportedOperationException("Storage is disabled. Set template.storage.enabled=true and provide a real implementation.");
    }
    @Override public InputStream read(String key) { return new ByteArrayInputStream(new byte[0]); }
    @Override public void delete(String key) { }
    @Override public String publicUrl(String key) { return null; }
}
