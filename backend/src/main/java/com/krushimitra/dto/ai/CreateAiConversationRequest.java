package com.krushimitra.dto.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CreateAiConversationRequest(
        @NotBlank String title,
        @Pattern(regexp = "^(gu|hi|en)$", message = "Language must be gu, hi, or en") String language
) {
}
