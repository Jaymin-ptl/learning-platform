package com.learningplatform.util;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Builds Quartz cron expressions from a list of HH:mm time strings.
 * Example: ["09:00", "14:00"] → "0 0 9,14 * * ?"
 */
@Component
public class CronExpressionBuilder {

    /**
     * @param sendTimes list of HH:mm times, e.g. ["09:00", "14:00"]
     * @return Quartz cron expression string
     */
    public String build(List<String> sendTimes) {
        if (sendTimes == null || sendTimes.isEmpty()) {
            throw new IllegalArgumentException("At least one send time is required");
        }

        String hours = sendTimes.stream()
                .map(t -> String.valueOf(Integer.parseInt(t.split(":")[0])))
                .distinct()
                .sorted()
                .collect(Collectors.joining(","));

        String minutes = sendTimes.stream()
                .map(t -> String.valueOf(Integer.parseInt(t.split(":")[1])))
                .distinct()
                .collect(Collectors.toList())
                .stream()
                .reduce((a, b) -> a.equals(b) ? a : "0")
                .orElse("0");

        // When all times share the same minute, use it; otherwise default to :00
        boolean allSameMinute = sendTimes.stream()
                .map(t -> t.split(":")[1])
                .distinct()
                .count() == 1;

        String minute = allSameMinute
                ? String.valueOf(Integer.parseInt(sendTimes.get(0).split(":")[1]))
                : "0";

        return String.format("0 %s %s * * ?", minute, hours);
    }

    /**
     * Parses stored comma-separated sendTimes string back to a list.
     */
    public List<String> parseSendTimes(String sendTimes) {
        return List.of(sendTimes.split(","));
    }

    /**
     * Converts a list of send times to a comma-separated string for storage.
     */
    public String toStoredString(List<String> sendTimes) {
        return String.join(",", sendTimes);
    }
}
