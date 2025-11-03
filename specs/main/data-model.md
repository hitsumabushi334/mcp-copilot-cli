# Data Model: MCP copilot-cli stdio server

## Entities

- N/A（永続データや複雑なエンティティは持たない）

## Transient Structures

- Request (copilot.chat)
  - input: string (必須)
  - model: string (任意, whitelisted)
- Response (copilot.chat)
  - stdout: string
  - stderr: string
  - exitCode: number
  - errorType?: 'not_installed' | 'not_logged_in' | 'timeout' | 'nonzero_exit'

## Validation Rules

- input: 非空、最大長制限（例: 10k chars, 要検証）
- model: 既知のホワイトリストに一致（未指定はデフォルト）
- 安全なクォート/エスケープ方針に従う（shell: false）

