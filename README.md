# codex-mcp-migrate

Convert `mcp-config.json` (or `mcpconfig.json`) to Codex `config.toml` (`mcp_servers`) with incremental merge.

将 `mcp-config.json`（或 `mcpconfig.json`）增量合并到 Codex `config.toml` 的 `mcp_servers` 配置中。

## Install / Run

### Global install
```powershell
npm i -g codex-mcp-migrate
codex-mcp-migrate --dry-run
codex-mcp-migrate
```

### 全局安装
```powershell
npm i -g codex-mcp-migrate
codex-mcp-migrate --dry-run
codex-mcp-migrate
```

### Via npx (after you publish)
```powershell
npx codex-mcp-migrate --dry-run
npx codex-mcp-migrate
```

### 通过 npx 运行（发布后）
```powershell
npx codex-mcp-migrate --dry-run
npx codex-mcp-migrate
```

### Local development
```powershell
npm install
npm run build
node .\dist\cli.js --dry-run
```

### 本地开发
```powershell
npm install
npm run build
node .\dist\cli.js --dry-run
```

## Zero-arg auto-detect
If no `--json`/`--toml` args are passed:
- JSON: first existing file from `./mcp-config.json`, `./mcpconfig.json`
- TOML: `./config.toml`; fallback to `~/.codex/config.toml`

## 无参数自动探测
当不传 `--json` / `--toml` 时：
- JSON：优先查找 `./mcp-config.json`，其次 `./mcpconfig.json`
- TOML：优先使用 `./config.toml`，否则回退到 `~/.codex/config.toml`

## CLI options
- `--json <path>` input JSON file
- `--toml <path>` target TOML file
- `--dry-run` preview only, no write
- `--backup` backup before writing (default)
- `--no-backup` disable backup
- `--backup-dir <path>` backup folder (default `~/.codex/backups`)
- `--verbose` verbose logs

## CLI 参数
- `--json <path>` 输入 JSON 文件
- `--toml <path>` 目标 TOML 文件
- `--dry-run` 仅预览，不写入
- `--backup` 写入前备份（默认）
- `--no-backup` 关闭备份
- `--backup-dir <path>` 备份目录（默认 `~/.codex/backups`）
- `--verbose` 详细日志

## Exit codes
- `0` success
- `1` runtime/IO/parse error
- `2` schema validation error
- `3` write failure

## 退出码
- `0` 成功
- `1` 运行时 / IO / 解析错误
- `2` schema 校验错误
- `3` 写入失败
