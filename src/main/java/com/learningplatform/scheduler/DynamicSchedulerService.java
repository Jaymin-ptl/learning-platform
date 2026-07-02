package com.learningplatform.scheduler;

import com.learningplatform.domain.Schedule;
import com.learningplatform.exception.SchedulerException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.*;
import org.quartz.impl.matchers.GroupMatcher;
import org.springframework.stereotype.Service;

import java.util.TimeZone;

@Service
@RequiredArgsConstructor
@Slf4j
public class DynamicSchedulerService {

    private static final String JOB_GROUP = "TIP_JOBS";
    private static final String TRIGGER_GROUP = "TIP_TRIGGERS";

    private final Scheduler quartzScheduler;
    private final com.learningplatform.repository.ScheduleRepository scheduleRepository;

    /**
     * On startup, load all active schedules from DB and register Quartz jobs.
     */
    @PostConstruct
    public void loadSchedulesOnStartup() {
        log.info("Loading active schedules from DB into Quartz...");
        removeStaleJobs();
        scheduleRepository.findAllActiveFetchTopicAndChannel()
                .forEach(schedule -> {
                    try {
                        scheduleJob(schedule);
                    } catch (Exception ex) {
                        log.error("Failed to load schedule '{}' on startup: {}", schedule.getName(), ex.getMessage());
                    }
                });
        log.info("Quartz schedule loading complete");
    }

    /**
     * Deletes every persisted tip job so the DB schedules table is the single
     * source of truth on startup. Without this, jobs whose schedules were
     * deactivated (e.g. by a migration) would keep firing no-op executions
     * from the JDBC job store forever.
     */
    private void removeStaleJobs() {
        try {
            for (JobKey jobKey : quartzScheduler.getJobKeys(GroupMatcher.jobGroupEquals(JOB_GROUP))) {
                quartzScheduler.deleteJob(jobKey);
            }
        } catch (org.quartz.SchedulerException ex) {
            log.error("Failed to clear stale Quartz tip jobs on startup: {}", ex.getMessage());
        }
    }

    public void scheduleJob(Schedule schedule) {
        try {
            JobKey jobKey = jobKey(schedule.getId());

            // Remove existing job if present (idempotent)
            if (quartzScheduler.checkExists(jobKey)) {
                quartzScheduler.deleteJob(jobKey);
            }

            JobDetail jobDetail = JobBuilder.newJob(SendTipJob.class)
                    .withIdentity(jobKey)
                    .usingJobData(SendTipJob.SCHEDULE_ID_KEY, schedule.getId())
                    .usingJobData(SendTipJob.TRIGGERED_BY_KEY, "SCHEDULER")
                    .storeDurably()
                    .build();

            CronTrigger trigger = TriggerBuilder.newTrigger()
                    .withIdentity(triggerKey(schedule.getId()))
                    .withSchedule(CronScheduleBuilder
                            .cronSchedule(schedule.getCronExpression())
                            .inTimeZone(TimeZone.getTimeZone(schedule.getTimezone()))
                            .withMisfireHandlingInstructionDoNothing())
                    .build();

            quartzScheduler.scheduleJob(jobDetail, trigger);
            log.debug("Quartz job registered for schedule '{}' with cron '{}'",
                    schedule.getName(), schedule.getCronExpression());

        } catch (org.quartz.SchedulerException ex) {
            throw new SchedulerException("Failed to register Quartz job for schedule: " + schedule.getName(), ex);
        }
    }

    public void rescheduleJob(Schedule schedule) {
        if (schedule.isActive()) {
            scheduleJob(schedule);
        } else {
            unscheduleJob(schedule.getId());
        }
    }

    public void unscheduleJob(Long scheduleId) {
        try {
            JobKey jobKey = jobKey(scheduleId);
            if (quartzScheduler.checkExists(jobKey)) {
                quartzScheduler.deleteJob(jobKey);
                log.debug("Quartz job removed for scheduleId={}", scheduleId);
            }
        } catch (org.quartz.SchedulerException ex) {
            throw new SchedulerException("Failed to remove Quartz job for scheduleId: " + scheduleId, ex);
        }
    }

    public void triggerNow(Long scheduleId) {
        try {
            JobKey jobKey = jobKey(scheduleId);
            if (!quartzScheduler.checkExists(jobKey)) {
                throw new SchedulerException("No Quartz job found for scheduleId: " + scheduleId);
            }
            JobDataMap data = new JobDataMap();
            data.put(SendTipJob.TRIGGERED_BY_KEY, "MANUAL");
            quartzScheduler.triggerJob(jobKey, data);
            log.info("Manual trigger fired for scheduleId={}", scheduleId);
        } catch (org.quartz.SchedulerException ex) {
            throw new SchedulerException("Failed to manually trigger job for scheduleId: " + scheduleId, ex);
        }
    }

    private JobKey jobKey(Long scheduleId) {
        return JobKey.jobKey("tip-job-" + scheduleId, JOB_GROUP);
    }

    private TriggerKey triggerKey(Long scheduleId) {
        return TriggerKey.triggerKey("tip-trigger-" + scheduleId, TRIGGER_GROUP);
    }
}
