package com.krushimitra.dto;

public record AuthResponse(
        String accessToken,
        String tokenType,
        Long farmerId,
        String fullName,
        String mobileNumber,
        String preferredLanguage
) {
}