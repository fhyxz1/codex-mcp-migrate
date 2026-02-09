#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import * as TOML from "@iarna/toml";
import { createLogger } from "./logger.js";
import { expandHome, ensureDir, readFileIfExists, timestampForFile, writeFileAtomic } from "./io.js";
import { migrateConfig } from "./migrate.js";
import { inputSchema, type InputJson } from "./schema.js";

interface CliOptions {
  json?: string;
  toml?: string;
  dryRun: boolean;
  backup: boolean;
  backupDir: string;
  verbose: boolean;
}

class CliError extends Error {
  public readonly exitCode: number;

  constructor(message: string, exitCode: number) {
    super(message);
    this.exitCode = exitCode;
  }
}

function formatStats(stats: ReturnType<typeof migrateConfig>["stats"]): string {
  return [
    `added=${stats.added.length}`,
    `updated=${stats.updated.length}`,
    `unchanged=${stats.unchanged.length}`,
    `warnings=${stats.warnings.length}`
  ].join(" ");
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveJsonPath(inputPath?: string): Promise<string> {
  if (inputPath) {
    return expandHome(inputPath);
  }

  const cwd = process.cwd();
  const candidates = ["mcp-config.json", "mcpconfig.json"];
  for (const candidate of candidates) {
    const candidatePath = path.join(cwd, candidate);
    if (await pathExists(candidatePath)) {
      return candidatePath;
    }
  }

  return path.join(cwd, "mcp-config.json");
}

async function resolveTomlPath(inputPath?: string): Promise<string> {
  if (inputPath) {
    return expandHome(inputPath);
  }

  const cwdConfig = path.join(process.cwd(), "config.toml");
  if (await pathExists(cwdConfig)) {
    return cwdConfig;
  }

  return expandHome("~/.codex/config.toml");
}

async function main(): Promise<void> {
  const program = new Command();
  program
    .name("codex-mcp-migrate")
    .description("Migrate mcp-config.json into Codex config.toml mcp_servers")
    .option("--json <path>", "Path to input mcp-config.json")
    .option("--toml <path>", "Path to target config.toml")
    .option("--dry-run", "Show migration summary without writing files", false)
    .option("--backup", "Backup TOML before writing", true)
    .option("--no-backup", "Disable backup before writing")
    .option("--backup-dir <path>", "Backup directory", "~/.codex/backups")
    .option("--verbose", "Verbose logging", false);

  program.parse(process.argv);
  const opts = program.opts<CliOptions>();
  const logger = createLogger(opts.verbose);

  const jsonPath = await resolveJsonPath(opts.json);
  const tomlPath = await resolveTomlPath(opts.toml);
  const backupDir = expandHome(opts.backupDir);

  logger.info(`Reading JSON from ${jsonPath}`);
  const jsonRaw = await fs.readFile(jsonPath, "utf8");
  let parsedInput: unknown;
  try {
    parsedInput = JSON.parse(jsonRaw);
  } catch (err) {
    throw new CliError(
      `ERROR [invalid_json] failed to parse ${jsonPath}: ${(err as Error).message}`,
      1
    );
  }

  const schemaResult = inputSchema.safeParse(parsedInput);
  if (!schemaResult.success) {
    throw new CliError(
      `ERROR [schema] ${schemaResult.error.issues.map((i) => i.message).join("; ")}`,
      2
    );
  }
  const input = schemaResult.data as InputJson;

  logger.info(`Reading TOML from ${tomlPath}`);
  const tomlRaw = await readFileIfExists(tomlPath);
  const tomlObject: Record<string, unknown> =
    tomlRaw === null ? {} : (TOML.parse(tomlRaw) as unknown as Record<string, unknown>);

  let result: ReturnType<typeof migrateConfig>;
  try {
    result = migrateConfig(input.mcpServers, tomlObject);
  } catch (err) {
    throw new CliError((err as Error).message, 2);
  }
  for (const warning of result.stats.warnings) {
    logger.warn(warning);
  }

  const serialized = TOML.stringify(result.mergedTomlObject as TOML.JsonMap);
  console.log(`Migration summary: ${formatStats(result.stats)}`);
  if (result.stats.added.length > 0) console.log(`Added: ${result.stats.added.join(", ")}`);
  if (result.stats.updated.length > 0) console.log(`Updated: ${result.stats.updated.join(", ")}`);
  if (result.stats.unchanged.length > 0) console.log(`Unchanged: ${result.stats.unchanged.join(", ")}`);

  if (opts.dryRun) {
    console.log("Dry-run mode: no file changes were made.");
    return;
  }

  await ensureDir(path.dirname(tomlPath));
  if (opts.backup) {
    const existing = await readFileIfExists(tomlPath);
    if (existing !== null) {
      await ensureDir(backupDir);
      const backupName = `config.toml.${timestampForFile()}.bak`;
      const backupPath = path.join(backupDir, backupName);
      try {
        await fs.writeFile(backupPath, existing, "utf8");
      } catch (err) {
        throw new CliError(
          `ERROR [write_failure] failed to write backup ${backupPath}: ${(err as Error).message}`,
          3
        );
      }
      console.log(`Backup created: ${backupPath}`);
    }
  }

  try {
    await writeFileAtomic(tomlPath, serialized);
  } catch (err) {
    throw new CliError(
      `ERROR [write_failure] failed to write ${tomlPath}: ${(err as Error).message}`,
      3
    );
  }
  console.log(`Migration complete: ${tomlPath}`);
}

main().catch((err) => {
  if (err instanceof CliError) {
    console.error(err.message);
    process.exit(err.exitCode);
  }
  console.error((err as Error).message);
  process.exit(1);
});
