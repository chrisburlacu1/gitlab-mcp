import { z } from "zod";
import { gitlab, handleApiError } from "../services/gitlab.js";
import { projectResolver } from "../services/project-resolver.js";
import { GitLabNote } from "../types.js";
import { CreateNoteSchema, GetDiscussionsSchema } from "../schemas/notes.js";

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

export async function getDiscussions(params: z.infer<typeof GetDiscussionsSchema>) {
  try {
    const projectId = await projectResolver.resolve(params.project_id);
    const endpoint = params.entity_type === "issue" ? "issues" : "merge_requests";
    const discussions = await gitlab.get<any[]>(`/projects/${projectId}/${endpoint}/${params.entity_iid}/discussions`);

    if (!discussions || discussions.length === 0) {
      return {
        content: [{ type: "text" as const, text: `No discussions found for ${params.entity_type} #${params.entity_iid}.` }]
      };
    }

    let report = `## Discussions for ${params.entity_type} #${params.entity_iid}\n\n`;

    discussions.forEach((discussion, index) => {
      report += `### Thread ${index + 1}\n`;
      discussion.notes.forEach((note: any) => {
        const date = new Date(note.created_at).toLocaleString();
        const author = note.author.name;
        const systemIcon = note.system ? "⚙️ " : "";
        report += `**${author}** (${date}) ${systemIcon}\n`;
        report += `${note.body}\n\n`;
        report += `---\n\n`;
      });
    });

    return {
      content: [{ type: "text" as const, text: report }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: handleApiError(error, "get_discussions") }]
    };
  }
}
