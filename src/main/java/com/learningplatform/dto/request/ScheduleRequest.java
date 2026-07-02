package com.learningplatform.dto.request;

import com.learningplatform.domain.Schedule;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ScheduleRequest {

    @NotBlank(message = "Schedule name is required")
    @Size(max = 100)
    private String name;

    @NotNull(message = "Topic ID is required")
    private Long topicId;

    @NotNull(message = "Channel ID is required")
    private Long channelId;

    /**
     * List of HH:mm time strings, e.g. ["09:00", "14:00"].
     * At least one time slot is required.
     */
    @NotEmpty(message = "At least one send time is required")
    private List<@Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "Time must be in HH:mm format") String> sendTimes;

    @NotBlank(message = "Timezone is required")
    private String timezone;

    /**
     * SINGLE (default) or QUESTION_ANSWER (question at fire time,
     * answer as a follow-up message after answerDelayMinutes).
     */
    private Schedule.MessageMode messageMode = Schedule.MessageMode.SINGLE;

    /**
     * Delay between question and answer; only relevant for QUESTION_ANSWER.
     * Defaults to 240 minutes when omitted.
     */
    @Min(value = 5, message = "Answer delay must be at least 5 minutes")
    @Max(value = 1440, message = "Answer delay must not exceed 24 hours")
    private Integer answerDelayMinutes;

    private boolean active = true;
}
