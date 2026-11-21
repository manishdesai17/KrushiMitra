package com.krushimitra.service;

import com.krushimitra.dto.ai.AiConversationResponse;
import com.krushimitra.dto.ai.AiMessageResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AiConversationService {
    AiConversationResponse create(Long farmerId, String title, String language);

    List<AiConversationResponse> findAll(Long farmerId);

    AiConversationResponse findById(Long farmerId, Long conversationId);

    AiMessageResponse addMessage(Long farmerId, Long conversationId, String question,
                                 String language, MultipartFile image);

    void delete(Long farmerId, Long conversationId);
}
