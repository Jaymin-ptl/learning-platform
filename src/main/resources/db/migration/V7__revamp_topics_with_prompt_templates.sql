-- ============================================================
-- V7: Revamp topics — per-topic AI prompt templates
--
-- 1. Adds topics.prompt_template so each topic controls the
--    format of its generated message (puzzle vs news vs explainer).
-- 2. Retires all previously seeded topics and schedules
--    (soft-deactivate: tip_logs keep valid FK references).
-- 3. Seeds the new content lineup:
--       - Java Code Puzzle        (read code, guess the result)
--       - Java Upgrade News       (stay current on the JDK/Spring)
--       - AI Productivity News    (AI tools for developer output)
--       - Docker Keywords         (one keyword per message)
--       - Angular Bites           (one small Angular topic)
--    plus fintech-focused extras (Java + Angular + AI + Docker shop):
--       - Secure Coding for Fintech
--       - Fintech Engineering Concepts
--       - Spring Boot for Microservices
--       - SQL and Transactions Deep Dive
-- 4. Seeds staggered weekday schedules on the Daily Learning channel.
--
-- Placeholders available in prompt_template (resolved at runtime):
--   {topic} {description} {difficulty} {tags} {current_date} {recent_tips}
-- ============================================================

ALTER TABLE topics ADD COLUMN prompt_template TEXT NULL;

-- ------------------------------------------------------------
-- Retire the old lineup
-- ------------------------------------------------------------
UPDATE schedules SET active = 0;
UPDATE topics    SET active = 0;

-- ------------------------------------------------------------
-- Core topic 1: Java Code Puzzle
-- ------------------------------------------------------------
INSERT INTO topics (name, description, difficulty, tags, active, prompt_template)
VALUES (
'Java Code Puzzle',
'Daily code-reading challenge: a short Java snippet where the reader must predict the output, a compilation error, or a runtime error.',
'INTERMEDIATE',
'java,puzzle,code-reading,interview-prep',
1,
'You are creating a daily Java code-reading challenge for professional developers at a fintech company.

Write ONE short, self-contained Java snippet (5 to 15 lines) that tests a subtle but practical concept. Rotate across areas such as: autoboxing and integer caching, string interning and immutability, overloading vs overriding, static and instance initializer order, exceptions in try/finally, checked vs unchecked exceptions, streams laziness, BigDecimal equals vs compareTo, equals and hashCode contracts, generics and type erasure, switch expressions, records, var inference, and basic concurrency pitfalls.

Format the message exactly like this:
🧩 **Java Puzzle of the Day**

[the snippet in a fenced java code block]

**Question**: What is the result of running this code?
A) [option]
B) [option]
C) Compilation error
D) Runtime exception

🤔 Think about it before scrolling...

---

**Answer**: [correct option letter and value]
**Why**: [2 to 4 sentences explaining the underlying concept clearly]

Rules:
- The snippet must be valid to paste into a single file (assume needed imports).
- Exactly one option is correct; the wrong options must be plausible.
- Keep the whole message under 300 words. Use simple markdown only (bold, fenced code, bullet lists).
- End with exactly one line: Learn more: <URL> — a real, stable page from docs.oracle.com, dev.java, openjdk.org, or baeldung.com relevant to the concept. Never invent URLs.

Today is {current_date}. Do not reuse a concept from these recently sent puzzles:
{recent_tips}'
);

-- ------------------------------------------------------------
-- Core topic 2: Java Upgrade News
-- ------------------------------------------------------------
INSERT INTO topics (name, description, difficulty, tags, active, prompt_template)
VALUES (
'Java Upgrade News',
'Helps Java developers modernize: features, JEPs and ecosystem changes from recent Java and Spring releases, with migration guidance.',
'INTERMEDIATE',
'java,jdk,spring,upgrade,modernization',
1,
'You are helping Java developers at a fintech company stay current and upgrade their skills and codebases.

Pick ONE concrete item from the modern Java ecosystem that you are confident about: a language feature or JEP from Java 17 up to the newest release you know, a Spring Boot 3.x / Spring Framework 6.x change, virtual threads, GraalVM native image, a deprecation or removal developers must plan for, or a build-tool improvement (Maven/Gradle).

Format:
📰 **Java Upgrade Brief**
**What**: [the feature or change, one sentence]
**Why it matters**: [the practical benefit or risk, 2 to 3 sentences]
**Before / After**: [a tiny code or config comparison in a fenced code block, if applicable]
**Migration hint**: [one actionable step to adopt it in an existing codebase]

Rules:
- Only describe releases and features you are certain exist; if unsure about the very latest version, cover a solid recent feature instead of guessing.
- Keep it under 300 words. Simple markdown only.
- End with exactly one line: Learn more: <URL> — a real page from openjdk.org (JEP index), dev.java, docs.spring.io, or the spring.io blog. Never invent URLs.

Today is {current_date}. Do not repeat these recently covered items:
{recent_tips}'
);

-- ------------------------------------------------------------
-- Core topic 3: AI Productivity News
-- ------------------------------------------------------------
INSERT INTO topics (name, description, difficulty, tags, active, prompt_template)
VALUES (
'AI Productivity News',
'Practical ways developers can use AI tools and techniques to ship better software faster.',
'BEGINNER',
'ai,llm,productivity,tooling,copilot',
1,
'You are helping software developers at a fintech company use AI to become more productive.

Pick ONE concrete, practical item: an AI coding-assistant technique (better prompting, test generation, code review, refactoring, documentation), a category of AI tooling worth evaluating, a way to integrate LLM APIs into the dev workflow, or a proven practice for working effectively with AI on real codebases.

Format:
🤖 **AI Productivity Tip**
**The idea**: [one sentence]
**How to apply it**: [a short, step-by-step workflow or a concrete example prompt in a fenced code block]
**Watch out for**: [one honest limitation or pitfall, e.g. hallucination, security of pasted code, over-reliance]

Rules:
- Be tool-agnostic where possible; when naming tools, only name well-established ones you are sure exist.
- Keep it under 250 words. Simple markdown only.
- End with exactly one line: Learn more: <URL> — a real, stable page (official tool docs, anthropic.com, github.blog, martinfowler.com or similar reputable source). Never invent URLs.

Today is {current_date}. Do not repeat these recently covered items:
{recent_tips}'
);

-- ------------------------------------------------------------
-- Core topic 4: Docker Keywords
-- ------------------------------------------------------------
INSERT INTO topics (name, description, difficulty, tags, active, prompt_template)
VALUES (
'Docker Keywords',
'One Docker keyword or concept per message: Dockerfile instructions, images, layers, volumes, networks and compose.',
'BEGINNER',
'docker,containers,devops,dockerfile',
1,
'You are teaching Docker to developers one keyword at a time.

Pick ONE Docker keyword or concept. Rotate across: Dockerfile instructions (FROM, RUN, CMD vs ENTRYPOINT, COPY vs ADD, WORKDIR, ENV vs ARG, EXPOSE, HEALTHCHECK, USER, .dockerignore), and core concepts (image layers and caching, multi-stage builds, volumes vs bind mounts, networks, tags and digests, docker compose basics, resource limits).

Format:
🐳 **Docker Keyword of the Day: `KEYWORD`**
**What it does**: [1 to 2 plain-language sentences]
**Example**:
[a minimal Dockerfile snippet or command in a fenced code block]
**Best practice**: [one tip]
**Common mistake**: [one thing people get wrong]

Rules:
- Keep it under 250 words. Simple markdown only.
- End with exactly one line: Learn more: <URL> — the real docs.docker.com page for that keyword or concept. Never invent URLs.

Today is {current_date}. Do not repeat these recently covered keywords:
{recent_tips}'
);

-- ------------------------------------------------------------
-- Core topic 5: Angular Bites
-- ------------------------------------------------------------
INSERT INTO topics (name, description, difficulty, tags, active, prompt_template)
VALUES (
'Angular Bites',
'Small, focused Angular topics: signals, standalone components, control flow, RxJS, forms, routing and performance.',
'BEGINNER',
'angular,typescript,frontend,rxjs,signals',
1,
'You are teaching Angular to developers in small daily bites.

Pick ONE small Angular topic. Rotate across: signals and computed values, standalone components, the built-in control flow (@if, @for, @switch), dependency injection and inject(), lifecycle hooks, reactive vs template-driven forms, common RxJS operators, routing and guards, lazy loading, change detection and OnPush, directives and pipes, HttpClient and interceptors, and testing basics.

Format:
🅰️ **Angular Bite: [topic name]**
**In one sentence**: [what it is and the problem it solves]
**Example**:
[a tiny TypeScript/HTML snippet in a fenced code block, max 12 lines]
**When to use it**: [1 to 2 sentences]
**Gotcha**: [one common mistake]

Rules:
- Target modern Angular (v17+ style: standalone, signals) unless the concept is version-independent.
- Keep it under 250 words. Simple markdown only.
- End with exactly one line: Learn more: <URL> — the real angular.dev guide page for the topic. Never invent URLs.

Today is {current_date}. Do not repeat these recently covered topics:
{recent_tips}'
);

-- ------------------------------------------------------------
-- Fintech extra 1: Secure Coding for Fintech
-- ------------------------------------------------------------
INSERT INTO topics (name, description, difficulty, tags, active, prompt_template)
VALUES (
'Secure Coding for Fintech',
'Security practices for financial software: OWASP risks, input validation, secrets, JWT pitfalls, encryption and compliance awareness.',
'INTERMEDIATE',
'security,owasp,fintech,java,angular',
1,
'You are teaching secure coding to Java + Angular developers building financial software.

Pick ONE security topic. Rotate across: OWASP Top 10 items with concrete Java/Angular examples, SQL injection and parameterized queries, XSS and Angular sanitization, JWT pitfalls (alg none, weak secrets, expiry, storage), secrets management, input validation with Bean Validation, dependency and supply-chain scanning, TLS basics, encryption at rest, idempotent and replay-safe payment endpoints, audit logging, and PCI-DSS awareness for developers.

Format:
🔐 **Secure Coding Tip**
**The risk**: [what can go wrong, in a fintech context]
**Vulnerable vs safe**: [a short before/after code comparison in a fenced code block]
**Do this**: [1 to 2 actionable rules]

Rules:
- Stay defensive: explain how to protect code, never how to attack systems.
- Keep it under 300 words. Simple markdown only.
- End with exactly one line: Learn more: <URL> — a real page from owasp.org or official framework security docs. Never invent URLs.

Today is {current_date}. Do not repeat these recently covered risks:
{recent_tips}'
);

-- ------------------------------------------------------------
-- Fintech extra 2: Fintech Engineering Concepts
-- ------------------------------------------------------------
INSERT INTO topics (name, description, difficulty, tags, active, prompt_template)
VALUES (
'Fintech Engineering Concepts',
'Domain engineering for financial systems: money handling, idempotency, ledgers, reconciliation, payment standards and exactly-once processing.',
'INTERMEDIATE',
'fintech,payments,ledger,idempotency,domain',
1,
'You are teaching the engineering side of financial systems to Java developers.

Pick ONE domain concept. Rotate across: representing money correctly (BigDecimal, minor units, never double), rounding modes, currency conversion pitfalls, idempotency keys for payment APIs, double-entry ledgers, reconciliation, ISO 20022 and ISO 8583 basics, settlement vs authorization, exactly-once vs at-least-once processing, sagas and distributed transactions, event sourcing for audit trails, and regulatory concepts developers should know (KYC, AML, PSD2) at a high level.

Format:
💳 **Fintech Concept: [name]**
**What it is**: [2 to 3 plain-language sentences]
**Why engineers care**: [the failure mode if you get it wrong]
**In code**: [a small Java-flavoured example or pattern sketch in a fenced code block, if applicable]

Rules:
- Keep it under 300 words. Simple markdown only.
- End with exactly one line: Learn more: <URL> — a real, stable reference (ISO/standard body page, martinfowler.com, stripe.com/docs or similar reputable engineering source). Never invent URLs.

Today is {current_date}. Do not repeat these recently covered concepts:
{recent_tips}'
);

-- ------------------------------------------------------------
-- Fintech extra 3: Spring Boot for Microservices
-- ------------------------------------------------------------
INSERT INTO topics (name, description, difficulty, tags, active, prompt_template)
VALUES (
'Spring Boot for Microservices',
'Production-grade Spring Boot: configuration, actuator, resilience, caching, JPA performance, testing and transactional pitfalls.',
'INTERMEDIATE',
'java,spring-boot,microservices,jpa,backend',
1,
'You are sharing production-grade Spring Boot practices with backend developers at a fintech company.

Pick ONE focused tip. Rotate across: @Transactional pitfalls (self-invocation, rollback rules, readOnly), JPA and Hibernate performance (N+1, fetch joins, projections), connection pool tuning, actuator and observability, resilience patterns (timeouts, retries, circuit breakers), caching, configuration properties and profiles, validation, exception handling with @ControllerAdvice, idempotent REST design, and testing (slices, Testcontainers).

Format:
🍃 **Spring Boot Tip**
**The problem**: [what commonly goes wrong, 1 to 2 sentences]
**The fix**: [a short code or config example in a fenced code block]
**Rule of thumb**: [one memorable guideline]

Rules:
- Target Spring Boot 3.x / Java 17+.
- Keep it under 300 words. Simple markdown only.
- End with exactly one line: Learn more: <URL> — a real page from docs.spring.io, spring.io/blog or baeldung.com. Never invent URLs.

Today is {current_date}. Do not repeat these recently covered tips:
{recent_tips}'
);

-- ------------------------------------------------------------
-- Fintech extra 4: SQL and Transactions Deep Dive
-- ------------------------------------------------------------
INSERT INTO topics (name, description, difficulty, tags, active, prompt_template)
VALUES (
'SQL and Transactions Deep Dive',
'Data integrity and performance for financial data: isolation levels, locking, deadlocks, indexing and query plans.',
'ADVANCED',
'sql,mysql,transactions,performance,data-integrity',
1,
'You are teaching database reliability and performance to developers who store financial data.

Pick ONE focused topic. Rotate across: transaction isolation levels and their anomalies (dirty read, non-repeatable read, phantom), optimistic vs pessimistic locking, SELECT FOR UPDATE, deadlock causes and avoidance, index design and covering indexes, reading execution plans, pagination pitfalls, UPSERT patterns, batch operations, constraints as a safety net, and safe schema migrations on live tables.

Format:
🗄️ **Database Deep Dive: [topic]**
**The scenario**: [a concrete situation, ideally money-related, where this matters]
**What happens**: [the anomaly, bug or slowdown explained simply]
**The fix**: [SQL or Java/JPA example in a fenced code block]

Rules:
- Default to MySQL/InnoDB semantics; call it out when behaviour differs across databases.
- Keep it under 300 words. Simple markdown only.
- End with exactly one line: Learn more: <URL> — a real page from dev.mysql.com/doc, use-the-index-luke.com or official database docs. Never invent URLs.

Today is {current_date}. Do not repeat these recently covered topics:
{recent_tips}'
);

-- ------------------------------------------------------------
-- Weekday schedules on the existing Daily Learning channel
-- (UTC by default — adjust per schedule via the API if needed)
-- ------------------------------------------------------------

-- Daily core lineup (Mon–Fri)
INSERT INTO schedules (name, topic_id, channel_id, send_times, cron_expression, timezone, active)
SELECT 'Java Puzzle — 09:00 weekdays', t.id, c.id, '09:00 Mon-Fri', '0 0 9 ? * MON-FRI', 'UTC', 1
FROM topics t JOIN teams_channels c ON c.name = 'Daily Learning'
WHERE t.name = 'Java Code Puzzle';

INSERT INTO schedules (name, topic_id, channel_id, send_times, cron_expression, timezone, active)
SELECT 'Docker Keyword — 10:30 weekdays', t.id, c.id, '10:30 Mon-Fri', '0 30 10 ? * MON-FRI', 'UTC', 1
FROM topics t JOIN teams_channels c ON c.name = 'Daily Learning'
WHERE t.name = 'Docker Keywords';

INSERT INTO schedules (name, topic_id, channel_id, send_times, cron_expression, timezone, active)
SELECT 'Angular Bite — 12:00 weekdays', t.id, c.id, '12:00 Mon-Fri', '0 0 12 ? * MON-FRI', 'UTC', 1
FROM topics t JOIN teams_channels c ON c.name = 'Daily Learning'
WHERE t.name = 'Angular Bites';

INSERT INTO schedules (name, topic_id, channel_id, send_times, cron_expression, timezone, active)
SELECT 'AI Productivity — 14:00 weekdays', t.id, c.id, '14:00 Mon-Fri', '0 0 14 ? * MON-FRI', 'UTC', 1
FROM topics t JOIN teams_channels c ON c.name = 'Daily Learning'
WHERE t.name = 'AI Productivity News';

INSERT INTO schedules (name, topic_id, channel_id, send_times, cron_expression, timezone, active)
SELECT 'Java Upgrade Brief — 15:30 weekdays', t.id, c.id, '15:30 Mon-Fri', '0 30 15 ? * MON-FRI', 'UTC', 1
FROM topics t JOIN teams_channels c ON c.name = 'Daily Learning'
WHERE t.name = 'Java Upgrade News';

-- Weekly fintech extras (one per day at 17:00)
INSERT INTO schedules (name, topic_id, channel_id, send_times, cron_expression, timezone, active)
SELECT 'Secure Coding — Mon 17:00', t.id, c.id, '17:00 Mon', '0 0 17 ? * MON', 'UTC', 1
FROM topics t JOIN teams_channels c ON c.name = 'Daily Learning'
WHERE t.name = 'Secure Coding for Fintech';

INSERT INTO schedules (name, topic_id, channel_id, send_times, cron_expression, timezone, active)
SELECT 'Fintech Concept — Tue 17:00', t.id, c.id, '17:00 Tue', '0 0 17 ? * TUE', 'UTC', 1
FROM topics t JOIN teams_channels c ON c.name = 'Daily Learning'
WHERE t.name = 'Fintech Engineering Concepts';

INSERT INTO schedules (name, topic_id, channel_id, send_times, cron_expression, timezone, active)
SELECT 'Spring Boot Tip — Wed 17:00', t.id, c.id, '17:00 Wed', '0 0 17 ? * WED', 'UTC', 1
FROM topics t JOIN teams_channels c ON c.name = 'Daily Learning'
WHERE t.name = 'Spring Boot for Microservices';

INSERT INTO schedules (name, topic_id, channel_id, send_times, cron_expression, timezone, active)
SELECT 'Database Deep Dive — Thu 17:00', t.id, c.id, '17:00 Thu', '0 0 17 ? * THU', 'UTC', 1
FROM topics t JOIN teams_channels c ON c.name = 'Daily Learning'
WHERE t.name = 'SQL and Transactions Deep Dive';
