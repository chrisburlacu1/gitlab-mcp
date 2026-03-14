import { z } from "zod";
import { gitlab, handleApiError } from "../services/gitlab.js";
import { projectResolver } from "../services/project-resolver.js";
import { GitLabNote } from "../types.js";
import { CreateNoteSchema } from "../schemas/notes.js";

export async function createNote(params: z.infer<typeof CreateNoteSchema>) {
  try {
    const projectId = await projectResolver.resolve(params.project_id);
    const endpoint = params.entity_type === "issue" ? "issues" : "merge_requests";
    const noteData = await gitlab.post<GitLabNote>(`/projects/${projectId}/${endpoint}/${params.entity_iid}/notes`, {
      body: params.body
    });

    return {
      content: [{ type: "text" as const, text: `Comment added successfully: ${noteData.body}` }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: handleApiError(error, "create_note") }]
    };
  }
}
