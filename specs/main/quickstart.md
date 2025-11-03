# Quickstart: MCP copilot-cli stdio server (copilot.chat)

## Prerequisites

- Node.js 18+ / 20+
- GitHub Copilot CLI（バイナリ名 `copilot`）がインストール済みかつログイン済み

## Build & Run (placeholder)

- 実装後の想定コマンド:
  - `npx tsc -p tsconfig.json`
  - `node dist/src/server.js`

## Usage (MCP client)

- ClaudeCode/Codex から MCP サーバーを stdio で起動
- `copilot.chat` ツールを呼び出し、引数はホワイトリスト（`model`, `input`）のみ
- 出力は生の stdout/stderr と exit code

## Troubleshooting

- `not_installed`: `copilot-cli` をインストール
- `not_logged_in`: `copilot-cli login` を実行
- `timeout`: 入力規模・ネットワーク状況を確認。タイムアウト値を調整
- `nonzero_exit`: stderr を参照し、再実行
