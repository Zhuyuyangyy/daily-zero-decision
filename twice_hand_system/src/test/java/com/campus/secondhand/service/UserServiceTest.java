package com.campus.secondhand.service;

import com.campus.secondhand.dto.LoginRequest;
import com.campus.secondhand.dto.RegisterRequest;
import com.campus.secondhand.entity.User;
import com.campus.secondhand.mapper.UserMapper;
import com.campus.secondhand.service.impl.UserServiceImpl;
import com.campus.secondhand.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("User Service Tests")
class UserServiceTest {

    @InjectMocks
    private UserServiceImpl userService;

    @Mock
    private UserMapper userMapper;

    @Mock
    private JwtUtil jwtUtil;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setPassword("e10adc3949ba59abbe56e057f20f883e"); // MD5 of "123456"
        testUser.setNickname("Test User");
        testUser.setPhone("13800138000");
        testUser.setEmail("test@example.com");
        testUser.setSchool("Test University");
        testStudentId("2021001");
        testUser.setStatus(1);
    }

    private void testStudentId(String s) {
        testUser.setStudentId(s);
    }

    @Test
    @DisplayName("Should login successfully with valid credentials")
    void login_shouldSucceedWithValidCredentials() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("123456");

        when(userMapper.getByUsername("testuser")).thenReturn(testUser);
        when(jwtUtil.generateToken(1L)).thenReturn("test-token");

        String token = userService.login(request);

        assertNotNull(token);
        assertEquals("test-token", token);
        verify(userMapper).getByUsername("testuser");
        verify(jwtUtil).generateToken(1L);
    }

    @Test
    @DisplayName("Should throw exception for non-existent user")
    void login_shouldThrowForNonExistentUser() {
        LoginRequest request = new LoginRequest();
        request.setUsername("nonexistent");
        request.setPassword("123456");

        when(userMapper.getByUsername("nonexistent")).thenReturn(null);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> userService.login(request));
        assertEquals("用户名或密码错误", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception for wrong password")
    void login_shouldThrowForWrongPassword() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("wrongpassword");

        when(userMapper.getByUsername("testuser")).thenReturn(testUser);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> userService.login(request));
        assertEquals("用户名或密码错误", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception for disabled user")
    void login_shouldThrowForDisabledUser() {
        testUser.setStatus(0);
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("123456");

        when(userMapper.getByUsername("testuser")).thenReturn(testUser);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> userService.login(request));
        assertEquals("用户已被禁用", exception.getMessage());
    }

    @Test
    @DisplayName("Should register new user successfully")
    void register_shouldSucceedForNewUser() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setPassword("123456");
        request.setNickname("New User");
        request.setPhone("13900139000");
        request.setEmail("new@example.com");
        request.setSchool("Test University");
        request.setStudentId("2021002");

        when(userMapper.getByUsername("newuser")).thenReturn(null);
        when(userMapper.getByPhone("13900139000")).thenReturn(null);
        when(userMapper.insert(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(2L);
            return 1;
        });

        Long userId = userService.register(request);

        assertNotNull(userId);
        verify(userMapper).insert(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception for duplicate username")
    void register_shouldThrowForDuplicateUsername() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setPassword("123456");

        when(userMapper.getByUsername("testuser")).thenReturn(testUser);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> userService.register(request));
        assertEquals("用户名已存在", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception for duplicate phone")
    void register_shouldThrowForDuplicatePhone() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setPassword("123456");
        request.setPhone("13800138000");

        when(userMapper.getByUsername("newuser")).thenReturn(null);
        when(userMapper.getByPhone("13800138000")).thenReturn(testUser);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> userService.register(request));
        assertEquals("手机号已被注册", exception.getMessage());
    }

    @Test
    @DisplayName("Should get user by ID")
    void getUserById_shouldReturnUser() {
        when(userMapper.selectById(1L)).thenReturn(testUser);

        User result = userService.getUserById(1L);

        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
    }

    @Test
    @DisplayName("Should get user by username")
    void getUserByUsername_shouldReturnUser() {
        when(userMapper.getByUsername("testuser")).thenReturn(testUser);

        User result = userService.getUserByUsername("testuser");

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    @DisplayName("Should update user successfully")
    void updateUser_shouldSucceed() {
        User updatedUser = new User();
        updatedUser.setId(1L);
        updatedUser.setNickname("Updated Name");

        when(userMapper.updateById(any(User.class))).thenReturn(1);
        when(userMapper.selectById(1L)).thenReturn(updatedUser);

        User result = userService.updateUser(updatedUser);

        assertNotNull(result);
        verify(userMapper).updateById(any(User.class));
    }

    @Test
    @DisplayName("Should check username existence")
    void existsByUsername_shouldReturnTrueIfExists() {
        when(userMapper.getByUsername("testuser")).thenReturn(testUser);

        assertTrue(userService.existsByUsername("testuser"));
    }

    @Test
    @DisplayName("Should check username non-existence")
    void existsByUsername_shouldReturnFalseIfNotExists() {
        when(userMapper.getByUsername("nonexistent")).thenReturn(null);

        assertFalse(userService.existsByUsername("nonexistent"));
    }

    @Test
    @DisplayName("Should check phone existence")
    void existsByPhone_shouldReturnTrueIfExists() {
        when(userMapper.getByPhone("13800138000")).thenReturn(testUser);

        assertTrue(userService.existsByPhone("13800138000"));
    }

    @Test
    @DisplayName("Should check phone non-existence")
    void existsByPhone_shouldReturnFalseIfNotExists() {
        when(userMapper.getByPhone("13900139000")).thenReturn(null);

        assertFalse(userService.existsByPhone("13900139000"));
    }
}
