package com.campus.secondhand.dto;

import com.campus.secondhand.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenResponse {
    private String accessToken;
    private String refreshToken;
    private long accessExpiresIn;
    private User user;
}
