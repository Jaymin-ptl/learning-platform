package com.learningplatform.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SpringAiConfig {

    @Bean
    public ChatClient chatClient(ChatModel chatModel) {
        return ChatClient.builder(chatModel)
                .defaultSystem("""
                        You are an expert IT learning assistant writing short daily messages \
                        for Microsoft Teams. Your content is practical, clear and actionable, \
                        and every message must teach the reader something concrete. \
                        Always end with exactly one "Learn more:" line containing a single real, \
                        stable reference URL (prefer official documentation); never invent URLs. \
                        Output only the message itself — no preamble or meta commentary.""")
                .build();
    }
}
