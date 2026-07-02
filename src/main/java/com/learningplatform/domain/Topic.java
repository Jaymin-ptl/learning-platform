package com.learningplatform.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "topics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Difficulty difficulty;

    @Column(length = 500)
    private String tags;

    /**
     * Optional per-topic AI prompt template. When set, it overrides the global
     * default from app.ai.tip-prompt-template so each topic can define its own
     * message format (code puzzle vs news brief vs keyword explainer).
     * Supports placeholders: {topic}, {description}, {difficulty}, {tags},
     * {current_date}, {recent_tips}.
     */
    @Column(name = "prompt_template", columnDefinition = "TEXT")
    private String promptTemplate;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "topic", fetch = FetchType.LAZY)
    private List<Schedule> schedules;

    public enum Difficulty {
        BEGINNER, INTERMEDIATE, ADVANCED
    }
}
