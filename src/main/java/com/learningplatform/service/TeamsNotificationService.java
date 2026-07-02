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
        send(channel, topic, "💡 Daily IT Tip — " + topic.getName(), tipContent);
    }

    /**
     * Sends the delayed answer reveal for a two-part question/answer schedule.
     */
    public void sendAnswer(TeamsChannel channel, Topic topic, String answerContent) {
        send(channel, topic, "✅ Puzzle Answer — " + topic.getName(), answerContent);
    }

    private void send(TeamsChannel channel, Topic topic, String title, String content) {
        Map<String, Object> adaptiveCard = buildAdaptiveCard(topic, title, content);

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
     * Builds a Teams-compatible Adaptive Card payload.
     * Uses the "Office 365 Connector" MessageCard format for maximum compatibility.
     */
    private Map<String, Object> buildAdaptiveCard(Topic topic, String title, String tipContent) {
        String difficultyEmoji = switch (topic.getDifficulty()) {
            case BEGINNER -> "🟢";
            case INTERMEDIATE -> "🟡";
            case ADVANCED -> "🔴";
        };

        // Format tip content: replace markdown bold (**text**) with Teams-compatible format
        String formattedContent = tipContent
                .replace("**", "**")  // Teams supports markdown bold in facts
                .replace("\n", "\n\n");

        return Map.of(
                "@type", "MessageCard",
                "@context", "http://schema.org/extensions",
                "themeColor", "0076D7",
                "summary", title,
                "sections", new Object[]{
                        Map.of(
                                "activityTitle", title,
                                "activitySubtitle", difficultyEmoji + " " + topic.getDifficulty().name()
                                        + " | Tags: " + (topic.getTags() != null ? topic.getTags() : ""),
                                "activityText", formattedContent,
                                "markdown", true
                        )
                }
        );
    }
}
