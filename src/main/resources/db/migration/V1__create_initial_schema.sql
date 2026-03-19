-- ============================================================
-- V1: Initial schema for Learning Platform
-- ============================================================

-- Teams Channels
CREATE TABLE teams_channels (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    webhook_url TEXT          NOT NULL,
    description VARCHAR(255),
    active      BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Topics
CREATE TABLE topics (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL UNIQUE,
    description TEXT          NOT NULL,
    difficulty  VARCHAR(20)   NOT NULL CHECK (difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    tags        VARCHAR(500),           -- comma-separated tags
    active      BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Schedules (one schedule = one topic + one channel + timing config)
CREATE TABLE schedules (
    id               BIGSERIAL PRIMARY KEY,
    name             VARCHAR(100)  NOT NULL,
    topic_id         BIGINT        NOT NULL REFERENCES topics(id),
    channel_id       BIGINT        NOT NULL REFERENCES teams_channels(id),
    -- timing: stored as comma-separated HH:mm times, e.g. "09:00,14:00"
    send_times       VARCHAR(255)  NOT NULL,
    -- derived cron expression, computed and stored for Quartz
    cron_expression  VARCHAR(100)  NOT NULL,
    timezone         VARCHAR(50)   NOT NULL DEFAULT 'UTC',
    active           BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Tip Logs (history of every tip sent or attempted)
CREATE TABLE tip_logs (
    id            BIGSERIAL PRIMARY KEY,
    schedule_id   BIGINT       NOT NULL REFERENCES schedules(id),
    topic_id      BIGINT       NOT NULL REFERENCES topics(id),
    channel_id    BIGINT       NOT NULL REFERENCES teams_channels(id),
    generated_tip TEXT         NOT NULL,
    status        VARCHAR(20)  NOT NULL CHECK (status IN ('SENT', 'FAILED', 'PREVIEW')),
    error_message TEXT,
    triggered_by  VARCHAR(50)  NOT NULL DEFAULT 'SCHEDULER',  -- SCHEDULER | MANUAL
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Admin Users
CREATE TABLE admin_users (
    id           BIGSERIAL PRIMARY KEY,
    username     VARCHAR(50)  NOT NULL UNIQUE,
    email        VARCHAR(100) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,  -- BCrypt hashed
    role         VARCHAR(20)  NOT NULL DEFAULT 'ADMIN' CHECK (role IN ('ADMIN', 'VIEWER')),
    active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_schedules_topic_id   ON schedules(topic_id);
CREATE INDEX idx_schedules_channel_id ON schedules(channel_id);
CREATE INDEX idx_schedules_active     ON schedules(active);
CREATE INDEX idx_tip_logs_schedule_id ON tip_logs(schedule_id);
CREATE INDEX idx_tip_logs_topic_id    ON tip_logs(topic_id);
CREATE INDEX idx_tip_logs_created_at  ON tip_logs(created_at DESC);
CREATE INDEX idx_topics_active        ON topics(active);
