import { z } from "zod";
import { gitlab, handleApiError } from "../services/gitlab.js";
import { projectResolver } from "../services/project-resolver.js";
import { ListPipelinesSchema, GetPipelineJobsSchema, GetJobLogSchema } from "../schemas/ci-cd.js";

export async function listPipelines(params: z.infer<typeof ListPipelinesSchema>) {
  try {
    const projectId = await projectResolver.resolve(params.project_id);
    const pipelinesData = await gitlab.get<any[]>(`/projects/${projectId}/pipelines`, {
      params: {
        status: params.status,
        ref: params.ref,
        per_page: params.limit,
      },
    });

    const pipelines = pipelinesData.map(p => 
      `- #${p.id} (Status: **${p.status}**) - Ref: \`${p.ref}\` - [View Pipeline](${p.web_url})`
    ).join("\n");

    return {
      content: [{ type: "text" as const, text: pipelines || "No pipelines found." }],
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: handleApiError(error, "list_pipelines") }],
    };
  }
}

export async function getPipelineJobs(params: z.infer<typeof GetPipelineJobsSchema>) {
  try {
    const projectId = await projectResolver.resolve(params.project_id);
    const jobsData = await gitlab.get<any[]>(`/projects/${projectId}/pipelines/${params.pipeline_id}/jobs`, {
      params: {
        scope: params.scope,
        per_page: 50,
      },
    });

    const jobs = jobsData.map(j => 
      `- Job #${j.id}: **${j.name}** (Stage: ${j.stage}) - Status: **${j.status}** - [View Job](${j.web_url})`
    ).join("\n");

    return {
      content: [{ type: "text" as const, text: jobs || "No jobs found for this pipeline." }],
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: handleApiError(error, "get_pipeline_jobs") }],
    };
  }
}

export async function getJobLog(params: z.infer<typeof GetJobLogSchema>) {
  try {
    const projectId = await projectResolver.resolve(params.project_id);
    const traceData = await gitlab.get<string>(`/projects/${projectId}/jobs/${params.job_id}/trace`, {
      responseType: "text",
    });

    if (!traceData) {
      return {
        content: [{ type: "text" as const, text: "Job log is empty or could not be retrieved." }],
      };
    }

    // Process the log text
    const allLines = typeof traceData === 'string' ? traceData.split('\n') : JSON.stringify(traceData).split('\n');
    const tailLinesCount = params.tail_lines || 200;
    const truncatedLines = allLines.slice(-tailLinesCount);
    
    let resultText = `### Job #${params.job_id} Trace (Last ${truncatedLines.length} lines):\n\n\`\`\`log\n${truncatedLines.join('\n')}\n\`\`\``;

    // Append the auto-analysis prompting
    resultText += `\n\n---\n**ANALYSIS REQUIRED:** Based on the log trace above, please identify the root cause of the failure. Consider all possibilities:\n1. **Source Code/Logic Error:** If a specific file and line number are mentioned, use the \`gitlab_get_file_contents\` tool to inspect the application code.\n2. **Test Failure:** If tests are failing, inspect the relevant test file and the code it covers.\n3. **CI/CD Configuration Issue:** If the failure is related to environment variables, missing dependencies, or runner environments, consider inspecting the \`.gitlab-ci.yml\` or related build scripts (e.g., \`package.json\`, \`Dockerfile\`).\n\nOnce you have identified the root cause, propose a concrete fix.`;

    return {
      content: [{ type: "text" as const, text: resultText }],
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: handleApiError(error, "get_job_log") }],
    };
  }
}
