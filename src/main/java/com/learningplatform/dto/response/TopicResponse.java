package com.learningplatform.dto.response;

import com.learningplatform.domain.Topic.Difficulty;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
public class TopicResponse {
    private Long id;
    private String name;
    private String description;
    private Difficulty difficulty;
    private List<String> tags;
    private String customPrompt;
    private boolean active;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
