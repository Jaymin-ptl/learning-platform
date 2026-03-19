package com.learningplatform.controller;

import com.learningplatform.dto.request.TeamsChannelRequest;
import com.learningplatform.dto.response.ApiResponse;
import com.learningplatform.dto.response.TeamsChannelResponse;
import com.learningplatform.service.TeamsChannelService;
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
@RequestMapping("/api/channels")
@RequiredArgsConstructor
@Tag(name = "Teams Channels", description = "Manage Microsoft Teams channels")
@SecurityRequirement(name = "bearerAuth")
public class TeamsChannelController {

    private final TeamsChannelService channelService;

    @GetMapping
    @Operation(summary = "List all Teams channels")
    public ResponseEntity<ApiResponse<List<TeamsChannelResponse>>> findAll(
            @RequestParam(defaultValue = "false") boolean activeOnly) {
        List<TeamsChannelResponse> channels = activeOnly
                ? channelService.findAllActive()
                : channelService.findAll();
        return ResponseEntity.ok(ApiResponse.ok(channels));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get channel by ID")
    public ResponseEntity<ApiResponse<TeamsChannelResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(channelService.findById(id)));
    }

    @PostMapping
    @Operation(summary = "Register a new Teams channel")
    public ResponseEntity<ApiResponse<TeamsChannelResponse>> create(@Valid @RequestBody TeamsChannelRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Channel registered successfully", channelService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a Teams channel")
    public ResponseEntity<ApiResponse<TeamsChannelResponse>> update(@PathVariable Long id,
                                                                     @Valid @RequestBody TeamsChannelRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Channel updated successfully", channelService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-delete a Teams channel")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        channelService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Channel deactivated successfully", null));
    }
}
