package com.learningplatform.controller;

import com.learningplatform.dto.request.ScheduleRequest;
import com.learningplatform.dto.response.ApiResponse;
import com.learningplatform.dto.response.ScheduleResponse;
import com.learningplatform.service.ScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
@Tag(name = "Schedules", description = "Manage tip delivery schedules")
@SecurityRequirement(name = "bearerAuth")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping
    @Operation(summary = "List all schedules")
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> findAll() {
        return ResponseEntity.ok(ApiResponse.ok(scheduleService.findAll()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get schedule by ID")
    public ResponseEntity<ApiResponse<ScheduleResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(scheduleService.findById(id)));
    }

    @PostMapping
    @Operation(summary = "Create a new schedule")
    public ResponseEntity<ApiResponse<ScheduleResponse>> create(@Valid @RequestBody ScheduleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Schedule created successfully", scheduleService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a schedule (re-registers Quartz job)")
    public ResponseEntity<ApiResponse<ScheduleResponse>> update(@PathVariable Long id,
                                                                 @Valid @RequestBody ScheduleRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Schedule updated successfully", scheduleService.update(id, request)));
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Enable or disable a schedule")
    public ResponseEntity<ApiResponse<ScheduleResponse>> toggle(@PathVariable Long id) {
        ScheduleResponse response = scheduleService.toggle(id);
        String msg = response.isActive() ? "Schedule activated" : "Schedule deactivated";
        return ResponseEntity.ok(ApiResponse.ok(msg, response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a schedule and remove its Quartz job")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        scheduleService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Schedule deleted successfully", null));
    }
}
