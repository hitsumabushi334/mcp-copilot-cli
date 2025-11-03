---

description: "Generated task list for MCP copilot-cli stdio server (copilot.chat v1)"
---

# Tasks: copilot-cli stdio MCP server (copilot.chat v1)

**Input**: Design documents from `C:\Users\石田翔大\mcp-copilot-cli\specs\main\`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Coverage target ≥80% lines/branches. Write tests alongside implementation within each story.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create base structure: `config/`, `src/{server.ts,tools/copilotChat.ts,lib/process.ts}`, `tests/{unit,integration}/`, `.github/workflows/` (no code yet)
- [X] T002 Initialize Node/TypeScript project and add dependencies in `package.json` (deps: `fastmcp`, `node-pty`, `zod`; devDeps: `typescript`, `vitest`, `c8`)
- [X] T003 [P] Add npm scripts in `package.json`: `build`, `typecheck` (`tsc --noEmit`), `test` (`vitest`), `coverage` (`vitest --coverage`)
- [X] T004 [P] Create `tsconfig.json` with `strict: true`, `moduleResolution: node`, `esModuleInterop: true`, `outDir: dist`
- [X] T005 [P] Add `config/models.json` with model whitelist aligned to contract (`claude-sonnet-4`, `claude-sonnet-4.5`, `gpt5`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

 - [X] T006 Create MCP tool contract `specs/main/contracts/copilot.chat.schema.json` (ensure enum mirrors `config/models.json`)
 - [X] T007 [P] Add GitHub Actions CI `/.github/workflows/ci.yml` running: `npm ci`, `npm run typecheck`, `npm run test -- --run`, `npm run coverage` and enforce ≥80% coverage
 - [X] T008 [P] Add basic Vitest config (inline in package.json or `vitest.config.ts`) with Node test environment
 - [X] T009 Establish error taxonomy doc in `docs/errors.md` mapping stderr/exit to types (`not_installed`, `not_logged_in`, `timeout`, `nonzero_exit`, `rate_limited`, `tty_unavailable`, `unknown_option`)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - 非対話モードで `copilot.chat` を実行 (Priority: P1) 🎯 MVP

**Goal**: 非対話（stdio=pipe）で `copilot -p <prompt> [--model <name>]` を起動し、raw `stdout`/`stderr`/`exitCode` を返す

**Independent Test**: MCP サーバーを起動せずともユニットテストで引数組み立て・タイムアウト・基本的なエラー分類を確認できる

### Tests for User Story 1

 - [X] T010 [P] [US1] Unit: `tests/unit/process.test.ts` 非対話実行の引数組み立て・タイムアウト30sを検証（child_process をモック）
 - [X] T011 [P] [US1] Unit: `tests/unit/copilotChat.test.ts` Zod 入力検証（input 必須、model は任意・ホワイトリスト）

### Implementation for User Story 1

 - [X] T012 [P] [US1] Implement `src/lib/process.ts` non-interactive runner（`spawnCommand(command, args, timeoutMs)`）
 - [X] T013 [P] [US1] Implement Zod schemas `src/tools/copilotChat.schema.ts`（tool input と `config/models.json`）
 - [X] T014 [US1] Implement `src/tools/copilotChat.ts` 非対話パス（`--model` を条件付き付与）と基本エラー分類（ENOENT→`not_installed`）
 - [X] T015 [US1] Implement `src/server.ts` FastMCP stdio bootstrap + `copilot.chat` 登録

**Checkpoint**: 非対話モードでの最小機能が動作。US1は単体で検証可能

---

## Phase 4: User Story 2 - 未対応環境での TTY フォールバック (Priority: P2)

**Goal**: `-p/--model` 未対応や `unknown option` 検出時に pseudo‑TTY に切り替え、`/model <name>` を先行送信してから入力を送る

**Independent Test**: 非対話パスが `unknown option` を返すモック時に TTY パスへ自動切替されることをユニットで検証

### Tests for User Story 2

- [ ] T016 [P] [US2] Unit: `tests/unit/process.test.ts` TTY 実行（node-pty モック）/ prelude `/model` 送信 / 出力取得を検証
- [ ] T017 [P] [US2] Unit: `tests/unit/copilotChat.test.ts` 非対話エラー（unknown option）→ TTY フォールバック判定ロジックを検証

### Implementation for User Story 2

- [ ] T018 [P] [US2] Extend `src/lib/process.ts` に `spawnPty(command, prelude: string[], timeoutMs)` を追加
- [ ] T019 [US2] Update `src/tools/copilotChat.ts` フォールバック検出（stderr/exitCode パターン）と `/model` 送信実装

**Checkpoint**: 非対話未対応環境でも動作。US2はUS1に依存するが独立検証可能

---

## Phase 5: User Story 3 - 型付きエラー/設定検証/CI 閾値 (Priority: P3)

**Goal**: 型付きエラー整備、`config/models.json` の実行時検証、CI で型/テスト/カバレッジを満たす

**Independent Test**: 各失敗モードが期待どおりの `errorType` で返ることをユニットで検証できる

### Tests for User Story 3

- [ ] T020 [P] [US3] Unit: `tests/unit/process.test.ts` `timeout`（30s 短縮注入）/ `nonzero_exit` / `rate_limited` パターン検証
- [ ] T021 [P] [US3] Unit: `tests/unit/copilotChat.test.ts` `invalid_request`（Zod）/ `invalid_config`（models.json 破損）検証

### Implementation for User Story 3

- [ ] T022 [P] [US3] Implement error normalization in `src/lib/process.ts` とマッピング（`not_logged_in` 等の stderr パターン）
- [ ] T023 [US3] Validate `config/models.json` 起動時/初回呼び出し時にキャッシュし、スキーマ不一致で `invalid_config`
- [ ] T024 [US3] Finalize CI `/.github/workflows/ci.yml` にカバレッジ閾値（fail under 80%）を追加

**Checkpoint**: 主要な失敗モードと品質ゲートが揃い、US3 も独立に検証可能

---

## Phase N: Polish & Cross-Cutting Concerns

- [ ] T025 [P] Documentation: Update `specs/main/quickstart.md` 実行/トラブルシュートを UTF‑8 で整備
- [ ] T026 [P] Documentation: Fix mojibake in `specs/main/spec.md` Clarifications セクション（UTF‑8 再入力）
- [ ] T027 Cleanups: リファクタリングとロギング整備（過度な出力を抑制、秘密情報を出さない）

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1) → Foundational (Phase 2) → User Stories (Phase 3+)
- User stories proceed in priority order (P1 → P2 → P3) or in parallel after Phase 2

### User Story Dependencies

- US1 (P1): Depends on Phase 2 completion; no other story dependency
- US2 (P2): Depends on US1 (fallback builds on non-interactive path)
- US3 (P3): Depends on US1/US2 (error mapping/validation spans both paths)

### Within Each User Story

- Tests accompany implementation and must pass; coverage contributes toward ≥80%
- Keep implementation DRY/KISS and validate inputs via Zod

### Parallel Opportunities

- [P] tasks in Setup/Foundational can run concurrently
- US1 tests (T010–T011) can run in parallel; US2 tests (T016–T017) can run in parallel
- Library and server wiring (T012–T015) largely parallel except for registration order

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2
2. Implement US1 (T010–T015) and verify raw execution path
3. Stop and validate with unit tests; ensure coverage trending toward ≥80%

### Incremental Delivery

1. Add US2 fallback (T016–T019) and validate
2. Add US3 error taxonomy/validation and CI threshold (T020–T024)
3. Polish docs/cleanup (T025–T027)
