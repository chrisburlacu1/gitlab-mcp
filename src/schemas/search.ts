import { z } from "zod";

export const SearchCodeSchema = z.object({
  query: z.string().describe("The search query or symbol to find"),
  project_id: z.union([z.number(), z.string()]).optional().describe("Optional: Scope the search to a specific project. Can be ID, path, or alias."),
  group_id: z.union([z.number(), z.string()]).optional().describe("Optional: Scope the search to a specific group ID or path.")
}).strict();
