# AI Engineering Workflows

A runnable TypeScript course API plus focused planning, implementation and review instructions for Claude Code, Antigravity and Codex. Free under MIT.

## Run

Requires Node.js 22+. Run npm ci, npm test, then npm start. The API listens on http://127.0.0.1:5082. POST /courses with JSON {"title":"Architecture","capacity":1}; use its id in POST /courses/ID/enrollments with {"studentId":"11111111-1111-4111-8111-111111111111"}. Repeat the same student to confirm idempotency; a second distinct student receives 409 when the course is full. GET /health returns ok.

Restart to reset the in-memory data. Read docs/workflow.md for the exercise and supported tool adapters. No AI subscription is needed to run or test the example; using an assistant depends on your own account and plan. No API calls, paid operations, agents or deployments run automatically.

## Limits

Local educational API without authentication or durable storage. Do not expose it publicly without a separate security review. The workflow files guide behaviour; they are not a security sandbox. The implementation/review exercise must not weaken existing invariants.

## Official references

- [Codex AGENTS.md](https://developers.openai.com/codex/guides/agents-md)
- [Claude Code project memory](https://code.claude.com/docs/en/memory)
- [Antigravity rules](https://antigravity.google/docs/rules)
- [Antigravity skills](https://antigravity.google/docs/skills/) and [workflow migration](https://antigravity.google/docs/migration/workflows-to-skills/)

Reviewed 21 October 2026. Tool conventions change; confirm against these sources when updating adapters.

## Code formatting

Run `npm run format` to apply Prettier, or `npm run format:check` to verify. CI checks formatting before tests. Configuration and the formatter version are committed.
