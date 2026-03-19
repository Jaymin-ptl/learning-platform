package com.learningplatform.controller;

import com.learningplatform.dto.request.TopicRequest;
import com.learningplatform.dto.response.ApiResponse;
import com.learningplatform.dto.response.TopicResponse;
import com.learningplatform.service.TopicService;
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
@RequestMapping("/api/topics")
@RequiredArgsConstructor
@Tag(name = "Topics", description = "Manage learning topics")
@SecurityRequirement(name = "bearerAuth")
public class TopicController {

    private final TopicService topicService;

    @GetMapping
    @Operation(summary = "List all topics")
    public ResponseEntity<ApiResponse<List<TopicResponse>>> findAll(
            @RequestParam(defaultValue = "false") boolean activeOnly) {
        List<TopicResponse> topics = activeOnly
                ? topicService.findAllActive()
                : topicService.findAll();
        return ResponseEntity.ok(ApiResponse.ok(topics));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get topic by ID")
    public ResponseEntity<ApiResponse<TopicResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(topicService.findById(id)));
    }

    @PostMapping
    @Operation(summary = "Create a new topic")
    public ResponseEntity<ApiResponse<TopicResponse>> create(@Valid @RequestBody TopicRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Topic created successfully", topicService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a topic")
    public ResponseEntity<ApiResponse<TopicResponse>> update(@PathVariable Long id,
                                                              @Valid @RequestBody TopicRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Topic updated successfully", topicService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-delete a topic")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        topicService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Topic deactivated successfully", null));
    }
}
