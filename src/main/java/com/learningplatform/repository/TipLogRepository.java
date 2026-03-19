package com.learningplatform.repository;

import com.learningplatform.domain.TipLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TipLogRepository extends JpaRepository<TipLog, Long> {

    Page<TipLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<TipLog> findAllByTopicIdOrderByCreatedAtDesc(Long topicId, Pageable pageable);

    Page<TipLog> findAllByScheduleIdOrderByCreatedAtDesc(Long scheduleId, Pageable pageable);

    Page<TipLog> findAllByStatusOrderByCreatedAtDesc(TipLog.Status status, Pageable pageable);

    @Query("SELECT COUNT(t) FROM TipLog t WHERE t.status = :status")
    long countByStatus(@Param("status") TipLog.Status status);
}
