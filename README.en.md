# codex-mcp-migrate (EN)

[中文](README.md) | English

A flexible and reliable migration tool from `mcpconfig.json` / `mcp-config.json` to Codex `config.toml`.

## Quick Start

### Option 1: Global install
```powershell
npm i -g codex-mcp-migrate
codex-mcp-migrate --dry-run
codex-mcp-migrate
```

### Option 2: npx
```powershell
npx codex-mcp-migrate --dry-run
npx codex-mcp-migrate
```

## Migration Flow

1. Prepare your source file: `mcpconfig.json` or `mcp-config.json`.
2. Place your target `config.toml` in the same directory (or pass `--toml`).
3. Run `--dry-run` to preview added/updated/unchanged servers.
4. Run without `--dry-run` to apply migration.
5. If needed, roll back with backup from `~/.codex/backups`.

## Auto-Detection

When `--json` / `--toml` are not provided:
- JSON: first existing file from `./mcp-config.json`, `./mcpconfig.json`
- TOML: `./config.toml`; fallback to `~/.codex/config.toml`

## CLI Options

- `--json <path>` input JSON file
- `--toml <path>` target TOML file
- `--dry-run` preview only, no write
- `--backup` backup before writing (default)
- `--no-backup` disable backup
- `--backup-dir <path>` backup folder (default `~/.codex/backups`)
- `--verbose` verbose logs

## Exit Codes

- `0` success
- `1` runtime/IO/parse error
- `2` schema validation error
- `3` write failure
