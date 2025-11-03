# Research: MCP copilot-cli stdio server (clean)

## Context & Sources

- Goal: FASTMCP(TypeScript) で MCP サーバーを実装し、ClaudeCode/Codex から `copilot` を呼び出す。
- Copilot CLI は本質的に対話型。ユーザー要件に基づき非対話フラグ（`-p`, `--model`）を優先し、未対応環境では TTY フォールバック。
- DeepWiki 調査要点:
  - モデル選択は `/model <name>`（対話）／環境変数（例: GH_TOKEN/GITHUB_TOKEN）での認証を確認。
  - 非対話実行は公式に明示されていないため、実装で検出し TTY にフォールバックする方針が安全。

## Decisions (Final)

1) MCP フレームワーク
- Decision: FASTMCP TypeScript SDK を採用。
- Rationale: TS スタックと整合、MCP 実装が簡潔。
- Alternatives: OpenAI `mcp` npm / 独自 JSON-RPC 実装（保守コスト増）。

2) 実行モード（非対話優先 + TTY フォールバック）
- Decision: まず `copilot -p "<prompt>" [--model <name>]`（stdio=pipe）を試行。未対応（不明オプション等）を検出したら `node-pty` による TTY を起動し、`/model <name>` を送ってから入力を送信。
- Rationale: ユーザー要件（非対話）と互換性（TTY）を両立。
- Alternatives: TTY 専用／非対話専用（いずれも環境差異で失敗リスク）。

3) モデル管理（コンフィグ）
- Decision: ルート `config/models.json` に列挙。MCP はこのコンフィグで検証し、不一致は拒否。契約(JSON Schema)の enum は現状スナップショットとして併記。
- Rationale: 将来のモデル追加をコンフィグで完結。
- Alternatives: コード直書き（変更コスト高）。

4) エラー分類
- Decision: 型付きエラーに正規化: `not_installed`, `not_logged_in`, `timeout`, `nonzero_exit`, `rate_limited`, `tty_unavailable`, `unknown_option`。
- Rationale: ユーザーが対処しやすい失敗モード。

5) タイムアウト
- Decision: 非対話/TTY とも 30s。タイムアウト時は `timeout` を返却。
- Rationale: API 待ちの上限として妥当。将来調整可。

6) パフォーマンス・SLO
- Decision: p95 < 200ms（入力規模に依存）。必要に応じてベンチを追加。

7) セキュリティ
- Decision: オプションはホワイトリスト（`model` のみ）。未許可・未検証の引数は拒否。最大入力長 10k 文字。

8) テスト & カバレッジ
- Decision: Vitest + c8、行/分岐 ≥ 80%。非対話・TTY・タイムアウト・エラー分類のケースをユニット/統合で網羅。

9) クロスプラットフォーム
- Decision: Windows/macOS/Linux を対象。`shell:false`、引用・エスケープは Node の API に準拠。

## Alternatives Considered
- TTY 専用: 非対話要件を満たさない。
- 非対話専用: 古い環境や将来互換で失敗リスク。
- モデル直書き: 拡張に弱い。

## Open Items
- なし（モデルは `config/models.json` で運用）。

