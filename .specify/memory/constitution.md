<!--
Sync Impact Report
- Version change: N/A → 1.0.0
- Modified principles: Added P1–P5 with concrete rules
- Added sections: Performance Standards & Constraints; Development Workflow & Quality Gates
- Removed sections: None
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ updated (Constitution Check gates)
  - .specify/templates/tasks-template.md ✅ updated (tests REQUIRED + coverage target)
  - .specify/templates/spec-template.md ✅ reviewed (no changes required)
  - .specify/templates/checklist-template.md ✅ reviewed (no changes required)
  - .specify/templates/agent-file-template.md ✅ reviewed (no changes required)
- Deferred TODOs:
  - TODO(RATIFICATION_DATE): original adoption date unknown — set when known
  - Establish tooling for lint/coverage/perf (ESLint/Jest/nyc/benchmark) in package.json
-->

# mcp-copilot-cli Constitution

## Core Principles

### I. Readability & Maintainability First
コードは読みやすさと保守性を最優先とする。命名は一貫性を保ち、関数・モジュールは単一責務で小さく保つ。
重複は排除（DRY）、シンプルさを優先（KISS）。コメントは「なぜ」を記述し、「なに」を補うための
過剰な説明は避ける。TypeScript は `strict` 前提で型の曖昧さを残さない。

- MUST: cyclomatic complexity が高い実装は分割する（目安 CC ≤ 10）
- MUST: 死んだコード・未使用の依存を残さない
- SHOULD: モジュール境界を明確化（公開 API と内部実装を分離）
- Rationale: 可読性の高さは欠陥を減らし、変更容易性を最大化する

### II. Test Coverage Discipline（テストは品質の最小条件）
テストは必須。可能な箇所ではテスト先行（Red-Green-Refactor）を基本とし、変更はテストで守る。
種類はユニット中心、必要に応じて結合/契約テストを追加。CI はテスト失敗を許容しない。

- MUST: 行・分岐カバレッジ 80% 以上を維持（例外は明示のワイバーで記録）
- MUST: 新規/変更コードに対応するテストを同一 PR に含める
- MUST: 失敗するテストが存在する状態でのマージ禁止
- SHOULD: テストデータは最小・明確・再現性保証（固定シード等）
- Rationale: 網羅的なテストは回 regressions を防ぎ、安心してリファクタできる

### III. Performance Management & Budgets（性能を機能として扱う）
性能は設計段階から管理する。機能ごとに SLI/SLO と性能バジェットを設定し、計測と回帰防止を行う。

- MUST: 主要ユースケースに p95 レイテンシとメモリ上限の目標を設定（例: p95 < 200ms, RSS < 100MB、要件に応じ調整）
- MUST: 重要処理にプロファイル/ベンチを用意し、CI で閾値逸脱を検知可能にする
- SHOULD: ストリーミング/イテレーティブ処理・低コピー化などでフットプリント削減
- SHOULD: アルゴリズム/データ構造の選択で計算量を明示（Big-O を意識）
- Rationale: 性能は UX とコストに直結し、継続的な可観測性が必要

### IV. Simplicity & Minimalism（YAGNI/過剰設計の禁止）
必要最小限の設計と実装に徹する。不要な抽象化や将来要件を見越した拡張を避け、依存の追加はコストと
代替の比較検討を経て最小に保つ。

- MUST: 目的・根拠なき抽象化/レイヤ追加を禁止（後方互換維持のための分離は可）
- MUST: 新規依存はセキュリティ/保守性/サイズ影響の評価を添付
- SHOULD: 小さなプルリクと小さなステップで進める
- Rationale: 過剰な構造は学習/保守コストを増やし、欠陥温床となる

### V. Continuous Quality Gates（自動品質ゲートの継続運用）
品質は自動化されたゲートで担保する。型チェック、静的解析、テスト/カバレッジ、性能チェックを PR/CI に
組み込み、逸脱はマージ不可とする。

- MUST: 型チェック（例: `tsc --noEmit`）がゼロエラー
- SHOULD: Lint/Format（ESLint/Prettier 等）を導入し違反ゼロ
- MUST: カバレッジ閾値（行/分岐 80%）を下回らない
- SHOULD: 重要ベンチの劣化（例: >10%）で CI を失敗させる
- Rationale: 人手レビューのばらつきを補完し、品質を継続的に維持する

## Performance Standards & Constraints

性能標準は機能単位で設定し、測定・監視・検証可能であること。

- 既定目安（CLI/ユーティリティ系）:
  - p95 実行時間 < 200ms（入出力規模に応じて調整）
  - 常駐メモリ RSS < 100MB、ピークは根拠付きで例外化
  - 大規模入力時も O(n) でスケール（n は入力件数/サイズ）
- 性能バジェットは `plan.md`/`spec.md` に明記し、逸脱時の是正策（実装/設計/依存の見直し）を提示
- ベンチマークは CI or 手動トリガで再現可能（固定環境/入力、集計方法を明示）

## Development Workflow & Quality Gates

開発フローは以下を満たすこと。

1) 設計/計画: `plan.md` に品質ゲート・性能バジェットを定義
2) 実装前テスト: 可能な箇所は失敗テストを先に作成
3) 実装/リファクタ: 小さなコミットで進め、意味単位でレビュー
4) CI ゲート（必須）:
   - 型チェック成功（`tsc --noEmit`）
   - Lint/Format 準拠（導入後）
   - ユニット/結合テスト成功、行/分岐カバレッジ ≥ 80%
   - 主要ベンチの性能劣化なし（しきい値超過は要ワイバー）
5) レビュー: 原則の遵守確認（本章参照）と性能/テストの根拠確認

## Governance

本憲章は他の慣行に優先する。改訂は記録・レビュー・影響評価を伴う。

- Amendments: RFC（変更理由/影響/移行方針）を作成し、2 名以上の承認で採択
- Versioning Policy（本憲章）:
  - MAJOR: 非互換な原則の削除/再定義
  - MINOR: 原則/節の追加や実質拡張
  - PATCH: 文章の明確化や誤字修正など意味不変
- Compliance Review: 主要 PR で遵守確認を実施し、逸脱はワイバーに記録

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date unknown | **Last Amended**: 2025-11-03

