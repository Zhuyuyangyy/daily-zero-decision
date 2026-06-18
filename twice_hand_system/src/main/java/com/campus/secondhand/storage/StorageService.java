package com.campus.secondhand.storage;

import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

public interface StorageService {
    String put(String keyPrefix, MultipartFile file);
    InputStream read(String key);
    void delete(String key);
    String publicUrl(String key);
}
