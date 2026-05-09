import { z } from "zod";

export const SearchCodeSchema = z.object({
  query: z.string().describe("The search query or symbol to find"),
  project_id: z.union([z.number(), z.string()]).optional().describe("Optional: The ID, path, name, or shorthand shortcut of the project. The server automatically resolves these, so DO NOT call gitlab_search_projects first if you already have a name or path."),
  group_id: z.union([z.number(), z.string()]).optional().describe("Optional: Scope the search to a specific group ID or path.")
}).strict();

export const FindDefinitionsSchema = z.object({
  query: z.string().describe("The name of the class, function, or symbol to find the definition of"),
  project_id: z.union([z.number(), z.string()]).optional().describe("Optional: The ID, path, name, or shorthand shortcut of the project. The server automatically resolves these, so DO NOT call gitlab_search_projects first if you already have a name or path."),
  group_id: z.union([z.number(), z.string()]).optional().describe("Optional: Scope the search to a specific group")
}).strict();

export const FindUsagesSchema = z.object({
  query: z.string().describe("The symbol name to find usages of"),
  project_id: z.union([z.number(), z.string()]).describe("The ID, path, name, or shorthand shortcut of the project. The server automatically resolves these, so DO NOT call gitlab_search_projects first if you already have a name or path. Required for Free Tier code search."),
  file_extension: z.string().optional().describe("Optional: Filter by file extension (e.g., 'ts', 'py', 'go')")
}).strict();
