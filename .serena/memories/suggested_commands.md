# Suggested Commands (Windows)

Setup
- `npm install` 依存関係をインストール

Build / Type-check
- `npx tsc -p tsconfig.json` TypeScript をビルド（`dist/` 出力）
- `npx tsc --noEmit -p tsconfig.json` 型チェックのみ

Run (after build)
- `node dist/src/index.js` エントリポイントを実行（仮）
  - 備考: package.json の `main: index.js` は未ビルド出力と不整合の可能性あり

Test
- `npm test` 現状はプレースホルダー（実行でエラーを返す設定）

Lint/Format
- 現時点で未設定（ESLint/Prettier 等なし）

Cleaning
- `rd /s /q dist` ビルド出力を削除（注意: 破壊的）

Useful (Windows shell)
- `dir`, `dir /b /s src` ファイル一覧
- `type package.json` ファイル表示
- `findstr /n /i "scripts" package.json` 文字列検索
