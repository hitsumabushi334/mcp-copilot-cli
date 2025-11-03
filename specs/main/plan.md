# Implementation Plan: MCP copilot-cli stdio server (copilot.chat v1)

**Branch**: `main` | **Date**: 2025-11-03 | **Spec**: C:\Users\石田翔大\mcp-copilot-cli\specs\main\spec.md
**Input**: Feature specification from `/specs/main/spec.md`

**Note**: This plan follows the project constitution (v1.0.0). Quality gates are enforced.

## Summary

ClaudeCode/Codex から呼び出せる Stdio の MCP サーバーを実装する。ユーザーは事前に Copilot CLI を
インストール・ログイン済み。v1 では `copilot.chat` のみを公開する。実行は「非対話フラグ優先
（`copilot -p "<prompt>" --model "<name>"`）」で試行し、未対応環境では TTY で `/model <name>` を送って
フォールバックする。入力オプションは `model` のみホワイトリスト。出力は生の stdout/stderr と exit code。

## Technical Context

**Language/Version**: TypeScript 5.9（Node.js 20 LTS）  
**Primary Dependencies**: 
- `fastmcp`（TypeScript SDK; MCP サーバー実装）
- `child_process`（非対話モードの stdio=pipe 起動）
- `node-pty`（TTY フォールバック起動）
- `zod`（ツール入力と `config/models.json` の実行時検証）
- `vitest` + `c8`（テストとカバレッジ ≥80% 行/分岐）  
**Storage**: N/A  
**Testing**: Vitest + c8（ユニット/統合、非対話・TTY・タイムアウト・エラー分類を網羅）  
**Target Platform**: Cross-platform（Windows / macOS / Linux）  
**Project Type**: single  
**Performance Goals**: p95 < 200ms（起動コールドスタートは計測・最適化）  
**Constraints**: 
- RSS < 100MB
- 非対話（`-p`/`--model`）優先・TTY フォールバック
- per-request spawn（プールなし）
- 受理オプションは `model` のみ（ホワイトリスト）
- グローバル timeout 30s（非対話/TTY 共通）  
**Scale/Scope**: v1 は `copilot.chat` のみ（将来拡張は追加ツールとして段階的に）  
**CI**: GitHub Actions（型/テスト/カバレッジ/簡易ベンチのゲート）

## Constitution Check

Mandatory gates（計画時点の評価）:
- Readability: Single-responsibility, DRY/KISS, clear naming; no dead code → PENDING（実装で順守）
- Type-safety: `tsc --noEmit` ゼロエラー → BLOCKING（ツール/設定未導入）
- Tests: ユニット/統合あり・カバレッジ ≥80%（行/分岐）→ BLOCKING（未導入）
- Performance: SLI/SLO 定義と回帰なし → PARTIAL（p95 目標定義; ベンチ導入は未）
- Dependencies: 新規依存の評価（security/size/maintenance）→ OK（採用方針確定）
- Waivers: 例外は理由と責任者 → N/A

Gate 解消の前提タスク（実装前に着手）:
- `package.json` に fastmcp / node-pty / vitest / c8 / zod を追加し、`tsc --noEmit` / `vitest --coverage` スクリプトを整備
- GitHub Actions を設定（型 / テスト / カバレッジ ≥80% / 迅速ベンチ or スモーク（タイムアウト検証））
- tsconfig の厳格設定（既存 `strict` 維持）

## Project Structure

### Documentation (this feature)

```text
specs/main/
├── plan.md              # This file
├── research_clean.md    # Phase 0 output (UTF-8)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── copilot.chat.schema.json  # MCP tool contract (JSON Schema)
└── tasks.md             # Generated later by /speckit.tasks
```

### Source Code (repository root)

```text
config/
└── models.json          # モデルのホワイトリスト（ランタイム検証）

src/
├── server.ts            # FASTMCP サーバー bootstrap（stdio）
├── tools/
│   └── copilotChat.ts   # `copilot.chat` 実装（非対話→TTY フォールバック）
└── lib/
    └── process.ts       # spawn/pty ラッパ（timeout/検出/エラー正規化）

tests/
├── unit/
│   ├── copilotChat.test.ts
│   └── process.test.ts
└── integration/
    └── mcp_server.test.ts
```

**Structure Decision**: Single project。MVP は `copilot.chat` のみ。

## Configuration

- モデルのホワイトリストは `config/models.json` で管理（Zod で検証）。契約の enum はスナップショットとして保持。

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Phase 0: Outline & Research (Completed)

- 調査結果は `specs/main/research_clean.md` に集約（FASTMCP、非対話優先+TTY、モデル管理、タイムアウト30s、Zod 検証）

## Phase 1: Design & Contracts (Completed)

- `data-model.md`: 永続エンティティなし。I/O 構造を定義
- `contracts/copilot.chat.schema.json`: 実行モード（nonInteractive+interactiveFallback）、
  models コンフィグ、timeout を記述
- `quickstart.md`: 前提/起動/トラブルシュートの下書き

## Constitution Re-check (post-design)

- Readability: OK（設計で方針明記）
- Type-safety: BLOCKING（ツール・設定導入が未）
- Tests ≥80%: BLOCKING（Vitest + c8 導入が未）
- Performance: PARTIAL（目標定義済; ベンチ/CI は未）
- Dependencies: OK（採用方針確定）

未解決の BLOCKING を実装前に解消し、/speckit.tasks でタスク分解へ進む。
