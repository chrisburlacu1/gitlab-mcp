import axios, { AxiosInstance, AxiosError } from "axios";
import https from "https";
import dotenv from "dotenv";
import { GITLAB_API_URL } from "../constants.js";

dotenv.config();

const GITLAB_TOKEN = process.env.GITLAB_PERSONAL_ACCESS_TOKEN;

if (!GITLAB_TOKEN) {
  console.error(
    "Error: GITLAB_PERSONAL_ACCESS_TOKEN is not set in environment variables.",
  );
  process.exit(1);
}

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 20,
});

export const gitlab: AxiosInstance = axios.create({
  baseURL: GITLAB_API_URL,
  headers: {
    "PRIVATE-TOKEN": GITLAB_TOKEN,
    "Content-Type": "application/json",
  },
  httpsAgent,
  timeout: 30000,
});

export function handleApiError(error: unknown, context: string): string {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (status === 401) {
      return `GitLab API Error [${context}]: Unauthorized. Please check your GITLAB_PERSONAL_ACCESS_TOKEN.`;
    }
    if (status === 403) {
      return `GitLab API Error [${context}]: Forbidden. You may not have permission to access this resource.`;
    }
    if (status === 404) {
      return `GitLab API Error [${context}]: Not Found. The resource does not exist or you do not have access to it.`;
    }

    return `GitLab API Error [${context}]: ${status} - ${JSON.stringify(message)}`;
  }

  return `Unexpected Error [${context}]: ${error instanceof Error ? error.message : String(error)}`;
}
