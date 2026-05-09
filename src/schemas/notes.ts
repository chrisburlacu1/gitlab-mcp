import { z } from "zod";

export const CreateNoteSchema = z.object({
  project_id: z.union([z.number(), z.string()]).describe("The ID, path, name, or shorthand shortcut of the project. The server automatically resolves these, so DO NOT call gitlab_search_projects first if you already have a name or path."),
  entity_type: z.enum(["issue", "merge_request"]).describe("The type of entity to comment on"),
  entity_iid: z.number().describe("The IID (internal ID) of the issue or MR"),
  body: z.string().describe("The content of the comment")
}).strict();
