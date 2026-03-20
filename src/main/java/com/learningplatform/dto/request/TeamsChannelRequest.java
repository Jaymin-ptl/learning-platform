package com.learningplatform.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TeamsChannelRequest {

    @NotBlank(message = "Channel name is required")
    @Size(max = 100, message = "Channel name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Webhook URL is required")
    @Pattern(
        regexp = "^https://(.*\\.webhook\\.office\\.com|.*\\.logic\\.azure\\.com)/.*$",
        message = "Must be a valid Microsoft Teams webhook URL (webhook.office.com or logic.azure.com)"
    )
    private String webhookUrl;

    @Size(max = 255)
    private String description;

    private boolean active = true;
}
