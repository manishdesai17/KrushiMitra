package com.krushimitra.dto;

import java.time.Instant;

public record FarmerResponse(
        Long farmerId,
        String fullName,
        String mobileNumber,
        String email,
        String village,
        String taluka,
        String district,
        String state,
        String preferredLanguage,
        Instant createdAt,
        Instant updatedAt
) {
}