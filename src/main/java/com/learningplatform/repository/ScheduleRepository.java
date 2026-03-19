package com.learningplatform.repository;

import com.learningplatform.domain.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findAllByActiveTrue();

    @Query("SELECT s FROM Schedule s JOIN FETCH s.topic JOIN FETCH s.channel WHERE s.active = true")
    List<Schedule> findAllActiveFetchTopicAndChannel();

    List<Schedule> findAllByTopicId(Long topicId);

    List<Schedule> findAllByChannelId(Long channelId);
}
