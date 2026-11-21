package com.krushimitra.dto.ai;

import java.time.Instant;
import java.util.List;

public record AiConversationResponse(
        Long conversationId,
        String title,
        String language,
        Instant createdAt,
        Instant updatedAt,
        List<AiMessageResponse> messages
) {
}
