import { z } from "zod";
import { gitlab, handleApiError } from "../services/gitlab.js";
import { GitLabIssue } from "../types.js";
import { ListIssuesSchema, CreateIssueSchema } from "../schemas/issues.js";

export async function listIssues(params: z.infer<typeof ListIssuesSchema>) {
  try {
    const response = await gitlab.get<GitLabIssue[]>(`/projects/${params.project_id}/issues`, {
      params: {
        state: params.state,
        labels: params.labels,
        search: params.search,
        per_page: params.limit
      }
    });

    const issues = response.data.map(i => ({
      iid: i.iid,
      title: i.title,
      state: i.state,
      author: i.author.username,
      labels: i.labels,
      url: i.web_url,
      created_at: i.created_at
    }));

    return {
      content: [{ type: "text" as const, text: JSON.stringify(issues, null, 2) }]
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
    const response = await gitlab.post<GitLabIssue>(`/projects/${params.project_id}/issues`, {
      title: params.title,
      description: params.description,
      labels: params.labels
    });

    return {
      content: [{ type: "text" as const, text: `Issue created successfully: ${response.data.web_url}` }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: handleApiError(error, "create_issue") }]
    };
  }
}
