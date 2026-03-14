import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";
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

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class GitLabService {
  private client: AxiosInstance;
  private cache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_TTL = 30 * 1000; // 30 seconds

  constructor() {
    const httpsAgent = new https.Agent({
      keepAlive: true,
      keepAliveMsecs: 10000,
      maxSockets: 20,
      maxFreeSockets: 10,
      timeout: 60000,
    });

    this.client = axios.create({
      baseURL: GITLAB_API_URL,
      headers: {
        "PRIVATE-TOKEN": GITLAB_TOKEN,
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip, deflate, br",
      },
      httpsAgent,
      timeout: 30000,
    });
  }

  private generateCacheKey(url: string, config?: AxiosRequestConfig): string {
    return `${url}:${config?.params ? JSON.stringify(config.params) : ""}`;
  }

  async get<T>(url: string, config?: AxiosRequestConfig & { disableCache?: boolean }): Promise<T> {
    if (!config?.disableCache) {
      const cacheKey = this.generateCacheKey(url, config);
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data as T;
      }
    }

    const response = await this.client.get<T>(url, config);
    
    if (!config?.disableCache) {
      const cacheKey = this.generateCacheKey(url, config);
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }

    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const gitlab = new GitLabService();
