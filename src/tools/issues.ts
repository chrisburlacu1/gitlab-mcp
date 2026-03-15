import { z } from "zod";
import { gitlab, handleApiError } from "../services/gitlab.js";
import { projectResolver } from "../services/project-resolver.js";
import { GitLabIssue } from "../types.js";
import { ListIssuesSchema, CreateIssueSchema, GetIssueSchema, UpdateIssueSchema } from "../schemas/issues.js";

export async function listIssues(params: z.infer<typeof ListIssuesSchema>) {
  try {
    const projectId = await projectResolver.resolve(params.project_id);
    const issuesData = await gitlab.get<GitLabIssue[]>(`/projects/${projectId}/issues`, {
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
    const projectId = await projectResolver.resolve(params.project_id);
    const issueData = await gitlab.post<GitLabIssue>(`/projects/${projectId}/issues`, {
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

export async function getIssue(params: z.infer<typeof GetIssueSchema>) {
  try {
    const projectId = await projectResolver.resolve(params.project_id);
    const issueData = await gitlab.get<GitLabIssue>(`/projects/${projectId}/issues/${params.issue_iid}`);

    const assignees = issueData.assignees?.map(a => `@${a.username}`).join(", ") || "None";
    const labels = issueData.labels?.join(", ") || "None";

    const issueText = [
      `# Issue #${issueData.iid}: ${issueData.title}`,
      `**State:** ${issueData.state} | **Author:** @${issueData.author.username} | **Assignees:** ${assignees}`,
      `**Labels:** ${labels}`,
      `**URL:** ${issueData.web_url}`,
      `\n## Description\n`,
      issueData.description || "No description provided."
    ].join("\n");

    return {
      content: [{ type: "text" as const, text: issueText }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: handleApiError(error, "get_issue") }]
    };
  }
}

export async function updateIssue(params: z.infer<typeof UpdateIssueSchema>) {
  try {
    const projectId = await projectResolver.resolve(params.project_id);
    
    // Construct the payload based on provided params
    const payload: any = {};
    if (params.state_event) payload.state_event = params.state_event;
    if (params.labels !== undefined) payload.labels = params.labels;
    if (params.add_labels) payload.add_labels = params.add_labels;
    if (params.remove_labels) payload.remove_labels = params.remove_labels;
    if (params.assignee_ids !== undefined) payload.assignee_ids = params.assignee_ids;
    if (params.description !== undefined) payload.description = params.description;

    const issueData = await gitlab.put<GitLabIssue>(`/projects/${projectId}/issues/${params.issue_iid}`, payload);

    return {
      content: [{ type: "text" as const, text: `Issue #${issueData.iid} updated successfully: ${issueData.web_url}` }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: handleApiError(error, "update_issue") }]
    };
  }
}
