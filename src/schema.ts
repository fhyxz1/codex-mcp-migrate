import { z } from "zod";

const stringRecord = z.record(z.string());

export const mcpServerJsonSchema = z
  .object({
  command: z.string().min(1).optional(),
  args: z.array(z.string()).optional(),
  env: stringRecord.optional(),
  cwd: z.string().min(1).optional(),
  url: z.string().min(1).optional(),
  bearer_token_env_var: z.string().min(1).optional(),
  headers: stringRecord.optional()
  })
  .catchall(z.unknown());

export const inputSchema = z.object({
  mcpServers: z.record(mcpServerJsonSchema)
});

export type InputJson = z.infer<typeof inputSchema>;
export type McpServerJson = z.infer<typeof mcpServerJsonSchema>;
