package com.learningplatform.service;

import com.learningplatform.domain.Schedule;
import com.learningplatform.domain.TeamsChannel;
import com.learningplatform.domain.TipLog;
import com.learningplatform.domain.Topic;
import com.learningplatform.dto.response.TipLogResponse;
import com.learningplatform.repository.TipLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TipLogService {

    private final TipLogRepository tipLogRepository;

    @Transactional
    public TipLog save(Schedule schedule, Topic topic, TeamsChannel channel,
                       String generatedTip, TipLog.Status status,
                       String errorMessage, String triggeredBy) {
        TipLog log = TipLog.builder()
                .schedule(schedule)
                .topic(topic)
                .channel(channel)
                .generatedTip(generatedTip)
                .status(status)
                .errorMessage(errorMessage)
                .triggeredBy(triggeredBy)
                .build();
        return tipLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public Page<TipLogResponse> findAll(Pageable pageable) {
        return tipLogRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<TipLogResponse> findByTopicId(Long topicId, Pageable pageable) {
        return tipLogRepository.findAllByTopicIdOrderByCreatedAtDesc(topicId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<TipLogResponse> findByScheduleId(Long scheduleId, Pageable pageable) {
        return tipLogRepository.findAllByScheduleIdOrderByCreatedAtDesc(scheduleId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<TipLogResponse> findByStatus(TipLog.Status status, Pageable pageable) {
        return tipLogRepository.findAllByStatusOrderByCreatedAtDesc(status, pageable).map(this::toResponse);
    }

    public TipLogResponse toResponse(TipLog tipLog) {
        return TipLogResponse.builder()
                .id(tipLog.getId())
                .scheduleId(tipLog.getSchedule().getId())
                .scheduleName(tipLog.getSchedule().getName())
                .topicId(tipLog.getTopic().getId())
                .topicName(tipLog.getTopic().getName())
                .channelId(tipLog.getChannel().getId())
                .channelName(tipLog.getChannel().getName())
                .generatedTip(tipLog.getGeneratedTip())
                .status(tipLog.getStatus())
                .errorMessage(tipLog.getErrorMessage())
                .triggeredBy(tipLog.getTriggeredBy())
                .createdAt(tipLog.getCreatedAt())
                .build();
    }
}
