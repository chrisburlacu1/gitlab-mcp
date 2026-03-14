import { gitlab } from "./gitlab.js";
import { GitLabProject } from "../types.js";

class ProjectResolver {
  private cache = new Map<string, number>();
  
  /**
   * Manual aliases for shorthand names.
   * You can add project-specific shorthand here.
   */
  private aliases: Record<string, string | number> = {
    "nds": "news-data-service",
    "ow": "ollama-widget",
  };

  /**
   * Resolves a numeric project ID from a number, numeric string, shorthand alias, or search term.
   */
  async resolve(identifier: string | number): Promise<number> {
    // If it's already a number, return it
    if (typeof identifier === "number") return identifier;
    
    const normalized = identifier.toLowerCase().trim();

    // 1. Check if it's a numeric string (e.g., "123")
    const numericId = parseInt(normalized, 10);
    if (!isNaN(numericId) && numericId.toString() === normalized) {
      return numericId;
    }

    // 2. Check Manual Aliases (e.g., "nds")
    const aliased = this.aliases[normalized];
    if (aliased) {
      // Recurse to handle alias -> path mapping
      return this.resolve(aliased);
    }

    // 3. Check Dynamic Resolution Cache
    const cached = this.cache.get(normalized);
    if (cached) return cached;

    // 4. Search GitLab API (Last resort)
    // We use the search endpoint to find the project by name or path
    const projects = await gitlab.get<GitLabProject[]>("/projects", {
      params: { 
        search: normalized, 
        per_page: 1, 
        simple: true 
      }
    });

    if (projects && projects.length > 0) {
      const id = projects[0].id;
      // Cache the result for future lookups in this session
      this.cache.set(normalized, id);
      return id;
    }

    throw new Error(`Could not resolve project identifier: "${identifier}". Please provide a valid Project ID or full path.`);
  }

  /**
   * Allows the agent to dynamically set aliases during a session.
   */
  setAlias(alias: string, target: string | number) {
    this.aliases[alias.toLowerCase().trim()] = target;
  }
}

export const projectResolver = new ProjectResolver();
