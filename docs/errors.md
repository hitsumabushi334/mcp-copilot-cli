# Error Taxonomy: MCP copilot-cli stdio server

This document defines typed errors and their detection heuristics for the `copilot.chat` tool.

## Typed Errors

- not_installed
  - Signal: spawn error `ENOENT` when launching `copilot`
  - Remediation: Install GitHub Copilot CLI and ensure it is on PATH

- not_logged_in
  - Signal: stderr contains phrases like `Please run "copilot login"` or `not logged in`
  - Remediation: Run `copilot login` and complete the flow

- unknown_option
  - Signal: stderr contains `unknown option` or `unknown flag` for `-p` / `--model`
  - Action: Trigger TTY fallback and retry with `/model <name>` prelude

- timeout
  - Signal: Execution exceeds 30s (non-interactive and TTY). Abort and return timeout
  - Remediation: Reduce prompt size, verify network/API status, increase timeout if allowed

- nonzero_exit
  - Signal: Process exits with non-zero code and does not match other typed errors
  - Remediation: Inspect stderr and command usage

- rate_limited
  - Signal: stderr contains `rate limit` / `too many requests` / `try again later`
  - Remediation: Backoff and retry later

- tty_unavailable
  - Signal: PTY spawn fails (e.g., platform limitation) when attempting fallback
  - Remediation: Ensure TTY support on platform, or use non-interactive path

- invalid_request
  - Signal: Zod validation failure for tool input (e.g., missing `input`, invalid `model`)
  - Remediation: Fix request data according to schema

- invalid_config
  - Signal: `config/models.json` fails Zod validation or cannot be parsed
  - Remediation: Fix configuration file; keep in sync with contract enum

## Notes

- Always prefer specific error types over `nonzero_exit` when patterns match.
- Keep patterns minimal and robust; avoid overfitting to transient wording.
- Update this list if CLI output formats change.

