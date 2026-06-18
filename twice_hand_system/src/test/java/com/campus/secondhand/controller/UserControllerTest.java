package com.campus.secondhand.controller;

import com.campus.secondhand.dto.LoginRequest;
import com.campus.secondhand.dto.RegisterRequest;
import com.campus.secondhand.entity.User;
import com.campus.secondhand.service.UserService;
import com.campus.secondhand.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("User Controller Tests")
class UserControllerTest {

    @InjectMocks
    private UserController userController;

    @Mock
    private UserService userService;

    @Mock
    private JwtUtil jwtUtil;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setNickname("Test User");
        testUser.setStatus(1);
    }

    @Test
    @DisplayName("Should login successfully")
    void login_shouldReturnTokenAndUser() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("123456");

        when(userService.login(request)).thenReturn("test-token");
        when(userService.getUserByUsername("testuser")).thenReturn(testUser);

        var result = userController.login(request);

        assertEquals(200, result.getCode());
        assertNotNull(result.getData());
        assertEquals("test-token", result.getData().get("token"));
    }

    @Test
    @DisplayName("Should register successfully")
    void register_shouldReturnUser() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setPassword("123456");

        when(userService.register(request)).thenReturn(2L);
        when(userService.getUserById(2L)).thenReturn(testUser);

        var result = userController.register(request);

        assertEquals(200, result.getCode());
        assertNotNull(result.getData());
    }

    @Test
    @DisplayName("Should get user info with valid token")
    void getUserInfo_shouldReturnUserInfo() {
        when(jwtUtil.getUserIdFromToken("valid-token")).thenReturn(1L);
        when(userService.getUserById(1L)).thenReturn(testUser);

        var result = userController.getUserInfo("valid-token");

        assertEquals(200, result.getCode());
        assertNotNull(result.getData());
        assertEquals("testuser", result.getData().getUsername());
    }

    @Test
    @DisplayName("Should update user info")
    void updateUserInfo_shouldReturnUpdatedUser() {
        User updateUser = new User();
        updateUser.setNickname("Updated Name");

        when(jwtUtil.getUserIdFromToken("valid-token")).thenReturn(1L);
        when(userService.updateUser(any(User.class))).thenReturn(testUser);

        var result = userController.updateUserInfo(updateUser, "valid-token");

        assertEquals(200, result.getCode());
        assertEquals(1L, updateUser.getId());
    }
}
