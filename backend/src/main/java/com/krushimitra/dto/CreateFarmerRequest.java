package com.krushimitra.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateFarmerRequest(
        @NotBlank @Size(max = 120) String fullName,
        @NotBlank @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit mobile number") String mobileNumber,
        @Email @Size(max = 254) String email,
        @NotBlank @Size(min = 8, max = 72) String password,
        @NotBlank @Size(max = 100) String village,
        @NotBlank @Size(max = 100) String taluka,
        @NotBlank @Size(max = 100) String district,
        @NotBlank @Size(max = 100) String state,
        @jakarta.validation.constraints.Pattern(regexp = "^(gu|hi|en)?$", message = "Language must be gu, hi, or en") String language
) {
}