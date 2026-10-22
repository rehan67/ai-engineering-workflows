---
name: review-course-change
description: Reviews changes to this course API for correctness, security and regressions. Use for a requested pre-merge review.
---

Read the full diff and related implementation. Check capacity and duplicate enrolment, UUID validation, request-size limits, safe error responses and loopback-only binding. Run npm test and npm audit --omit=dev --audit-level=high. Report actionable defects with locations and consequences; distinguish observed results from unverified claims. Do not silently change product scope.
