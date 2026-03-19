package com.learningplatform.service;

import com.learningplatform.domain.Topic;
import com.learningplatform.dto.request.TopicRequest;
import com.learningplatform.dto.response.TopicResponse;
import com.learningplatform.exception.DuplicateResourceException;
import com.learningplatform.exception.ResourceNotFoundException;
import com.learningplatform.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TopicService {

    private final TopicRepository topicRepository;

    @Transactional(readOnly = true)
    public List<TopicResponse> findAll() {
        return topicRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TopicResponse> findAllActive() {
        return topicRepository.findAllByActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TopicResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public TopicResponse create(TopicRequest request) {
        if (topicRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("Topic with name '" + request.getName() + "' already exists");
        }
        Topic topic = Topic.builder()
                .name(request.getName())
                .description(request.getDescription())
                .difficulty(request.getDifficulty())
                .tags(request.getTags())
                .active(request.isActive())
                .build();
        return toResponse(topicRepository.save(topic));
    }

    @Transactional
    public TopicResponse update(Long id, TopicRequest request) {
        Topic topic = getOrThrow(id);
        if (!topic.getName().equalsIgnoreCase(request.getName())
                && topicRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("Topic with name '" + request.getName() + "' already exists");
        }
        topic.setName(request.getName());
        topic.setDescription(request.getDescription());
        topic.setDifficulty(request.getDifficulty());
        topic.setTags(request.getTags());
        topic.setActive(request.isActive());
        return toResponse(topicRepository.save(topic));
    }

    @Transactional
    public void delete(Long id) {
        Topic topic = getOrThrow(id);
        topic.setActive(false);
        topicRepository.save(topic);
        log.info("Topic '{}' soft-deleted", topic.getName());
    }

    public Topic getOrThrow(Long id) {
        return topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", id));
    }

    public TopicResponse toResponse(Topic topic) {
        List<String> tagList = (topic.getTags() != null && !topic.getTags().isBlank())
                ? Arrays.asList(topic.getTags().split(","))
                : List.of();
        return TopicResponse.builder()
                .id(topic.getId())
                .name(topic.getName())
                .description(topic.getDescription())
                .difficulty(topic.getDifficulty())
                .tags(tagList)
                .active(topic.isActive())
                .createdAt(topic.getCreatedAt())
                .updatedAt(topic.getUpdatedAt())
                .build();
    }
}
