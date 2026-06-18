package com.campus.secondhand;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("Application Context Tests")
class SecondhandApplicationTests {

    @Test
    @DisplayName("Should load application context")
    void contextLoads() {
        // Verify that the Spring application context loads successfully
        assertDoesNotThrow(() -> {
            // Context loaded successfully if no exception is thrown
        });
    }
}
