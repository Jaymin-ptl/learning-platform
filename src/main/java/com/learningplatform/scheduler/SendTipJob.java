package com.learningplatform.scheduler;

import com.learningplatform.domain.Schedule;
import com.learningplatform.domain.TipLog;
import com.learningplatform.repository.ScheduleRepository;
import com.learningplatform.service.TipGeneratorService;
import com.learningplatform.service.TipLogService;
import com.learningplatform.service.TeamsNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SendTipJob implements Job {

    public static final String SCHEDULE_ID_KEY = "scheduleId";
    public static final String TRIGGERED_BY_KEY = "triggeredBy";

    /** Line that separates question from answer in QUESTION_ANSWER content. */
    public static final String ANSWER_DELIMITER = "===ANSWER===";
    private static final String ANSWER_DELIMITER_REGEX = "(?m)^\\s*===ANSWER===\\s*$";
    private static final int DEFAULT_ANSWER_DELAY_MINUTES = 240;

    private final ScheduleRepository scheduleRepository;
    private final TipGeneratorService tipGeneratorService;
    private final TeamsNotificationService teamsNotificationService;
    private final TipLogService tipLogService;
    private final DynamicSchedulerService dynamicSchedulerService;

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        JobDataMap data = context.getMergedJobDataMap();
        Long scheduleId = data.getLong(SCHEDULE_ID_KEY);
        String triggeredBy = data.getString(TRIGGERED_BY_KEY);
        if (triggeredBy == null) triggeredBy = "SCHEDULER";

        log.info("Executing SendTipJob for scheduleId={}, triggeredBy={}", scheduleId, triggeredBy);

        // Fetch-join topic + channel: they are LAZY and accessed outside a Hibernate session
        Schedule schedule = scheduleRepository.findByIdFetchTopicAndChannel(scheduleId).orElse(null);
        if (schedule == null || !schedule.isActive()) {
            log.warn("Schedule {} not found or inactive — skipping", scheduleId);
            return;
        }

        String generatedTip = null;
        try {
            generatedTip = tipGeneratorService.generateTip(schedule.getTopic());

            if (schedule.getMessageMode() == Schedule.MessageMode.QUESTION_ANSWER) {
                sendQuestionThenQueueAnswer(schedule, generatedTip);
            } else {
                teamsNotificationService.sendTip(schedule.getChannel(), schedule.getTopic(), generatedTip);
            }

            tipLogService.save(schedule, schedule.getTopic(), schedule.getChannel(),
                    generatedTip, TipLog.Status.SENT, null, triggeredBy);

            log.info("Tip sent successfully for schedule '{}'", schedule.getName());
        } catch (Exception ex) {
            log.error("Failed to send tip for schedule '{}': {}", schedule.getName(), ex.getMessage(), ex);
            tipLogService.save(schedule, schedule.getTopic(), schedule.getChannel(),
                    generatedTip != null ? generatedTip : "Generation failed",
                    TipLog.Status.FAILED, ex.getMessage(), triggeredBy);
        }
    }

    /**
     * Two-part flow: sends the question part immediately and queues a one-shot
     * Quartz job that reveals the answer after the schedule's configured delay.
     * If the model did not emit the delimiter, degrades to a single message.
     */
    private void sendQuestionThenQueueAnswer(Schedule schedule, String generatedTip) {
        String[] parts = generatedTip.split(ANSWER_DELIMITER_REGEX, 2);

        if (parts.length < 2 || parts[1].isBlank()) {
            log.warn("Schedule '{}' is QUESTION_ANSWER but generated content has no '{}' delimiter — sending as a single message",
                    schedule.getName(), ANSWER_DELIMITER);
            teamsNotificationService.sendTip(schedule.getChannel(), schedule.getTopic(), generatedTip);
            return;
        }

        String question = parts[0].strip();
        String answer = parts[1].strip();
        int delayMinutes = schedule.getAnswerDelayMinutes() != null
                ? schedule.getAnswerDelayMinutes()
                : DEFAULT_ANSWER_DELAY_MINUTES;

        teamsNotificationService.sendTip(schedule.getChannel(), schedule.getTopic(), question);
        dynamicSchedulerService.scheduleAnswerJob(schedule.getId(), answer, delayMinutes);
    }
}
