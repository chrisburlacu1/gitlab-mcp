import { z } from "zod";

export const GetFileContentsSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID of the project, or a search term/path (e.g., 'namespace/project' or 'ollama widget') to automatically resolve."),
  file_path: z.string().describe("Full path to the file"),
  ref: z.string().optional().default("main").describe("Branch name, tag, or commit SHA")
}).strict();
