import { z } from "zod";

export const GetFileContentsSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID, path, name, or shorthand shortcut of the project. The server automatically resolves these, so DO NOT call gitlab_search_projects first if you already have a name or path."),
  file_path: z.string().describe("Full path to the file"),
  ref: z.string().optional().default("main").describe("Branch name, tag, or commit SHA"),
  start_line: z.number().optional().describe("Optional starting line number (1-based) to read"),
  end_line: z.number().optional().describe("Optional ending line number to read")
}).strict();

export const GetMultipleFilesSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID, path, name, or shorthand shortcut of the project. The server automatically resolves these, so DO NOT call gitlab_search_projects first if you already have a name or path."),
  file_paths: z.array(z.string()).describe("Array of full paths to the files"),
  ref: z.string().optional().default("main").describe("Branch name, tag, or commit SHA")
}).strict();

export const GetRepositoryTreeSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID, path, name, or shorthand shortcut of the project. The server automatically resolves these, so DO NOT call gitlab_search_projects first if you already have a name or path."),
  path: z.string().optional().describe("Optional: Sub-directory to start the tree from"),
  ref: z.string().optional().default("main").describe("Branch name, tag, or commit SHA"),
  recursive: z.boolean().optional().default(true).describe("Whether to list files recursively")
}).strict();

export const CreateBranchSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID, path, name, or shorthand shortcut of the project. The server automatically resolves these, so DO NOT call gitlab_search_projects first if you already have a name or path."),
  branch: z.string().describe("Name of the new branch"),
  ref: z.string().describe("Source branch, tag, or commit SHA to create the branch from")
}).strict();

export const GetProjectStackSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID, path, name, or shorthand shortcut of the project. The server automatically resolves these, so DO NOT call gitlab_search_projects first if you already have a name or path.")
}).strict();

export const ReadImportedFileSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID, path, name, or shorthand shortcut of the project. The server automatically resolves these, so DO NOT call gitlab_search_projects first if you already have a name or path."),
  source_file_path: z.string().describe("The path of the file containing the import (e.g., 'src/main.ts')"),
  import_string: z.string().describe("The literal import string (e.g., '../utils/auth')"),
  ref: z.string().optional().default("main").describe("Branch name, tag, or commit SHA")
}).strict();

export const GetFileBlameSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID, path, name, or shorthand shortcut of the project. The server automatically resolves these, so DO NOT call gitlab_search_projects first if you already have a name or path."),
  file_path: z.string().describe("Full path to the file"),
  ref: z.string().optional().default("main").describe("Branch name, tag, or commit SHA")
}).strict();

export const ListCommitsSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID, path, name, or shorthand shortcut of the project. The server automatically resolves these, so DO NOT call gitlab_search_projects first if you already have a name or path."),
  ref_name: z.string().optional().describe("The name of a repository branch or tag or if not given the default branch"),
  path: z.string().optional().describe("The file path"),
  limit: z.number().optional().default(20).describe("Maximum number of commits to return (default: 20)")
}).strict();

export const GetCommitSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID, path, name, or shorthand shortcut of the project. The server automatically resolves these, so DO NOT call gitlab_search_projects first if you already have a name or path."),
  commit_sha: z.string().describe("The commit hash or name of a repository branch or tag")
}).strict();
