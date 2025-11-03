# Done-Checklist (When Task Completed)

- Scope & Design
  - 要件・設計（最小）を確認（YAGNI/KISS/DRY 準拠）
- Build & Type-check
  - `npx tsc --noEmit -p tsconfig.json` で型チェックを通過
  - 変更が実行物に影響する場合: `npx tsc -p tsconfig.json` でビルド成功
- Run / Test
  - 実行手順がある場合は手元確認（`node dist/src/index.js` 等）
  - テストがある場合は `npm test`（現状テスト未整備）
- Docs
  - 必要に応じて関連ドキュメント更新（`AGENTS.md` の作業報告形式に従う）
- Report
  - 「作業完了報告」フォーマットで、要点・変更点・影響範囲を簡潔に記述
