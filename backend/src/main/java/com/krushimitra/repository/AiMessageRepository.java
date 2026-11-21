package com.krushimitra.repository;

import com.krushimitra.entity.AiMessage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiMessageRepository extends JpaRepository<AiMessage, Long> {
}
