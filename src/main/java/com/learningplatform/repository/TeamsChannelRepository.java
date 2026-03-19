package com.learningplatform.repository;

import com.learningplatform.domain.TeamsChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamsChannelRepository extends JpaRepository<TeamsChannel, Long> {

    List<TeamsChannel> findAllByActiveTrue();

    boolean existsByName(String name);

    /**
     * Directly updates webhook_url for all channels whose URL starts with the placeholder prefix.
     * Avoids detached-entity issues by not loading entities at all.
     */
    @Modifying
    @Query("UPDATE TeamsChannel c SET c.webhookUrl = :newUrl WHERE c.webhookUrl LIKE :placeholderPrefix%")
    int updatePlaceholderWebhookUrls(@Param("newUrl") String newUrl, @Param("placeholderPrefix") String placeholderPrefix);
}
