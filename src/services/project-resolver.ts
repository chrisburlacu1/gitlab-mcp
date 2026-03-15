import { gitlab } from "./gitlab.js";
import { GitLabProject } from "../types.js";
import fs from "fs/promises";
import { readFileSync } from "fs";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), "project-cache.json");

class ProjectResolver {
  private registry: Record<string, number> = {};

  constructor() {
    this.loadRegistrySync();
  }

  private loadRegistrySync() {
    try {
      const data = readFileSync(CACHE_FILE, "utf-8");
      this.registry = JSON.parse(data);
    } catch (error) {
      this.registry = {};
    }
  }

  private async saveRegistry() {
    try {
      await fs.writeFile(CACHE_FILE, JSON.stringify(this.registry, null, 2), "utf-8");
    } catch (error) {
      console.error("Failed to save project registry:", error);
    }
  }

  async resolve(identifier: string | number): Promise<number> {
    if (typeof identifier === "number") return identifier;
    
    const normalized = identifier.toLowerCase().trim();

    const numericId = parseInt(normalized, 10);
    if (!isNaN(numericId) && numericId.toString() === normalized) {
      return numericId;
    }

    if (this.registry[normalized]) {
      return this.registry[normalized];
    }

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
      this.registry[normalized] = id;
      this.registry[project.name.toLowerCase()] = id;
      this.registry[project.path.toLowerCase()] = id;
      this.registry[project.path_with_namespace.toLowerCase()] = id;
      
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
