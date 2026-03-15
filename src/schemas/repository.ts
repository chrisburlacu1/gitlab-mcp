import { z } from "zod";

export const GetFileContentsSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID of the project, or a search term/path (e.g., 'namespace/project' or 'ollama widget') to automatically resolve."),
  file_path: z.string().describe("Full path to the file"),
  ref: z.string().optional().default("main").describe("Branch name, tag, or commit SHA")
}).strict();

export const GetRepositoryTreeSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID of the project, or a search term/path (e.g., 'namespace/project' or 'ollama widget') to automatically resolve."),
  path: z.string().optional().describe("Optional: Sub-directory to start the tree from"),
  ref: z.string().optional().default("main").describe("Branch name, tag, or commit SHA"),
  recursive: z.boolean().optional().default(true).describe("Whether to list files recursively")
}).strict();

export const CreateBranchSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID of the project, or a search term/path to automatically resolve."),
  branch: z.string().describe("Name of the new branch"),
  ref: z.string().describe("Source branch, tag, or commit SHA to create the branch from")
}).strict();
