package com.learningplatform.service;

import com.learningplatform.config.AppProperties;
import com.learningplatform.domain.Topic;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class TipGeneratorService {

    private final ChatClient chatClient;
    private final AppProperties appProperties;

    /**
     * Generates an AI tip for the given topic using the configured prompt template.
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
        return appProperties.getAi().getTipPromptTemplate()
                .replace("{topic}", topic.getName())
                .replace("{description}", topic.getDescription())
                .replace("{difficulty}", topic.getDifficulty().name())
                .replace("{tags}", topic.getTags() != null ? topic.getTags() : "");
    }
}
