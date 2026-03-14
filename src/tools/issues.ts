import { z } from "zod";
import { gitlab, handleApiError } from "../services/gitlab.js";
import { GitLabIssue } from "../types.js";
import { ListIssuesSchema, CreateIssueSchema } from "../schemas/issues.js";

export async function listIssues(params: z.infer<typeof ListIssuesSchema>) {
  try {
    const issuesData = await gitlab.get<GitLabIssue[]>(`/projects/${params.project_id}/issues`, {
      params: {
        state: params.state,
        labels: params.labels,
        search: params.search,
        per_page: params.limit
      }
    });

    const issues = issuesData.map(i => 
      `- #${i.iid} [${i.title}](${i.web_url}) (State: ${i.state}) - @${i.author.username}${i.labels.length ? ` - Labels: ${i.labels.join(", ")}` : ""}`
    ).join("\n");

    return {
      content: [{ type: "text" as const, text: issues || "No issues found." }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: handleApiError(error, "list_issues") }]
    };
  }
}

export async function createIssue(params: z.infer<typeof CreateIssueSchema>) {
  try {
    const issueData = await gitlab.post<GitLabIssue>(`/projects/${params.project_id}/issues`, {
      title: params.title,
      description: params.description,
      labels: params.labels
    });

    return {
      content: [{ type: "text" as const, text: `Issue created successfully: ${issueData.web_url}` }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: handleApiError(error, "create_issue") }]
    };
  }
}
