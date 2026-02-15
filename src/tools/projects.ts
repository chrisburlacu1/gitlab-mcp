import { z } from "zod";
import { gitlab, handleApiError } from "../services/gitlab.js";
import { GitLabProject } from "../types.js";
import { SearchProjectsSchema, GetProjectSchema } from "../schemas/projects.js";

export async function searchProjects(params: z.infer<typeof SearchProjectsSchema>) {
  try {
    const response = await gitlab.get<GitLabProject[]>("/projects", {
      params: {
        search: params.search,
        membership: params.membership,
        per_page: params.limit,
        order_by: "last_activity_at"
      }
    });

    const projects = response.data.map(p => ({
      id: p.id,
      name: p.name_with_namespace,
      url: p.web_url,
      description: p.description,
      last_activity: p.last_activity_at
    }));

    return {
      content: [{ type: "text" as const, text: JSON.stringify(projects, null, 2) }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: handleApiError(error, "search_projects") }]
    };
  }
}

export async function getProject(params: z.infer<typeof GetProjectSchema>) {
  try {
    const response = await gitlab.get<GitLabProject>(`/projects/${params.project_id}`);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(response.data, null, 2) }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: handleApiError(error, "get_project") }]
    };
  }
}
