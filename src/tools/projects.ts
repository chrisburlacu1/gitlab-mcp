import { z } from "zod";
import { gitlab, handleApiError } from "../services/gitlab.js";
import { projectResolver } from "../services/project-resolver.js";
import { GitLabProject } from "../types.js";
import { SearchProjectsSchema, GetProjectSchema } from "../schemas/projects.js";

export async function searchProjects(params: z.infer<typeof SearchProjectsSchema>) {
  try {
    const projectsData = await gitlab.get<GitLabProject[]>("/projects", {
      params: {
        search: params.search,
        membership: params.membership,
        per_page: params.limit,
        order_by: "last_activity_at",
        simple: true
      }
    });

    const projects = projectsData.map(p => 
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
    const projectId = await projectResolver.resolve(params.project_id);
    const [p, issues, mrs] = await Promise.all([
      gitlab.get<GitLabProject>(`/projects/${projectId}`),
      gitlab.get<any[]>(`/projects/${projectId}/issues`, { params: { per_page: 3, state: "opened" } }).catch(() => []),
      gitlab.get<any[]>(`/projects/${projectId}/merge_requests`, { params: { per_page: 3, state: "opened" } }).catch(() => [])
    ]);
    
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
    ];

    if (issues && issues.length > 0) {
      projectInfo.push(`\n### Recent Open Issues\n` + issues.map((i: any) => `- #${i.iid} [${i.title}](${i.web_url})`).join("\n"));
    }

    if (mrs && mrs.length > 0) {
      projectInfo.push(`\n### Recent Open Merge Requests\n` + mrs.map((m: any) => `- !${m.iid} [${m.title}](${m.web_url})`).join("\n"));
    }

    return {
      content: [{ type: "text" as const, text: projectInfo.filter(Boolean).join("\n") }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: handleApiError(error, "get_project") }]
    };
  }
}
