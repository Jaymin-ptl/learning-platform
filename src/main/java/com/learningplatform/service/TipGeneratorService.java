package com.learningplatform.service;

import com.learningplatform.domain.TipLog;
import com.learningplatform.domain.Topic;
import com.learningplatform.repository.TipLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.metadata.Usage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TipGeneratorService {

    private final ChatClient chatClient;
    private final TipLogRepository tipLogRepository;

    @Value("${spring.ai.openai.chat.options.model:gpt-4o}")
    private String configuredModel;

    public TipResult generateTip(Topic topic) {
        List<String> recentTips = tipLogRepository
                .findRecentTipContentByTopicId(topic.getId(), PageRequest.of(0, 5));

        String recentContext = recentTips.isEmpty() ? "none yet"
                : recentTips.stream()
                        .map(t -> extractFirstLine(t))
                        .collect(Collectors.joining("; "));

        String prompt = buildPrompt(topic, recentContext);
        log.debug("Generating tip for topic '{}', avoiding recent: {}", topic.getName(), recentContext);

        ChatResponse response = chatClient.prompt()
                .user(prompt)
                .call()
                .chatResponse();

        String content = response.getResult().getOutput().getContent();

        String modelUsed = configuredModel;
        Integer promptTokens = null;
        Integer completionTokens = null;
        Integer totalTokens = null;

        try {
            Usage usage = response.getMetadata().getUsage();
            if (usage != null) {
                promptTokens = usage.getPromptTokens() != null ? usage.getPromptTokens().intValue() : null;
                completionTokens = usage.getGenerationTokens() != null ? usage.getGenerationTokens().intValue() : null;
                totalTokens = usage.getTotalTokens() != null ? usage.getTotalTokens().intValue() : null;
            }
        } catch (Exception ex) {
            log.warn("Could not extract AI usage metadata: {}", ex.getMessage());
        }

        log.info("Tip generated for topic '{}' — tokens: prompt={} completion={} total={}",
                topic.getName(), promptTokens, completionTokens, totalTokens);

        return new TipResult(content, prompt, modelUsed, promptTokens, completionTokens, totalTokens);
    }

    private String buildPrompt(Topic topic, String recentSubtopics) {
        return """
                You are an expert IT learning assistant delivering concise, high-value tips to software developers.

                Topic: %s
                Description: %s
                Difficulty: %s
                Tags: %s
                Today's date: %s
                Recently shared subtopics (DO NOT repeat these): %s

                Your task: Pick ONE specific, narrow subtopic within the topic above that a developer can act on TODAY.
                Avoid generic overviews. Be specific and opinionated.

                Format your response EXACTLY like this (keep total under 200 words):

                **Tip**: [One-line title naming the specific subtopic]
                **What**: [1-2 sentences — what this is and why it matters right now]
                **How**:
                - [Step or code snippet 1]
                - [Step or code snippet 2]
                - [Step or code snippet 3]
                **Pro tip**: [One sentence — a gotcha or advanced insight]
                **Learn more**:
                - [Title](URL) — official docs or trusted resource
                - [Title](URL) — optional second link

                Be direct. No fluff. Every word must be useful to a working developer.
                """.formatted(
                topic.getName(),
                topic.getDescription(),
                topic.getDifficulty().name(),
                topic.getTags() != null ? topic.getTags() : "",
                LocalDate.now(),
                recentSubtopics
        );
    }

    private String extractFirstLine(String tip) {
        if (tip == null) return "";
        String firstLine = tip.lines().filter(l -> !l.isBlank()).findFirst().orElse("");
        return firstLine.length() > 80 ? firstLine.substring(0, 80) : firstLine;
    }
}
