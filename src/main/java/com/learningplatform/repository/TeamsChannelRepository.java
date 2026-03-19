package com.learningplatform.repository;

import com.learningplatform.domain.TeamsChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamsChannelRepository extends JpaRepository<TeamsChannel, Long> {

    List<TeamsChannel> findAllByActiveTrue();

    boolean existsByName(String name);
}
