# Project Overview

- Name: mcp-copilot-cli
- Purpose: TBD — リポジトリ名から「MCP Copilot の CLI ツール」と推測。正確な目的・期待機能をご指示ください。
- Platform: Windows (PowerShell/Command Prompt)
- Tech stack:
  - Language: TypeScript (TS 5.9)
  - Runtime: Node.js (package.json `type: commonjs`)
  - Types: `@types/node`
- Build setup:
  - tsconfig: `outDir: ./dist`, `module: esnext`, `target: es2020`, `strict: true`, `verbatimModuleSyntax: true`, `isolatedModules: true`, `moduleDetection: force`
  - include: `src/**/*.ts`
  - 備考: package.json の `type: commonjs` と tsconfig の `module: esnext` に不整合の可能性（CJS/ESM の整合性方針が必要）
- Entrypoints:
  - ソース: `src/index.ts`
  - 現在の `main`: `index.js`（未ビルドのため不一致の可能性大。ビルド後は通常 `dist/src/index.js`）
- Scripts:
  - `test`: 予約のみ（実質未設定）
- Repo structure (rough):
  - Root files: `package.json`, `tsconfig.json`, `AGENTS.md`, `.gitignore`, `package-lock.json`
  - Dirs: `src/`（`index.ts`）, `.codex/`, `.serena/`, `.specify/`
- Notable conventions/guidelines:
  - `AGENTS.md` に作業手順・原則（YAGNI/DRY/KISS、作業完了報告形式 等）
  - 厳格な型チェック（`strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`）

Open Questions
- 本プロジェクトの正確な目的・対象ユーザー・CLI インタフェース仕様
- CJS/ESM どちらに統一するか（tsconfig と package.json の整合）
- ビルド/実行/テスト/リンタ/フォーマッタの採用方針
