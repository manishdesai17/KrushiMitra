package com.krushimitra.repository;

import com.krushimitra.entity.AiConversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AiConversationRepository extends JpaRepository<AiConversation, Long> {
    List<AiConversation> findByFarmerFarmerIdOrderByUpdatedAtDesc(Long farmerId);

    Optional<AiConversation> findByConversationIdAndFarmerFarmerId(Long conversationId, Long farmerId);
}
