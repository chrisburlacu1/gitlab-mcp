import { z } from "zod";

export const GetFileContentsSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID of the project, or a search term/path (e.g., 'namespace/project' or 'ollama widget') to automatically resolve."),
  file_path: z.string().describe("Full path to the file"),
  ref: z.string().optional().default("main").describe("Branch name, tag, or commit SHA"),
  start_line: z.number().optional().describe("Optional starting line number (1-based) to read"),
  end_line: z.number().optional().describe("Optional ending line number to read")
}).strict();

export const GetMultipleFilesSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID of the project, or a search term/path to automatically resolve."),
  file_paths: z.array(z.string()).describe("Array of full paths to the files"),
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

export const GetProjectStackSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID of the project, or a search term/path to automatically resolve.")
}).strict();

export const ReadImportedFileSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID of the project, or a search term/path to automatically resolve."),
  source_file_path: z.string().describe("The path of the file containing the import (e.g., 'src/main.ts')"),
  import_string: z.string().describe("The literal import string (e.g., '../utils/auth')"),
  ref: z.string().optional().default("main").describe("Branch name, tag, or commit SHA")
}).strict();
