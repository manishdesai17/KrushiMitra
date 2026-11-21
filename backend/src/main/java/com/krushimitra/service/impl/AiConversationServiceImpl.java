package com.krushimitra.service.impl;

import com.krushimitra.ai.AiProvider;
import com.krushimitra.dto.ai.AiConversationResponse;
import com.krushimitra.dto.ai.AiMessageResponse;
import com.krushimitra.entity.AiConversation;
import com.krushimitra.entity.AiMessage;
import com.krushimitra.entity.Farmer;
import com.krushimitra.exception.ResourceNotFoundException;
import com.krushimitra.repository.AiConversationRepository;
import com.krushimitra.repository.FarmerRepository;
import com.krushimitra.service.AiConversationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
public class AiConversationServiceImpl implements AiConversationService {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of("image/jpeg", "image/png");

    private final AiConversationRepository conversationRepository;
    private final FarmerRepository farmerRepository;
    private final AiProvider aiProvider;

    public AiConversationServiceImpl(AiConversationRepository conversationRepository,
                                     FarmerRepository farmerRepository, AiProvider aiProvider) {
        this.conversationRepository = conversationRepository;
        this.farmerRepository = farmerRepository;
        this.aiProvider = aiProvider;
    }

    @Override
    public AiConversationResponse create(Long farmerId, String title, String language) {
        Farmer farmer = findFarmer(farmerId);
        String safeLanguage = normalizeLanguage(language, farmer.getPreferredLanguage());
        AiConversation conversation = new AiConversation(farmer,
                title == null || title.isBlank() ? "New farming question" : title.strip(), safeLanguage);
        return toConversationResponse(conversationRepository.save(conversation));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AiConversationResponse> findAll(Long farmerId) {
        return conversationRepository.findByFarmerFarmerIdOrderByUpdatedAtDesc(farmerId).stream()
                .map(this::toConversationResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AiConversationResponse findById(Long farmerId, Long conversationId) {
        return toConversationResponse(findOwnedConversation(farmerId, conversationId));
    }

    @Override
    public AiMessageResponse addMessage(Long farmerId, Long conversationId, String question,
                                        String language, MultipartFile image) {
        Farmer farmer = findFarmer(farmerId);
        AiConversation conversation = findOwnedConversation(farmerId, conversationId);
        String safeLanguage = normalizeLanguage(language, farmer.getPreferredLanguage());
        conversation.setLanguage(safeLanguage);

        AiMessage farmerMessage = new AiMessage(conversation, "FARMER", question.strip(), safeLanguage);
        if (image != null && !image.isEmpty()) {
            validateAndSaveImage(image, farmerMessage);
        }
        conversation.getMessages().add(farmerMessage);

        String answer = aiProvider.respond(question.strip(), safeLanguage, image != null && !image.isEmpty());
        AiMessage assistantMessage = new AiMessage(conversation, "ASSISTANT", answer, safeLanguage);
        conversation.getMessages().add(assistantMessage);
        conversationRepository.save(conversation);

        return toMessageResponse(assistantMessage);
    }

    @Override
    public void delete(Long farmerId, Long conversationId) {
        AiConversation conversation = findOwnedConversation(farmerId, conversationId);
        conversationRepository.delete(conversation);
    }

    private Farmer findFarmer(Long farmerId) {
        return farmerRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer " + farmerId + " was not found."));
    }

    private AiConversation findOwnedConversation(Long farmerId, Long conversationId) {
        return conversationRepository.findByConversationIdAndFarmerFarmerId(conversationId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation " + conversationId + " was not found."));
    }

    private String normalizeLanguage(String requested, String profileLanguage) {
        String candidate = requested == null || requested.isBlank() ? profileLanguage : requested;
        return switch (candidate) {
            case "hi", "en", "gu" -> candidate;
            default -> "gu";
        };
    }

    private void validateAndSaveImage(MultipartFile image, AiMessage message) {
        if (!ALLOWED_IMAGE_TYPES.contains(image.getContentType())) {
            throw new IllegalArgumentException("Only JPG, JPEG, and PNG images are supported.");
        }
        if (image.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("Image must be smaller than 10 MB.");
        }

        String extension = "image/png".equals(image.getContentType()) ? ".png" : ".jpg";
        String filename = UUID.randomUUID() + extension;
        try {
            Path uploadDirectory = Path.of(System.getProperty("user.dir"), "uploads", "ai");
            Files.createDirectories(uploadDirectory);
            Files.copy(image.getInputStream(), uploadDirectory.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            message.setImageMetadata(filename, image.getContentType(), "UPLOADED_UNVERIFIED");
        } catch (IOException exception) {
            throw new IllegalStateException("Could not store the uploaded image.", exception);
        }
    }

    private AiConversationResponse toConversationResponse(AiConversation conversation) {
        List<AiMessageResponse> messages = conversation.getMessages().stream()
                .map(this::toMessageResponse)
                .toList();
        return new AiConversationResponse(conversation.getConversationId(), conversation.getTitle(),
                conversation.getLanguage(), conversation.getCreatedAt(), conversation.getUpdatedAt(), messages);
    }

    private AiMessageResponse toMessageResponse(AiMessage message) {
        return new AiMessageResponse(message.getMessageId(), message.getSender(), message.getContent(),
                message.getLanguage(), message.getImageFilename(), message.getImageContentType(),
                message.getImageStatus(), message.getCreatedAt());
    }
}
