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

    const projects = response.data.map(p => 
      `- [${p.name_with_namespace}](${p.web_url}) (ID: ${p.id})${p.description ? ` - ${p.description}` : ""}`
    ).join("\n");

    return {
      content: [{ type: "text" as const, text: projects || "No projects found." }]
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
    const p = response.data;
    
    const projectInfo = [
      `# [${p.name_with_namespace}](${p.web_url}) (ID: ${p.id})`,
      p.description ? `> ${p.description}\n` : "",
      `- **Path:** \`${p.path_with_namespace}\``,
      `- **Default Branch:** \`${p.default_branch}\``,
      `- **Stars:** ${p.star_count} | **Forks:** ${p.forks_count}`,
      `- **Created At:** ${p.created_at}`,
      `- **Last Activity:** ${p.last_activity_at}`,
      `- **SSH URL:** \`${p.ssh_url_to_repo}\``,
      `- **HTTP URL:** \`${p.http_url_to_repo}\``
    ].filter(Boolean).join("\n");

    return {
      content: [{ type: "text" as const, text: projectInfo }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: handleApiError(error, "get_project") }]
    };
  }
}
