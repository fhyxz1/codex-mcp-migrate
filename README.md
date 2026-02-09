# codex-mcp-migrate

中文 | [English](README.en.md)

`codex-mcp-migrate` 是一个灵活、可靠的迁移工具，用于将 `mcpconfig.json` / `mcp-config.json` 无缝迁移到 Codex `config.toml`。

## 快速开始

### 方式一：全局安装
```powershell
npm i -g codex-mcp-migrate
codex-mcp-migrate --dry-run
codex-mcp-migrate
```

### 方式二：npx 运行
```powershell
npx codex-mcp-migrate --dry-run
npx codex-mcp-migrate
```

## 迁移流程

1. 准备源配置文件：`mcpconfig.json` 或 `mcp-config.json`。
2. 在同目录放置目标 `config.toml`（或用 `--toml` 指定路径）。
3. 先执行 `--dry-run` 预览新增/更新/未变更结果。
4. 再执行正式命令完成迁移。
5. 如需回滚，可使用 `~/.codex/backups` 下的备份文件。

## 自动探测规则

未传 `--json` / `--toml` 时：
- JSON：按顺序探测 `./mcp-config.json`、`./mcpconfig.json`
- TOML：优先 `./config.toml`，否则回退 `~/.codex/config.toml`

## CLI 参数

- `--json <path>` 输入 JSON 文件
- `--toml <path>` 目标 TOML 文件
- `--dry-run` 仅预览，不写入
- `--backup` 写入前备份（默认）
- `--no-backup` 关闭备份
- `--backup-dir <path>` 备份目录（默认 `~/.codex/backups`）
- `--verbose` 详细日志

## 退出码

- `0` 成功
- `1` 运行时/IO/解析错误
- `2` schema 校验错误
- `3` 写入失败
