import { gitlab } from "./gitlab.js";
import { GitLabProject } from "../types.js";
import fs from "fs/promises";
import { readFileSync } from "fs";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), "project-cache.json");

class ProjectResolver {
  private registry: Record<string, number> = {};
  private savePromise: Promise<void> = Promise.resolve();
  private isInitialLoad: boolean = true;

  constructor() {
    this.loadRegistrySync();
  }

  private loadRegistrySync() {
    try {
      const data = readFileSync(CACHE_FILE, "utf-8");
      this.registry = JSON.parse(data);
      this.isInitialLoad = false;
    } catch (error) {
      this.registry = {};
      this.isInitialLoad = true;
    }
  }

  private async saveRegistry() {
    // Sequential write queue to prevent race conditions
    this.savePromise = this.savePromise.then(async () => {
      try {
        const tempFile = `${CACHE_FILE}.tmp`;
        const content = JSON.stringify(this.registry, null, 2);
        
        // Atomic write: write to temp file first, then rename
        await fs.writeFile(tempFile, content, "utf-8");
        await fs.rename(tempFile, CACHE_FILE);
      } catch (error) {
        console.error("Failed to save project registry:", error);
      }
    });
    
    return this.savePromise;
  }

  async resolve(identifier: string | number): Promise<number> {
    if (typeof identifier === "number") return identifier;
    
    const normalized = identifier.toLowerCase().trim();

    // If it looks like a numeric ID but passed as string
    const numericId = parseInt(normalized, 10);
    if (!isNaN(numericId) && numericId.toString() === normalized) {
      return numericId;
    }

    // Check memory registry first
    if (this.registry[normalized]) {
      return this.registry[normalized];
    }

    // Optimization: If the identifier contains a slash, it's likely a full path (namespace/project)
    // We can try to get it directly, which is more reliable than search for paths.
    if (normalized.includes("/")) {
      try {
        const encodedPath = encodeURIComponent(normalized);
        const project = await gitlab.get<GitLabProject>(`/projects/${encodedPath}`);
        if (project) {
          const id = project.id;
          this.registry[normalized] = id;
          this.registry[project.name.toLowerCase()] = id;
          this.registry[project.path.toLowerCase()] = id;
          this.registry[project.path_with_namespace.toLowerCase()] = id;
          await this.saveRegistry();
          return id;
        }
      } catch (error) {
        // If 404, the path might not be exactly correct, so we fall through to search
        // For other errors (like 500), we also fall through to search
      }
    }

    // Call GitLab to resolve via search
    const projects = await gitlab.get<GitLabProject[]>("/projects", {
      params: { 
        search: normalized, 
        per_page: 1, 
        simple: true 
      }
    });

    if (projects && projects.length > 0) {
      const project = projects[0];
      const id = project.id;
      
      // Auto-learn: Store multiple identifiers for this project
      // We use a local update first for immediate availability in concurrent calls
      this.registry[normalized] = id;
      this.registry[project.name.toLowerCase()] = id;
      this.registry[project.path.toLowerCase()] = id;
      this.registry[project.path_with_namespace.toLowerCase()] = id;
      
      // Persist to disk
      await this.saveRegistry();
      return id;
    }

    throw new Error(`Could not resolve project identifier: "${identifier}". Please provide a valid Project ID or full path.`);
  }

  async setShortcut(shortcut: string, target: string | number) {
    const id = typeof target === "number" ? target : await this.resolve(target);
    this.registry[shortcut.toLowerCase().trim()] = id;
    await this.saveRegistry();
  }
}

export const projectResolver = new ProjectResolver();
