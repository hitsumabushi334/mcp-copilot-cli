# Implementation Plan: MCP copilot-cli stdio server (copilot.chat v1)

**Branch**: `main` | **Date**: 2025-11-03 | **Spec**: C:\Users\石田翔大\mcp-copilot-cli\specs\main\spec.md
**Input**: Feature specification from `/specs/main/spec.md`

**Note**: This plan follows the repo constitution (v1.0.0). Gates are enforced.

## Summary

Goal: ClaudeCode/Codex から呼び出せる Stdio の MCP サーバーを実装し、ユーザーが事前に `copilot-cli` を
インストール・ログイン済みである前提で、`copilot.chat` ツールを提供する。実行ごとに `copilot-cli` を新規起動し、
MCP 側で安全にコマンドラインを組み立てる（ホワイトリスト）。出力は生の stdout/stderr と exit code を返す。

## Technical Context

**Language/Version**: TypeScript 5.9 (Node.js 18+/20+)  
**Primary Dependencies**: FASTMCP TypeScript SDK（MCP サーバー実装）, Node `child_process`（非対話）/ `node-pty`（TTY フォールバック）  
**Storage**: N/A  
**Testing**: Vitest + c8（行/分岐 ≥80%）  
**Target Platform**: Windows 開発環境（クロスプラットフォーム対応を意識）  
**Project Type**: single  
**Performance Goals**: p95 < 200ms（非対話優先・TTY フォールバックのコールドスタート要検証）  
**Constraints**: RSS < 100MB、受理オプションはホワイトリスト（model）、毎リクエスト起動、非対話優先・TTY はフォールバック  
**Scale/Scope**: 単一ツール（`copilot.chat`）の最小実装（将来拡張を想定）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The following gates are MANDATORY per constitution:
- Readability: Single-responsibility, DRY/KISS, clear naming; no dead code → Status: PENDING（設計段階では遵守方針を明記）
- Type-safety: `tsc --noEmit` passes with zero errors → Status: BLOCKING（テスト/型設定未整備）
- Tests: Unit/integration tests exist; coverage ≥ 80% (lines/branches) → Status: BLOCKING（テスト基盤が未導入）
- Performance: Define SLI/SLO + budgets in this plan; no known regressions → Status: PARTIAL（p95 目標明記、実測は Phase 1 後）
- Dependencies: New deps include evaluation (security/size/maintenance) → Status: PARTIAL→MOVING TO OK（FASTMCP/`node-pty` 採用方針を研究で確定）
- Waivers: Any exception includes written rationale and owner → Status: N/A（現時点で例外なし）

If BLOCKING remains after Phase 1 design, ERROR and stop.

## Project Structure

### Documentation (this feature)

```text
specs/main/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── copilot.chat.schema.json  # MCP tool contract (JSON Schema)
└── tasks.md             # Generated later by /speckit.tasks
```

### Source Code (repository root)

```text
src/
├── server.ts            # MCP stdio server bootstrap
├── tools/
│   └── copilotChat.ts   # `copilot.chat` tool implementation (spawn copilot-cli)
└── lib/
    └── process.ts       # spawn wrapper, quoting/timeout/error mapping

tests/
├── unit/
│   ├── copilotChat.test.ts
│   └── process.test.ts
└── integration/
    └── mcp_server.test.ts
```

**Structure Decision**: Single project。MVP は `copilot.chat` のみ。

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Phase 0: Outline & Research (Completed)

- Unknowns 抽出と決定を `research.md` に集約（MCP フレームワーク、テスト/カバレッジ、spawn/timeout、引数検証、エラー分類）
- 結果に基づき Phase 1 設計を実施

## Phase 1: Design & Contracts (Completed)

- `data-model.md`: 永続エンティティなし、I/O 構造を定義
- `contracts/copilot.chat.schema.json`: MCP ツールの入出力/実行要件を JSON Schema 化
- `quickstart.md`: 前提/起動/トラブルシュートの下書き

## Constitution Re-check (post-design)

- Readability: OK（設計上の方針を明記）
- Type-safety: BLOCKING（型設定/ビルド・テスト導入が必要）
- Tests ≥80%: BLOCKING（Vitest + c8 導入タスク）
- Performance: PARTIAL（p95 目標は定義、ベンチ/CI 導入が未）
- Dependencies: PARTIAL（MCP ライブラリ選定の最終判断は実装前に確定）

未解決の BLOCKING が残るため、実装前にツールチェーン導入と CI ゲート設定が必要。
