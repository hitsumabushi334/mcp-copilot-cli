# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  
**Input**: User description: "$ARGUMENTS"

## Clarifications

### Session 2025-11-03

 - Q: 起動モード（非対話 `-p`/`--model` or TTY） → A: まず `copilot -p`/`--model` を試行し、未対応なら TTY で `/model` を送るフォールバック

 - Q: MCP 実装フレームワーク → A: FASTMCP TypeScript SDK を採用
 - Q: Copilot CLI へのモデル適用方法 → A: TTY 経由で `/model <name>` を先頭に送信し、その後に入力を送る
 - Q: 前提チェックのタイミング（起動時/毎リクエスト/ハイブリッド） → A: Option B — 毎リクエストで検証し、copilot-cli の起動エラー（未ログイン等）を捕捉して返す
 - Q: MCP ツール公開インターフェース（単一/複数ツール） → A: Option B — 最小限の機能ごとにツール公開。v1 は `copilot.chat` のみ実装
- Q: MCP でのコマンド公開方針（任意パススルー/固定ホワイトリスト/拡張可能） → A: 一部のオプションを受け取り、MCP 内で安全に組み立て実行（ホワイトリスト）
- Q: copilot-cli の起動モデル（リクエスト毎起動 vs 常駐ワーカー等） → A: Option A — リクエスト毎に copilot-cli を都度起動

 - Q: 出力フォーマット（生出力/正規化JSON/型付き） → A: Option A — 生の stdout/stderr と exit code を返す

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently - e.g., "Can be fully tested by [specific action] and delivers [specific value]"]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- What happens when [boundary condition]?
- How does system handle [error scenario]?
 - copilot-cli spawn failure or cold-start latency exceeds budget: define timeout and error mapping
- Unsupported option or argument-injection pattern detected: reject with structured error; never pass raw, unvalidated args through
 - Pseudo-TTY 不可（環境が TTY を提供しない）: エラー `tty_unavailable` を返す

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST, per request, prefer non-interactive spawn: `copilot -p <prompt> [--model <name>]` with stdio pipe; if flags are unsupported, fallback to pseudo‑TTY and interactive `/model`.
- **FR-002**: MCP MUST accept only a whitelisted subset of options (e.g., model). Apply as `--model <name>` in non-interactive path; otherwise emit `/model <name>` via TTY. Unspecified options are rejected by default.  
- **FR-003**: MCP MUST return raw stdout/stderr and exit code from `copilot` (no JSON normalization beyond tool envelope).
- **FR-004**: MCP MUST expose a single tool named `copilot.chat` in v1; additional tools may be added in future versions.
- **FR-005**: `copilot.chat` MUST accept only whitelisted options (initially `model`) and an input text; allowed model names are loaded from `config/models.json` (contract enum is a current snapshot). Unknown options/values are rejected by default.
 - **FR-008**: For missing login or installation, MCP MUST capture `copilot`'s exit code and stderr on each request and return a typed error (e.g., `not_logged_in`, `not_installed`) with remediation guidance; no startup preflight is required.
 - **FR-009**: Timeouts MUST be enforced: non‑interactive and TTY fallback both use a 30s global timeout; on timeout, return `timeout` typed error.
 - **FR-010**: The MCP server MUST validate tool input and `config/models.json` with Zod; on validation failure, return `invalid_request` or `invalid_config` with details (no partial execution).

*Example of marking unclear requirements:*

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### Key Entities *(include if feature involves data)*

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]
- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]
- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]
