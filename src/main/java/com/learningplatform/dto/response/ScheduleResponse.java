package com.learningplatform.dto.response;

import com.learningplatform.domain.Schedule;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
public class ScheduleResponse {
    private Long id;
    private String name;
    private TopicResponse topic;
    private TeamsChannelResponse channel;
    private List<String> sendTimes;
    private String cronExpression;
    private String timezone;
    private Schedule.MessageMode messageMode;
    private Integer answerDelayMinutes;
    private boolean active;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
