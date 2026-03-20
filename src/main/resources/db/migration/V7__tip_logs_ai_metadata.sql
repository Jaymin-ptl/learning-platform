-- ============================================================
-- V7: Add AI metadata columns to tip_logs
-- ============================================================
ALTER TABLE tip_logs
    ADD COLUMN prompt_used        TEXT            NULL,
    ADD COLUMN model_used         VARCHAR(100)    NULL,
    ADD COLUMN prompt_tokens      INT             NULL,
    ADD COLUMN completion_tokens  INT             NULL,
    ADD COLUMN total_tokens       INT             NULL;
