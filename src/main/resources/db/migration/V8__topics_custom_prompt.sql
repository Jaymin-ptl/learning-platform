-- ============================================================
-- V8: Add custom_prompt column to topics
-- ============================================================
ALTER TABLE topics
    ADD COLUMN custom_prompt TEXT NULL;
