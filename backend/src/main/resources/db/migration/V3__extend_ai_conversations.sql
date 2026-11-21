ALTER TABLE trn_ai_conversation
    ADD COLUMN language VARCHAR(2) NOT NULL DEFAULT 'gu'
        CHECK (language IN ('gu', 'hi', 'en'));

ALTER TABLE trn_ai_message
    ADD COLUMN language VARCHAR(2) NOT NULL DEFAULT 'gu'
        CHECK (language IN ('gu', 'hi', 'en')),
    ADD COLUMN image_filename VARCHAR(255),
    ADD COLUMN image_content_type VARCHAR(100),
    ADD COLUMN image_status VARCHAR(30);

CREATE INDEX idx_ai_conversation_farmer
    ON trn_ai_conversation(farmer_id, updated_at DESC);

CREATE INDEX idx_ai_message_conversation
    ON trn_ai_message(conversation_id, created_at ASC);
