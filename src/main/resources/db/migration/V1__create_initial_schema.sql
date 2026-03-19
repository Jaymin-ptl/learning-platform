-- ============================================================
-- V1: Initial schema for Learning Platform (MySQL)
-- ============================================================

-- Teams Channels
CREATE TABLE teams_channels (
    id          BIGINT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    webhook_url TEXT            NOT NULL,
    description VARCHAR(255),
    active      TINYINT(1)      NOT NULL DEFAULT 1,
    created_at  DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

-- Topics
CREATE TABLE topics (
    id          BIGINT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL UNIQUE,
    description TEXT            NOT NULL,
    difficulty  VARCHAR(20)     NOT NULL,
    tags        VARCHAR(500),
    active      TINYINT(1)      NOT NULL DEFAULT 1,
    created_at  DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

-- Schedules
CREATE TABLE schedules (
    id               BIGINT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(100)    NOT NULL,
    topic_id         BIGINT          NOT NULL,
    channel_id       BIGINT          NOT NULL,
    send_times       VARCHAR(255)    NOT NULL,
    cron_expression  VARCHAR(100)    NOT NULL,
    timezone         VARCHAR(50)     NOT NULL DEFAULT 'UTC',
    active           TINYINT(1)      NOT NULL DEFAULT 1,
    created_at       DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at       DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_schedules_topic   FOREIGN KEY (topic_id)   REFERENCES topics(id),
    CONSTRAINT fk_schedules_channel FOREIGN KEY (channel_id) REFERENCES teams_channels(id)
);

-- Tip Logs
CREATE TABLE tip_logs (
    id            BIGINT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    schedule_id   BIGINT          NOT NULL,
    topic_id      BIGINT          NOT NULL,
    channel_id    BIGINT          NOT NULL,
    generated_tip TEXT            NOT NULL,
    status        VARCHAR(20)     NOT NULL,
    error_message TEXT,
    triggered_by  VARCHAR(50)     NOT NULL DEFAULT 'SCHEDULER',
    created_at    DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_tip_logs_schedule FOREIGN KEY (schedule_id) REFERENCES schedules(id),
    CONSTRAINT fk_tip_logs_topic    FOREIGN KEY (topic_id)    REFERENCES topics(id),
    CONSTRAINT fk_tip_logs_channel  FOREIGN KEY (channel_id)  REFERENCES teams_channels(id)
);

-- Admin Users
CREATE TABLE admin_users (
    id           BIGINT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username     VARCHAR(50)     NOT NULL UNIQUE,
    email        VARCHAR(100)    NOT NULL UNIQUE,
    password     VARCHAR(255)    NOT NULL,
    role         VARCHAR(20)     NOT NULL DEFAULT 'ADMIN',
    active       TINYINT(1)      NOT NULL DEFAULT 1,
    created_at   DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at   DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

-- Indexes
CREATE INDEX idx_schedules_topic_id   ON schedules(topic_id);
CREATE INDEX idx_schedules_channel_id ON schedules(channel_id);
CREATE INDEX idx_schedules_active     ON schedules(active);
CREATE INDEX idx_tip_logs_schedule_id ON tip_logs(schedule_id);
CREATE INDEX idx_tip_logs_topic_id    ON tip_logs(topic_id);
CREATE INDEX idx_tip_logs_created_at  ON tip_logs(created_at);
CREATE INDEX idx_topics_active        ON topics(active);
