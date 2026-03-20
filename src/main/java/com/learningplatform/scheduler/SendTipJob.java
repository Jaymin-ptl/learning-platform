package com.learningplatform.scheduler;

import com.learningplatform.domain.Schedule;
import com.learningplatform.domain.TipLog;
import com.learningplatform.repository.ScheduleRepository;
import com.learningplatform.service.TipGeneratorService;
import com.learningplatform.service.TipLogService;
import com.learningplatform.service.TipResult;
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

    private final ScheduleRepository scheduleRepository;
    private final TipGeneratorService tipGeneratorService;
    private final TeamsNotificationService teamsNotificationService;
    private final TipLogService tipLogService;

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        JobDataMap data = context.getMergedJobDataMap();
        Long scheduleId = data.getLong(SCHEDULE_ID_KEY);
        String triggeredBy = data.getString(TRIGGERED_BY_KEY);
        if (triggeredBy == null) triggeredBy = "SCHEDULER";

        log.info("Executing SendTipJob for scheduleId={}, triggeredBy={}", scheduleId, triggeredBy);

        Schedule schedule = scheduleRepository.findByIdFetchTopicAndChannel(scheduleId).orElse(null);
        if (schedule == null || !schedule.isActive()) {
            log.warn("Schedule {} not found or inactive — skipping", scheduleId);
            return;
        }

        TipResult tipResult = null;
        try {
            tipResult = tipGeneratorService.generateTip(schedule.getTopic());
            teamsNotificationService.sendTip(schedule.getChannel(), schedule.getTopic(), tipResult.content());

            tipLogService.save(schedule, schedule.getTopic(), schedule.getChannel(),
                    tipResult.content(), TipLog.Status.SENT, null, triggeredBy, tipResult);

            log.info("Tip sent successfully for schedule '{}'", schedule.getName());
        } catch (Exception ex) {
            log.error("Failed to send tip for schedule '{}': {}", schedule.getName(), ex.getMessage(), ex);
            tipLogService.save(schedule, schedule.getTopic(), schedule.getChannel(),
                    tipResult != null ? tipResult.content() : "Generation failed",
                    TipLog.Status.FAILED, ex.getMessage(), triggeredBy, tipResult);
        }
    }
}
