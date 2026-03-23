package com.learningplatform.controller;

import com.learningplatform.domain.TipLog;
import com.learningplatform.dto.response.ApiResponse;
import com.learningplatform.dto.response.TipLogResponse;
import com.learningplatform.scheduler.DynamicSchedulerService;
import com.learningplatform.service.TipGeneratorService;
import com.learningplatform.service.TipResult;
import com.learningplatform.service.TipLogService;
import com.learningplatform.service.TopicService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tips")
@RequiredArgsConstructor
@Tag(name = "Tips", description = "Tip history, preview and manual trigger")
@SecurityRequirement(name = "bearerAuth")
public class TipController {

    private final TipLogService tipLogService;
    private final TipGeneratorService tipGeneratorService;
    private final TopicService topicService;
    private final DynamicSchedulerService dynamicSchedulerService;

    @GetMapping("/logs")
    @Operation(summary = "Paginated tip history")
    public ResponseEntity<ApiResponse<Page<TipLogResponse>>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) Long scheduleId,
            @RequestParam(required = false) TipLog.Status status) {

        Pageable pageable = PageRequest.of(page, size);
        Page<TipLogResponse> result;

        if (topicId != null) {
            result = tipLogService.findByTopicId(topicId, pageable);
        } else if (scheduleId != null) {
            result = tipLogService.findByScheduleId(scheduleId, pageable);
        } else if (status != null) {
            result = tipLogService.findByStatus(status, pageable);
        } else {
            result = tipLogService.findAll(pageable);
        }

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/preview/{topicId}")
    @Operation(summary = "Generate a tip preview for a topic (AI call only, no Teams send)")
    public ResponseEntity<ApiResponse<String>> preview(@PathVariable Long topicId) {
        var topic = topicService.getOrThrow(topicId);
        TipResult result = tipGeneratorService.generateTip(topic);
        return ResponseEntity.ok(ApiResponse.ok("Preview generated", result.content()));
    }

    @PostMapping("/send-now/{scheduleId}")
    @Operation(summary = "Manually trigger a tip send for a schedule")
    public ResponseEntity<ApiResponse<Void>> sendNow(@PathVariable Long scheduleId) {
        dynamicSchedulerService.triggerNow(scheduleId);
        return ResponseEntity.ok(ApiResponse.ok("Tip send triggered successfully", null));
    }
}
