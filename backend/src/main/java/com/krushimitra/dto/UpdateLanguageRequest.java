package com.krushimitra.dto;

import jakarta.validation.constraints.Pattern;

public record UpdateLanguageRequest(
        @Pattern(regexp = "^(gu|hi|en)$", message = "Language must be gu, hi, or en") String language
) {
}