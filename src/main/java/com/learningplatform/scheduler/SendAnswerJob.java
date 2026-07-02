package com.learningplatform.scheduler;

import com.learningplatform.domain.Schedule;
import com.learningplatform.domain.TipLog;
import com.learningplatform.repository.ScheduleRepository;
import com.learningplatform.service.TeamsNotificationService;
import com.learningplatform.service.TipLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.stereotype.Component;

/**
 * One-shot follow-up job for QUESTION_ANSWER schedules: posts the answer
 * reveal a configurable delay after the question was sent. The answer text
 * travels in the JobDataMap, which Quartz persists in the JDBC job store,
 * so pending answers survive application restarts.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SendAnswerJob implements Job {

    public static final String SCHEDULE_ID_KEY = "scheduleId";
    public static final String ANSWER_CONTENT_KEY = "answerContent";
    public static final String TRIGGERED_BY_ANSWER = "ANSWER_FOLLOWUP";

    private final ScheduleRepository scheduleRepository;
    private final TeamsNotificationService teamsNotificationService;
    private final TipLogService tipLogService;

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        JobDataMap data = context.getMergedJobDataMap();
        Long scheduleId = data.getLong(SCHEDULE_ID_KEY);
        String answerContent = data.getString(ANSWER_CONTENT_KEY);

        log.info("Executing SendAnswerJob for scheduleId={}", scheduleId);

        Schedule schedule = scheduleRepository.findByIdFetchTopicAndChannel(scheduleId).orElse(null);
        if (schedule == null) {
            log.warn("Schedule {} no longer exists — dropping pending answer", scheduleId);
            return;
        }
        if (answerContent == null || answerContent.isBlank()) {
            log.warn("No answer content stored for scheduleId={} — nothing to send", scheduleId);
            return;
        }

        // The question already went out, so the answer is sent even if the
        // schedule was deactivated in the meantime — readers deserve the reveal.
        try {
            teamsNotificationService.sendAnswer(schedule.getChannel(), schedule.getTopic(), answerContent);
            tipLogService.save(schedule, schedule.getTopic(), schedule.getChannel(),
                    answerContent, TipLog.Status.SENT, null, TRIGGERED_BY_ANSWER);
            log.info("Answer reveal sent for schedule '{}'", schedule.getName());
        } catch (Exception ex) {
            log.error("Failed to send answer for schedule '{}': {}", schedule.getName(), ex.getMessage(), ex);
            tipLogService.save(schedule, schedule.getTopic(), schedule.getChannel(),
                    answerContent, TipLog.Status.FAILED, ex.getMessage(), TRIGGERED_BY_ANSWER);
        }
    }
}
