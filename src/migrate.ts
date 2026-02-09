import type { McpServerJson } from "./schema.js";

export interface MigrationStats {
  added: string[];
  updated: string[];
  unchanged: string[];
  warnings: string[];
}

export interface MigrationResult {
  mergedTomlObject: Record<string, unknown>;
  stats: MigrationStats;
}

type TomlObject = Record<string, unknown>;

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function toTomlSerializable(value: unknown, path: string): unknown {
  if (value === null) {
    throw new Error(`Unsupported null at ${path}`);
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item, index) => toTomlSerializable(item, `${path}[${index}]`));
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = toTomlSerializable(v, `${path}.${k}`);
    }
    return out;
  }
  throw new Error(`Unsupported type at ${path}: ${typeof value}`);
}

function normalizeServer(server: McpServerJson, name: string, warnings: string[]): TomlObject {
  const normalized: TomlObject = {};

  if (server.command !== undefined) normalized.command = server.command;
  if (server.args !== undefined) normalized.args = server.args;
  if (server.env !== undefined) normalized.env = server.env;
  if (server.cwd !== undefined) normalized.cwd = server.cwd;
  if (server.url !== undefined) normalized.url = server.url;
  if (server.bearer_token_env_var !== undefined) {
    normalized.bearer_token_env_var = server.bearer_token_env_var;
  }
  if (server.headers !== undefined) normalized.headers = server.headers;

  if (server.command !== undefined && server.url !== undefined) {
    warnings.push(
      `WARN [mixed_transport] server=${name} has both command and url; keeping both for compatibility`
    );
  }

  const reserved = new Set([
    "command",
    "args",
    "env",
    "cwd",
    "url",
    "bearer_token_env_var",
    "headers"
  ]);

  for (const [key, value] of Object.entries(server)) {
    if (reserved.has(key) || value === undefined) {
      continue;
    }
    normalized[key] = toTomlSerializable(value, `mcpServers.${name}.${key}`);
  }

  return normalized;
}

export function migrateConfig(
  inputServers: Record<string, McpServerJson>,
  tomlObject: Record<string, unknown>
): MigrationResult {
  const merged: Record<string, unknown> = { ...tomlObject };
  const stats: MigrationStats = {
    added: [],
    updated: [],
    unchanged: [],
    warnings: []
  };

  const existingMcp = (merged.mcp_servers ?? {}) as Record<string, unknown>;
  const nextMcp: Record<string, unknown> = { ...existingMcp };

  for (const [name, server] of Object.entries(inputServers)) {
    if (!name.trim()) {
      throw new Error("ERROR [schema] server name must be non-empty");
    }
    const normalized = normalizeServer(server, name, stats.warnings);
    const current = nextMcp[name];
    if (current === undefined) {
      nextMcp[name] = normalized;
      stats.added.push(name);
      continue;
    }
    if (deepEqual(current, normalized)) {
      stats.unchanged.push(name);
      continue;
    }
    nextMcp[name] = normalized;
    stats.updated.push(name);
  }

  merged.mcp_servers = nextMcp;
  return {
    mergedTomlObject: merged,
    stats
  };
}
