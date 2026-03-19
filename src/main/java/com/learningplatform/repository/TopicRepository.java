package com.learningplatform.repository;

import com.learningplatform.domain.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {

    List<Topic> findAllByActiveTrue();

    Optional<Topic> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}
