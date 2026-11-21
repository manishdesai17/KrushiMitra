ALTER TABLE mst_farmer
    ADD COLUMN preferred_language VARCHAR(2) NOT NULL DEFAULT 'gu'
    CHECK (preferred_language IN ('gu', 'hi', 'en'));