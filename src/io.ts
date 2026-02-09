import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

export function expandHome(inputPath: string): string {
  if (inputPath === "~") {
    return os.homedir();
  }
  if (inputPath.startsWith("~/")) {
    return path.join(os.homedir(), inputPath.slice(2));
  }
  return inputPath;
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export function timestampForFile(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(
    date.getHours()
  )}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

export async function readFileIfExists(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "ENOENT") {
      return null;
    }
    throw err;
  }
}

export async function writeFileAtomic(targetPath: string, content: string): Promise<void> {
  const tmpPath = `${targetPath}.tmp-${process.pid}-${Date.now()}`;
  await fs.writeFile(tmpPath, content, "utf8");
  await fs.rename(tmpPath, targetPath);
}
