package com.learningplatform.service;

import com.learningplatform.domain.Schedule;
import com.learningplatform.domain.TeamsChannel;
import com.learningplatform.domain.Topic;
import com.learningplatform.dto.request.ScheduleRequest;
import com.learningplatform.dto.response.ScheduleResponse;
import com.learningplatform.exception.ResourceNotFoundException;
import com.learningplatform.repository.ScheduleRepository;
import com.learningplatform.scheduler.DynamicSchedulerService;
import com.learningplatform.util.CronExpressionBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final TopicService topicService;
    private final TeamsChannelService channelService;
    private final CronExpressionBuilder cronBuilder;
    private final DynamicSchedulerService dynamicSchedulerService;

    @Transactional(readOnly = true)
    public List<ScheduleResponse> findAll() {
        return scheduleRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ScheduleResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public ScheduleResponse create(ScheduleRequest request) {
        Topic topic = topicService.getOrThrow(request.getTopicId());
        TeamsChannel channel = channelService.getOrThrow(request.getChannelId());

        String cronExpression = cronBuilder.build(request.getSendTimes());
        String sendTimesStored = cronBuilder.toStoredString(request.getSendTimes());

        Schedule schedule = Schedule.builder()
                .name(request.getName())
                .topic(topic)
                .channel(channel)
                .sendTimes(sendTimesStored)
                .cronExpression(cronExpression)
                .timezone(request.getTimezone())
                .messageMode(request.getMessageMode() != null
                        ? request.getMessageMode() : Schedule.MessageMode.SINGLE)
                .answerDelayMinutes(request.getAnswerDelayMinutes())
                .active(request.isActive())
                .build();

        schedule = scheduleRepository.save(schedule);

        if (schedule.isActive()) {
            dynamicSchedulerService.scheduleJob(schedule);
        }

        log.info("Schedule '{}' created with cron '{}'", schedule.getName(), cronExpression);
        return toResponse(schedule);
    }

    @Transactional
    public ScheduleResponse update(Long id, ScheduleRequest request) {
        Schedule schedule = getOrThrow(id);
        Topic topic = topicService.getOrThrow(request.getTopicId());
        TeamsChannel channel = channelService.getOrThrow(request.getChannelId());

        String cronExpression = cronBuilder.build(request.getSendTimes());

        schedule.setName(request.getName());
        schedule.setTopic(topic);
        schedule.setChannel(channel);
        schedule.setSendTimes(cronBuilder.toStoredString(request.getSendTimes()));
        schedule.setCronExpression(cronExpression);
        schedule.setTimezone(request.getTimezone());
        schedule.setMessageMode(request.getMessageMode() != null
                ? request.getMessageMode() : Schedule.MessageMode.SINGLE);
        schedule.setAnswerDelayMinutes(request.getAnswerDelayMinutes());
        schedule.setActive(request.isActive());

        schedule = scheduleRepository.save(schedule);

        // Re-register Quartz job with updated cron
        dynamicSchedulerService.rescheduleJob(schedule);

        log.info("Schedule '{}' updated with cron '{}'", schedule.getName(), cronExpression);
        return toResponse(schedule);
    }

    @Transactional
    public ScheduleResponse toggle(Long id) {
        Schedule schedule = getOrThrow(id);
        schedule.setActive(!schedule.isActive());
        schedule = scheduleRepository.save(schedule);

        if (schedule.isActive()) {
            dynamicSchedulerService.scheduleJob(schedule);
            log.info("Schedule '{}' activated", schedule.getName());
        } else {
            dynamicSchedulerService.unscheduleJob(schedule.getId());
            log.info("Schedule '{}' deactivated", schedule.getName());
        }

        return toResponse(schedule);
    }

    @Transactional
    public void delete(Long id) {
        Schedule schedule = getOrThrow(id);
        dynamicSchedulerService.unscheduleJob(id);
        scheduleRepository.delete(schedule);
        log.info("Schedule '{}' deleted", schedule.getName());
    }

    public void triggerNow(Long id) {
        // Verify schedule exists and is active before triggering
        Schedule schedule = getOrThrow(id);
        if (!schedule.isActive()) {
            throw new com.learningplatform.exception.SchedulerException("Cannot trigger inactive schedule: " + schedule.getName());
        }
        dynamicSchedulerService.triggerNow(id);
        log.info("Manual trigger requested for schedule '{}'", schedule.getName());
    }

    public Schedule getOrThrow(Long id) {
        return scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule", id));
    }

    public ScheduleResponse toResponse(Schedule schedule) {
        List<String> sendTimes = cronBuilder.parseSendTimes(schedule.getSendTimes());
        return ScheduleResponse.builder()
                .id(schedule.getId())
                .name(schedule.getName())
                .topic(topicService.toResponse(schedule.getTopic()))
                .channel(channelService.toResponse(schedule.getChannel()))
                .sendTimes(sendTimes)
                .cronExpression(schedule.getCronExpression())
                .timezone(schedule.getTimezone())
                .messageMode(schedule.getMessageMode())
                .answerDelayMinutes(schedule.getAnswerDelayMinutes())
                .active(schedule.isActive())
                .createdAt(schedule.getCreatedAt())
                .updatedAt(schedule.getUpdatedAt())
                .build();
    }
}
