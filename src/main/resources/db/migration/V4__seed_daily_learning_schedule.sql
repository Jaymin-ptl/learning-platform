-- ============================================================
-- V4: Daily Learning channel + weekday every-10-minute schedule
-- ============================================================

-- "Daily Learning" Teams channel
-- Replace the placeholder webhook_url with the real incoming-webhook URL
-- before deploying to production.
INSERT INTO teams_channels (name, description, webhook_url, active)
VALUES (
    'Daily Learning',
    'Automated learning tips delivered every 10 minutes on weekdays.',
    'https://placeholder.webhook.office.com/webhookb2/daily-learning',
    1
);

-- One schedule per topic so every topic rotates through the channel.
-- Cron: 0 0/10 * ? * MON-FRI  →  fires at second 0 of every 10th minute,
--       every hour, on Monday–Friday only (Quartz 6-field cron, no year field).
INSERT INTO schedules (name, topic_id, channel_id, send_times, cron_expression, timezone, active)
SELECT
    CONCAT(t.name, ' — Daily Learning'),
    t.id,
    (SELECT id FROM teams_channels WHERE name = 'Daily Learning'),
    'Every 10 minutes, weekdays (Mon–Fri)',
    '0 0/10 * ? * MON-FRI',
    'UTC',
    1
FROM topics t
WHERE t.active = 1;
