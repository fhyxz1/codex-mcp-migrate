import { describe, expect, it } from "vitest";
import { migrateConfig } from "../src/migrate.js";

describe("migrateConfig", () => {
  it("maps command and args to mcp_servers", () => {
    const result = migrateConfig(
      {
        "builder-proj": {
          command: "npx",
          args: ["builder-proj-mcp"]
        }
      },
      { model: "gpt-5.3-codex" }
    );

    expect(result.mergedTomlObject.model).toBe("gpt-5.3-codex");
    expect(result.mergedTomlObject.mcp_servers).toEqual({
      "builder-proj": {
        command: "npx",
        args: ["builder-proj-mcp"]
      }
    });
    expect(result.stats.added).toEqual(["builder-proj"]);
  });

  it("updates existing same-name server and preserves others", () => {
    const result = migrateConfig(
      {
        "builder-proj": {
          command: "npx",
          args: ["builder-proj-mcp"]
        }
      },
      {
        mcp_servers: {
          "builder-proj": {
            command: "node",
            args: ["old.js"]
          },
          another: {
            command: "uvx",
            args: ["something"]
          }
        }
      }
    );

    expect((result.mergedTomlObject.mcp_servers as Record<string, unknown>)["another"]).toEqual({
      command: "uvx",
      args: ["something"]
    });
    expect((result.mergedTomlObject.mcp_servers as Record<string, unknown>)["builder-proj"]).toEqual({
      command: "npx",
      args: ["builder-proj-mcp"]
    });
    expect(result.stats.updated).toEqual(["builder-proj"]);
  });

  it("is idempotent when same input is applied twice", () => {
    const first = migrateConfig(
      {
        "builder-proj": {
          command: "npx",
          args: ["builder-proj-mcp"]
        }
      },
      {}
    );
    const second = migrateConfig(
      {
        "builder-proj": {
          command: "npx",
          args: ["builder-proj-mcp"]
        }
      },
      first.mergedTomlObject
    );
    expect(second.stats.unchanged).toEqual(["builder-proj"]);
    expect(second.stats.updated).toHaveLength(0);
    expect(second.stats.added).toHaveLength(0);
  });

  it("passes through supported extended fields", () => {
    const result = migrateConfig(
      {
        httpSrv: {
          url: "https://example.com/mcp",
          bearer_token_env_var: "MCP_TOKEN",
          headers: {
            "x-tenant": "abc"
          }
        }
      },
      {}
    );
    expect((result.mergedTomlObject.mcp_servers as Record<string, unknown>).httpSrv).toEqual({
      url: "https://example.com/mcp",
      bearer_token_env_var: "MCP_TOKEN",
      headers: {
        "x-tenant": "abc"
      }
    });
  });
});
