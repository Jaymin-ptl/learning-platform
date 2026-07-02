-- ============================================================
-- V8: IST timezone + two-part question/answer puzzle flow
--
-- 1. Switches the active seeded schedules from UTC to Asia/Kolkata
--    so send times match Indian working hours.
-- 2. Adds schedules.message_mode and schedules.answer_delay_minutes:
--       SINGLE          — one message per firing (default)
--       QUESTION_ANSWER — question sent at fire time, answer sent
--                         answer_delay_minutes later as a follow-up
-- 3. Enables QUESTION_ANSWER for the Java Code Puzzle schedule
--    (question 09:00 IST, answer 4 hours later at 13:00 IST) and
--    rewrites its prompt to emit the two parts separated by a
--    ===ANSWER=== delimiter line.
-- ============================================================

ALTER TABLE schedules ADD COLUMN message_mode VARCHAR(20) NOT NULL DEFAULT 'SINGLE';
ALTER TABLE schedules ADD COLUMN answer_delay_minutes INT NULL;

-- Fix timezone for the active lineup seeded in V7
UPDATE schedules SET timezone = 'Asia/Kolkata' WHERE active = 1;

-- Two-part flow for the daily Java puzzle: question 09:00, answer 13:00 IST
UPDATE schedules
SET    message_mode = 'QUESTION_ANSWER',
       answer_delay_minutes = 240
WHERE  name = 'Java Puzzle — 09:00 weekdays';

-- Rewrite the puzzle prompt: two parts split by ===ANSWER===, answer
-- withheld from the morning message, concept named in the reveal so the
-- anti-repetition history has a meaningful signal.
UPDATE topics
SET prompt_template =
'You are creating a daily Java code-reading challenge for professional developers at a fintech company.

Write ONE short, self-contained Java snippet (5 to 15 lines) that tests a subtle but practical concept. Rotate across areas such as: autoboxing and integer caching, string interning and immutability, overloading vs overriding, static and instance initializer order, exceptions in try/finally, checked vs unchecked exceptions, streams laziness, BigDecimal equals vs compareTo, equals and hashCode contracts, generics and type erasure, switch expressions, records, var inference, and basic concurrency pitfalls.

Produce TWO parts separated by a line containing exactly ===ANSWER=== and nothing else.

Part 1 — the morning question (do NOT reveal or hint at the answer anywhere in this part):
🧩 **Java Puzzle of the Day**

[the snippet in a fenced java code block]

**Question**: What is the result of running this code?
A) [option]
B) [option]
C) Compilation error
D) Runtime exception

💬 Reply in the thread with your guess — the answer drops later today!

===ANSWER===

Part 2 — the afternoon answer reveal:
**Answer**: [correct option letter and value]
**Concept**: [short phrase naming the concept tested]
**Why**: [2 to 4 sentences explaining the underlying concept clearly]
Learn more: <URL>

Rules:
- The snippet must be valid to paste into a single file (assume needed imports).
- Exactly one option is correct; the wrong options must be plausible.
- Keep each part under 200 words. Use simple markdown only (bold, fenced code blocks, bullet lists).
- The Learn more URL must be a real, stable page from docs.oracle.com, dev.java, openjdk.org, or baeldung.com relevant to the concept. Never invent URLs.

Today is {current_date}. Do not reuse a concept from these recently sent puzzles:
{recent_tips}'
WHERE name = 'Java Code Puzzle';
