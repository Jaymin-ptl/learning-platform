package com.learningplatform.service;

import com.learningplatform.domain.TeamsChannel;
import com.learningplatform.dto.request.TeamsChannelRequest;
import com.learningplatform.dto.response.TeamsChannelResponse;
import com.learningplatform.exception.DuplicateResourceException;
import com.learningplatform.exception.ResourceNotFoundException;
import com.learningplatform.repository.TeamsChannelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeamsChannelService {

    private final TeamsChannelRepository channelRepository;

    @Transactional(readOnly = true)
    public List<TeamsChannelResponse> findAll() {
        return channelRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TeamsChannelResponse> findAllActive() {
        return channelRepository.findAllByActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TeamsChannelResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public TeamsChannelResponse create(TeamsChannelRequest request) {
        if (channelRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Channel with name '" + request.getName() + "' already exists");
        }
        TeamsChannel channel = TeamsChannel.builder()
                .name(request.getName())
                .webhookUrl(request.getWebhookUrl())
                .description(request.getDescription())
                .active(request.isActive())
                .build();
        return toResponse(channelRepository.save(channel));
    }

    @Transactional
    public TeamsChannelResponse update(Long id, TeamsChannelRequest request) {
        TeamsChannel channel = getOrThrow(id);
        channel.setName(request.getName());
        channel.setWebhookUrl(request.getWebhookUrl());
        channel.setDescription(request.getDescription());
        channel.setActive(request.isActive());
        return toResponse(channelRepository.save(channel));
    }

    @Transactional
    public void delete(Long id) {
        TeamsChannel channel = getOrThrow(id);
        channel.setActive(false);
        channelRepository.save(channel);
        log.info("Channel '{}' soft-deleted", channel.getName());
    }

    public TeamsChannel getOrThrow(Long id) {
        return channelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TeamsChannel", id));
    }

    public TeamsChannelResponse toResponse(TeamsChannel channel) {
        return TeamsChannelResponse.builder()
                .id(channel.getId())
                .name(channel.getName())
                .webhookUrl(channel.getWebhookUrl())
                .description(channel.getDescription())
                .active(channel.isActive())
                .createdAt(channel.getCreatedAt())
                .updatedAt(channel.getUpdatedAt())
                .build();
    }
}
