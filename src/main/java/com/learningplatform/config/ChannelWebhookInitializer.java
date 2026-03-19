package com.learningplatform.config;

import com.learningplatform.repository.TeamsChannelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * After startup, if TEAMS_DEFAULT_WEBHOOK_URL is set, replaces any channel
 * whose webhook URL is still the placeholder inserted by V4 migration.
 * Uses a direct UPDATE query to avoid detached-entity lazy-load issues.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ChannelWebhookInitializer {

    private static final String PLACEHOLDER_PREFIX = "https://placeholder.webhook.office.com";

    private final AppProperties appProperties;
    private final TeamsChannelRepository teamsChannelRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void applyDefaultWebhookUrl() {
        String defaultUrl = appProperties.getTeams().getDefaultWebhookUrl();
        if (!StringUtils.hasText(defaultUrl)) {
            log.warn("TEAMS_DEFAULT_WEBHOOK_URL is not set — Teams notifications will fail for channels with placeholder URLs");
            return;
        }

        int updated = teamsChannelRepository.updatePlaceholderWebhookUrls(defaultUrl, PLACEHOLDER_PREFIX);
        if (updated > 0) {
            log.info("Applied TEAMS_DEFAULT_WEBHOOK_URL to {} channel(s) that had placeholder webhook URLs", updated);
        } else {
            log.info("No channels with placeholder webhook URLs found — nothing to update");
        }
    }
}
