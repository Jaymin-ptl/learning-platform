package com.learningplatform.service;

/**
 * Carries the AI-generated tip content together with request/response metadata.
 */
public record TipResult(
        String content,
        String promptUsed,
        String modelUsed,
        Integer promptTokens,
        Integer completionTokens,
        Integer totalTokens
) {}
