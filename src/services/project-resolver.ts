import { gitlab } from "./gitlab.js";
import { GitLabProject } from "../types.js";
import fs from "fs/promises";
import { readFileSync } from "fs";
import path from "path";

const ALIASES_FILE = path.join(process.cwd(), "aliases.json");

class ProjectResolver {
  private cache = new Map<string, number>();

  private aliases: Record<string, string | number> = {};

  constructor() {
    this.loadAliases();
  }

  private loadAliases() {
    try {
      const data = readFileSync(ALIASES_FILE, "utf-8");
      this.aliases = JSON.parse(data);
    } catch (error) {
      // File might not exist or be invalid JSON, that's fine
      this.aliases = {};
    }
  }

  private async saveAliases() {
    try {
      await fs.writeFile(
        ALIASES_FILE,
        JSON.stringify(this.aliases, null, 2),
        "utf-8",
      );
    } catch (error) {
      console.error("Failed to save project aliases:", error);
    }
  }

  async resolve(identifier: string | number): Promise<number> {
    if (typeof identifier === "number") return identifier;

    const normalized = identifier.toLowerCase().trim();

    const numericId = parseInt(normalized, 10);
    if (!isNaN(numericId) && numericId.toString() === normalized) {
      return numericId;
    }

    const aliased = this.aliases[normalized];
    if (aliased) {
      return this.resolve(aliased);
    }

    const cached = this.cache.get(normalized);
    if (cached) return cached;

    const projects = await gitlab.get<GitLabProject[]>("/projects", {
      params: {
        search: normalized,
        per_page: 1,
        simple: true,
      },
    });

    if (projects && projects.length > 0) {
      const id = projects[0].id;
      this.cache.set(normalized, id);
      return id;
    }

    throw new Error(
      `Could not resolve project identifier: "${identifier}". Please provide a valid Project ID or full path.`,
    );
  }

  async setAlias(alias: string, target: string | number) {
    this.aliases[alias.toLowerCase().trim()] = target;
    await this.saveAliases();
  }
}

export const projectResolver = new ProjectResolver();
