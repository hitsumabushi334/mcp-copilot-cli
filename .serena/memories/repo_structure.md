# Repository Structure (Rough)

- Root files
  - `package.json`, `package-lock.json`
  - `tsconfig.json`
  - `AGENTS.md`
  - `.gitignore`
- Directories
  - `src/`
    - `index.ts`
  - `.codex/`
  - `.serena/`
  - `.specify/`

Notes
- `.gitignore` に `node_modules/` のみ。`dist/` は無視されていないため、ビルド成果物をコミットするかは運用方針に依存。
