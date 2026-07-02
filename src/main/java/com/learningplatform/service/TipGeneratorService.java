package com.learningplatform.service;

import com.learningplatform.config.AppProperties;
import com.learningplatform.domain.TipLog;
import com.learningplatform.domain.Topic;
import com.learningplatform.repository.TipLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TipGeneratorService {

    /** How many previous tips to feed back into the prompt to avoid repetition. */
    private static final int RECENT_TIPS_TO_AVOID = 5;
    private static final int RECENT_TIP_SUMMARY_MAX_LENGTH = 150;

    private final ChatClient chatClient;
    private final AppProperties appProperties;
    private final TipLogRepository tipLogRepository;

    /**
     * Generates an AI tip for the given topic. Uses the topic's own prompt
     * template when one is defined (so a code puzzle, a news brief and a
     * keyword explainer can each have their own format), falling back to the
     * global template from app.ai.tip-prompt-template otherwise.
     *
     * @param topic the topic to generate a tip for
     * @return the generated tip as a formatted string
     */
    public String generateTip(Topic topic) {
        String prompt = buildPrompt(topic);
        log.debug("Generating tip for topic '{}' using AI", topic.getName());

        String tip = chatClient.prompt()
                .user(prompt)
                .call()
                .content();

        log.info("Tip generated successfully for topic '{}'", topic.getName());
        return tip;
    }

    private String buildPrompt(Topic topic) {
        String template = (topic.getPromptTemplate() != null && !topic.getPromptTemplate().isBlank())
                ? topic.getPromptTemplate()
                : appProperties.getAi().getTipPromptTemplate();

        return template
                .replace("{topic}", topic.getName())
                .replace("{description}", topic.getDescription())
                .replace("{difficulty}", topic.getDifficulty().name())
                .replace("{tags}", topic.getTags() != null ? topic.getTags() : "")
                .replace("{current_date}", LocalDate.now(ZoneOffset.UTC).toString())
                .replace("{recent_tips}", recentTipSummaries(topic.getId()));
    }

    /**
     * Summaries (first line) of the last few tips sent for this topic,
     * injected into the prompt so the model does not repeat itself.
     */
    private String recentTipSummaries(Long topicId) {
        if (topicId == null) {
            return "(none yet)";
        }
        List<TipLog> recent = tipLogRepository
                .findAllByTopicIdOrderByCreatedAtDesc(topicId, PageRequest.of(0, RECENT_TIPS_TO_AVOID))
                .getContent();

        String summaries = recent.stream()
                .map(logEntry -> firstLine(logEntry.getGeneratedTip()))
                .filter(line -> !line.isBlank())
                .map(line -> "- " + line)
                .collect(Collectors.joining("\n"));

        return summaries.isBlank() ? "(none yet)" : summaries;
    }

    private String firstLine(String tip) {
        if (tip == null) {
            return "";
        }
        String line = tip.strip().lines().findFirst().orElse("").strip();
        return line.length() > RECENT_TIP_SUMMARY_MAX_LENGTH
                ? line.substring(0, RECENT_TIP_SUMMARY_MAX_LENGTH)
                : line;
    }
}
