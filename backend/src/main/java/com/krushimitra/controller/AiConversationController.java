package com.krushimitra.controller;

import com.krushimitra.dto.ai.AiConversationResponse;
import com.krushimitra.dto.ai.AiMessageResponse;
import com.krushimitra.dto.ai.CreateAiConversationRequest;
import com.krushimitra.service.AiConversationService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/ai/conversations")
public class AiConversationController {

    private final AiConversationService conversationService;

    public AiConversationController(AiConversationService conversationService) {
        this.conversationService = conversationService;
    }

    @PostMapping
    public AiConversationResponse create(@AuthenticationPrincipal Jwt jwt,
                                         @Valid @RequestBody CreateAiConversationRequest request) {
        return conversationService.create(jwt.getClaim("farmerId"), request.title(), request.language());
    }

    @GetMapping
    public List<AiConversationResponse> findAll(@AuthenticationPrincipal Jwt jwt) {
        return conversationService.findAll(jwt.getClaim("farmerId"));
    }

    @GetMapping("/{conversationId}")
    public AiConversationResponse findById(@AuthenticationPrincipal Jwt jwt,
                                           @PathVariable Long conversationId) {
        return conversationService.findById(jwt.getClaim("farmerId"), conversationId);
    }

    @PostMapping(value = "/{conversationId}/messages", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AiMessageResponse addMessage(@AuthenticationPrincipal Jwt jwt,
                                        @PathVariable Long conversationId,
                                        @RequestParam("question") String question,
                                        @RequestParam("language") String language,
                                        @RequestParam(value = "image", required = false) MultipartFile image) {
        return conversationService.addMessage(jwt.getClaim("farmerId"), conversationId,
                question, language, image);
    }

    @PostMapping(value = "/{conversationId}/messages", consumes = MediaType.APPLICATION_JSON_VALUE)
    public AiMessageResponse addTextMessage(@AuthenticationPrincipal Jwt jwt,
                                            @PathVariable Long conversationId,
                                            @RequestBody java.util.Map<String, String> request) {
        return conversationService.addMessage(jwt.getClaim("farmerId"), conversationId,
                request.get("question"), request.get("language"), null);
    }

    @DeleteMapping("/{conversationId}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal Jwt jwt,
                                       @PathVariable Long conversationId) {
        conversationService.delete(jwt.getClaim("farmerId"), conversationId);
        return ResponseEntity.noContent().build();
    }
}
