# Plan → Implement → Review

## Exercise

Add a course lookup endpoint GET /courses/:id. Acceptance: an existing course returns its title, capacity and enrolled count; an unknown course returns 404; invalid input does not expose internals. This endpoint is intentionally absent so the kit offers a real feature task. Existing enrolment behaviour must remain unchanged.

## Plan

Inspect the code, name the change boundaries, specify HTTP behaviour, and list tests. Obtain product decisions from the owner when genuinely missing.

## Implement

Add a failing behaviour test, make a small change, and run npm test. Review any dependency additions against the goal.

## Review

Read the complete diff. Check validation, resource bounds, error disclosure, idempotency and behaviour regressions. Run npm test and npm audit --omit=dev --audit-level=high. Record the commands and output in your change description. Do not fabricate test, model or security claims.

## Tool adapters

Codex: open the repository and use AGENTS.md. Claude Code: CLAUDE.md points to shared instructions. Antigravity: persistent rules live in .agents/rules/ and reusable skills in .agents/skills/. Invoke /plan-course-change, /implement-course-change or /review-course-change. Legacy workflow files were retired on 19 October 2026, so this kit uses the current skill format. Codex also discovers the portable .agents/skills/ files. Availability and UI can change: consult the linked official sources. These are manual workflow instructions, not hosted integrations or an automated multi-agent system.
