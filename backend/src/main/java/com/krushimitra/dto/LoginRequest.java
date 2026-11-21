package com.krushimitra.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record LoginRequest(
        @NotBlank @Pattern(regexp = "^[6-9]\\d{9}$") String mobileNumber,
        @NotBlank String password,
        @Pattern(regexp = "^(gu|hi|en)?$", message = "Language must be gu, hi, or en") String language
) {
}