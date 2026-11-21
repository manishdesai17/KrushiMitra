package com.krushimitra.dto.ai;

import java.time.Instant;

public record AiMessageResponse(
        Long messageId,
        String sender,
        String content,
        String language,
        String imageFilename,
        String imageContentType,
        String imageStatus,
        Instant createdAt
) {
}
