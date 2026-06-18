package com.campus.secondhand.service;

import com.campus.secondhand.dto.LoginRequest;
import com.campus.secondhand.dto.RegisterRequest;
import com.campus.secondhand.entity.User;
import com.campus.secondhand.enums.ErrorCode;
import com.campus.secondhand.exception.BusinessException;
import com.campus.secondhand.mapper.UserMapper;
import com.campus.secondhand.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @InjectMocks
    private UserServiceImpl userService;

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setPassword("$2a$10$encoded");
        testUser.setStatus(1);
    }

    @Test
    void login_returnsUserOnValidCredentials() {
        when(userMapper.getByUsername("testuser")).thenReturn(testUser);
        when(passwordEncoder.matches("123456", "$2a$10$encoded")).thenReturn(true);

        LoginRequest req = new LoginRequest();
        req.setUsername("testuser");
        req.setPassword("123456");

        User result = userService.login(req);
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        assertNull(result.getPassword());
    }

    @Test
    void login_throwsUnauthorized_onUnknownUser() {
        when(userMapper.getByUsername("nobody")).thenReturn(null);
        LoginRequest req = new LoginRequest();
        req.setUsername("nobody");
        req.setPassword("x");

        BusinessException ex = assertThrows(BusinessException.class, () -> userService.login(req));
        assertEquals(ErrorCode.UNAUTHORIZED, ex.getErrorCode());
    }

    @Test
    void login_throwsUnauthorized_onWrongPassword() {
        when(userMapper.getByUsername("testuser")).thenReturn(testUser);
        when(passwordEncoder.matches("wrong", "$2a$10$encoded")).thenReturn(false);

        LoginRequest req = new LoginRequest();
        req.setUsername("testuser");
        req.setPassword("wrong");

        BusinessException ex = assertThrows(BusinessException.class, () -> userService.login(req));
        assertEquals(ErrorCode.UNAUTHORIZED, ex.getErrorCode());
    }

    @Test
    void login_throwsForbidden_onDisabledUser() {
        testUser.setStatus(0);
        when(userMapper.getByUsername("testuser")).thenReturn(testUser);
        when(passwordEncoder.matches("123456", "$2a$10$encoded")).thenReturn(true);

        LoginRequest req = new LoginRequest();
        req.setUsername("testuser");
        req.setPassword("123456");

        BusinessException ex = assertThrows(BusinessException.class, () -> userService.login(req));
        assertEquals(ErrorCode.FORBIDDEN, ex.getErrorCode());
    }

    @Test
    void register_throwsConflict_onDuplicateUsername() {
        when(userMapper.getByUsername("testuser")).thenReturn(testUser);
        RegisterRequest req = new RegisterRequest();
        req.setUsername("testuser");
        req.setPassword("123456");

        BusinessException ex = assertThrows(BusinessException.class, () -> userService.register(req));
        assertEquals(ErrorCode.CONFLICT, ex.getErrorCode());
    }

    @Test
    void register_throwsConflict_onDuplicatePhone() {
        when(userMapper.getByUsername("newuser")).thenReturn(null);
        when(userMapper.getByPhone("13800000000")).thenReturn(testUser);
        RegisterRequest req = new RegisterRequest();
        req.setUsername("newuser");
        req.setPassword("123456");
        req.setPhone("13800000000");

        BusinessException ex = assertThrows(BusinessException.class, () -> userService.register(req));
        assertEquals(ErrorCode.CONFLICT, ex.getErrorCode());
    }

    @Test
    void register_encodesPassword_andInserts() {
        when(userMapper.getByUsername("newuser")).thenReturn(null);
        when(userMapper.getByPhone(any())).thenReturn(null);
        when(passwordEncoder.encode("123456")).thenReturn("$2a$10$new");
        when(userMapper.insert(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(2L);
            return 1;
        });

        RegisterRequest req = new RegisterRequest();
        req.setUsername("newuser");
        req.setPassword("123456");
        req.setPhone("13800000000");

        Long id = userService.register(req);
        assertEquals(2L, id);
        verify(passwordEncoder).encode("123456");
    }
}
