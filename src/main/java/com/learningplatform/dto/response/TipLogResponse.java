package com.learningplatform.dto.response;

import com.learningplatform.domain.TipLog.Status;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class TipLogResponse {
    private Long id;
    private Long scheduleId;
    private String scheduleName;
    private Long topicId;
    private String topicName;
    private Long channelId;
    private String channelName;
    private String generatedTip;
    private Status status;
    private String errorMessage;
    private String triggeredBy;
    private OffsetDateTime createdAt;
}
