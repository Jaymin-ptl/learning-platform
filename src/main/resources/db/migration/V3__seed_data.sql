-- ============================================================
-- V3: Seed data — default admin user and sample topics
-- ============================================================

-- Default admin user (password: Admin@1234 — change immediately in prod)
INSERT INTO admin_users (username, email, password, role)
VALUES ('admin', 'admin@company.com',
        '$2y$12$TbC4aLPc8oJ3KoxsvGHMpuPebEHfcS2XEA9A1/bNhRaCVeS/ZJ1xq',
        'ADMIN');

-- Sample topics
INSERT INTO topics (name, description, difficulty, tags) VALUES
('Docker Fundamentals',
 'Core Docker concepts: containers, images, Dockerfile, volumes, networks and docker-compose.',
 'BEGINNER', 'docker,containers,devops,infrastructure'),

('Kubernetes Essentials',
 'Kubernetes architecture, pods, deployments, services, ConfigMaps and Helm basics.',
 'INTERMEDIATE', 'kubernetes,k8s,devops,orchestration'),

('Spring Boot Best Practices',
 'Practical Spring Boot tips: configuration, dependency injection, caching, security and testing.',
 'INTERMEDIATE', 'java,spring,spring-boot,backend'),

('Git Advanced Techniques',
 'Advanced Git: rebasing, cherry-pick, bisect, hooks, worktrees and monorepo strategies.',
 'INTERMEDIATE', 'git,version-control,devops'),

('SQL Performance Tuning',
 'Query optimization, index strategies, execution plans and common performance anti-patterns.',
 'ADVANCED', 'sql,postgresql,database,performance'),

('REST API Design',
 'RESTful principles, versioning, pagination, error handling, HATEOAS and OpenAPI documentation.',
 'BEGINNER', 'api,rest,http,backend'),

('CI/CD Pipelines',
 'Building robust pipelines with GitHub Actions, Jenkins or GitLab CI: stages, caching and deployment strategies.',
 'INTERMEDIATE', 'ci-cd,devops,automation,github-actions'),

('Clean Code Principles',
 'SOLID principles, DRY, KISS, naming conventions, code smells and refactoring patterns.',
 'BEGINNER', 'clean-code,architecture,best-practices');
