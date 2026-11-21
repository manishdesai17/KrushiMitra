package com.krushimitra.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "trn_ai_message")
public class AiMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Long messageId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversation_id", nullable = false)
    private AiConversation conversation;

    @Column(nullable = false, length = 20)
    private String sender;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, length = 2)
    private String language;

    @Column(name = "image_filename", length = 255)
    private String imageFilename;

    @Column(name = "image_content_type", length = 100)
    private String imageContentType;

    @Column(name = "image_status", length = 30)
    private String imageStatus;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected AiMessage() {
    }

    public AiMessage(AiConversation conversation, String sender, String content, String language) {
        this.conversation = conversation;
        this.sender = sender;
        this.content = content;
        this.language = language;
    }

    public Long getMessageId() {
        return messageId;
    }

    public String getSender() {
        return sender;
    }

    public String getContent() {
        return content;
    }

    public String getLanguage() {
        return language;
    }

    public String getImageFilename() {
        return imageFilename;
    }

    public String getImageContentType() {
        return imageContentType;
    }

    public String getImageStatus() {
        return imageStatus;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setImageMetadata(String filename, String contentType, String status) {
        this.imageFilename = filename;
        this.imageContentType = contentType;
        this.imageStatus = status;
    }
}
