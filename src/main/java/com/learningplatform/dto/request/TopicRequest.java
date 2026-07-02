package com.learningplatform.dto.request;

import com.learningplatform.domain.Topic.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TopicRequest {

    @NotBlank(message = "Topic name is required")
    @Size(max = 100, message = "Topic name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Difficulty is required")
    private Difficulty difficulty;

    @Size(max = 500, message = "Tags must not exceed 500 characters")
    private String tags;

    /**
     * Optional per-topic AI prompt template overriding the global default.
     */
    private String promptTemplate;

    private boolean active = true;
}
