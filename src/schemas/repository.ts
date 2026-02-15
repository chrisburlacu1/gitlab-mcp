import { z } from "zod";

export const GetFileContentsSchema = z.object({
  project_id: z.number().describe("The ID of the project"),
  file_path: z.string().describe("Full path to the file"),
  ref: z.string().optional().default("main").describe("Branch name, tag, or commit SHA")
}).strict();
