package com.learningplatform.service;

import com.learningplatform.domain.TeamsChannel;
import com.learningplatform.domain.Topic;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeamsNotificationService {

    private final WebClient webClient;

    /**
     * Sends a formatted Adaptive Card message to a Teams channel via Incoming Webhook.
     *
     * @param channel  the Teams channel to send to
     * @param topic    the topic the tip is about
     * @param tipContent the AI-generated tip content
     */
    public void sendTip(TeamsChannel channel, Topic topic, String tipContent) {
        Map<String, Object> adaptiveCard = buildAdaptiveCard(topic, tipContent);

        try {
            webClient.post()
                    .uri(channel.getWebhookUrl())
                    .bodyValue(adaptiveCard)
                    .retrieve()
                    .toBodilessEntity()
                    .block();

            log.info("Tip sent to Teams channel '{}' for topic '{}'", channel.getName(), topic.getName());
        } catch (WebClientResponseException ex) {
            log.error("Failed to send tip to Teams channel '{}': HTTP {} - {}",
                    channel.getName(), ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new RuntimeException("Teams webhook call failed: " + ex.getStatusCode(), ex);
        } catch (Exception ex) {
            log.error("Unexpected error sending to Teams channel '{}': {}", channel.getName(), ex.getMessage(), ex);
            throw new RuntimeException("Teams notification failed", ex);
        }
    }

    /**
     * Builds a Teams Adaptive Card payload compatible with the new Teams
     * "Send webhook alert to a channel" Power Automate workflow.
     */
    private Map<String, Object> buildAdaptiveCard(Topic topic, String tipContent) {
        String difficultyEmoji = switch (topic.getDifficulty()) {
            case BEGINNER -> "🟢";
            case INTERMEDIATE -> "🟡";
            case ADVANCED -> "🔴";
        };

        String subtitle = difficultyEmoji + " " + topic.getDifficulty().name()
                + (topic.getTags() != null && !topic.getTags().isEmpty() ? " | " + topic.getTags() : "");

        Map<String, Object> titleBlock = new java.util.LinkedHashMap<>();
        titleBlock.put("type", "TextBlock");
        titleBlock.put("size", "Large");
        titleBlock.put("weight", "Bolder");
        titleBlock.put("text", "💡 Daily IT Tip — " + topic.getName());
        titleBlock.put("wrap", true);

        Map<String, Object> subtitleBlock = new java.util.LinkedHashMap<>();
        subtitleBlock.put("type", "TextBlock");
        subtitleBlock.put("text", subtitle);
        subtitleBlock.put("isSubtle", true);
        subtitleBlock.put("wrap", true);

        Map<String, Object> contentBlock = new java.util.LinkedHashMap<>();
        contentBlock.put("type", "TextBlock");
        contentBlock.put("text", tipContent);
        contentBlock.put("wrap", true);

        Map<String, Object> adaptiveCard = new java.util.LinkedHashMap<>();
        adaptiveCard.put("type", "AdaptiveCard");
        adaptiveCard.put("$schema", "http://adaptivecards.io/schemas/adaptive-card.json");
        adaptiveCard.put("version", "1.2");
        adaptiveCard.put("body", new Object[]{titleBlock, subtitleBlock, contentBlock});

        Map<String, Object> attachment = new java.util.LinkedHashMap<>();
        attachment.put("contentType", "application/vnd.microsoft.card.adaptive");
        attachment.put("contentUrl", null);
        attachment.put("content", adaptiveCard);

        Map<String, Object> payload = new java.util.LinkedHashMap<>();
        payload.put("type", "message");
        payload.put("attachments", new Object[]{attachment});

        return payload;
    }
}
