package com.learningplatform.config;

import com.learningplatform.domain.TeamsChannel;
import com.learningplatform.repository.TeamsChannelRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * On startup, if TEAMS_DEFAULT_WEBHOOK_URL is set, applies it to any channel
 * whose webhook URL is still the placeholder inserted by V4 migration.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ChannelWebhookInitializer {

    private static final String PLACEHOLDER_PREFIX = "https://placeholder.webhook.office.com";

    private final AppProperties appProperties;
    private final TeamsChannelRepository teamsChannelRepository;

    @PostConstruct
    public void applyDefaultWebhookUrl() {
        String defaultUrl = appProperties.getTeams().getDefaultWebhookUrl();
        if (!StringUtils.hasText(defaultUrl)) {
            log.warn("TEAMS_DEFAULT_WEBHOOK_URL is not set — Teams notifications will fail if channels still have placeholder URLs");
            return;
        }

        List<TeamsChannel> channels = teamsChannelRepository.findAll();
        int updated = 0;
        for (TeamsChannel channel : channels) {
            if (channel.getWebhookUrl() == null || channel.getWebhookUrl().startsWith(PLACEHOLDER_PREFIX)) {
                channel.setWebhookUrl(defaultUrl);
                teamsChannelRepository.save(channel);
                log.info("Updated webhook URL for channel '{}' from placeholder to real Teams webhook", channel.getName());
                updated++;
            }
        }

        if (updated == 0) {
            log.info("All channels already have real webhook URLs — no updates needed");
        } else {
            log.info("Applied TEAMS_DEFAULT_WEBHOOK_URL to {} channel(s)", updated);
        }
    }
}
