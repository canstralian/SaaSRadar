import { storage } from "../storage";
import type { McpContextProvider, McpContextCache, InsertMcpContextCache } from "@shared/schema";
import * as fs from "fs/promises";
import * as path from "path";

export interface ContextExtractionResult {
  providerId: number;
  key: string;
  value: any;
  metadata: {
    extractedAt: Date;
    size: number;
    type: string;
    tags?: string[];
  };
}

export interface FileContext {
  path: string;
  content: string;
  language?: string;
  imports?: string[];
  exports?: string[];
  functions?: string[];
  classes?: string[];
}

export interface GitContext {
  repository: string;
  branch: string;
  commits: any[];
  files: FileContext[];
  metadata: {
    lastCommit: string;
    contributors: string[];
    fileCount: number;
  };
}

export class ContextExtractor {
  private extractors: Map<string, (provider: McpContextProvider) => Promise<ContextExtractionResult[]>>;
  
  constructor() {
    this.extractors = new Map();
    this.registerDefaultExtractors();
  }

  private registerDefaultExtractors() {
    // File Context Extractor
    this.extractors.set("file", async (provider) => {
      const config = provider.config as any;
      const results: ContextExtractionResult[] = [];
      
      // Simulate file context extraction
      const mockFiles = [
        "src/index.ts",
        "src/components/App.tsx",
        "src/utils/helpers.ts",
        "README.md"
      ];

      for (const filePath of mockFiles) {
        const fileContext: FileContext = {
          path: filePath,
          content: await this.simulateFileRead(filePath),
          language: this.getLanguageFromPath(filePath),
          imports: this.extractImports(filePath),
          exports: this.extractExports(filePath),
          functions: this.extractFunctions(filePath),
          classes: this.extractClasses(filePath)
        };

        results.push({
          providerId: provider.id,
          key: `file:${filePath}`,
          value: fileContext,
          metadata: {
            extractedAt: new Date(),
            size: fileContext.content.length,
            type: "file",
            tags: [fileContext.language || "unknown", "source"]
          }
        });
      }

      return results;
    });

    // Git Context Extractor
    this.extractors.set("git", async (provider) => {
      const config = provider.config as any;
      const results: ContextExtractionResult[] = [];
      
      // Simulate git context extraction
      const gitContext: GitContext = {
        repository: config.repository,
        branch: config.branch || "main",
        commits: [
          {
            hash: "abc123",
            message: "feat: Add MCP simulator",
            author: "dev@example.com",
            date: new Date().toISOString()
          },
          {
            hash: "def456",
            message: "fix: Update context extraction",
            author: "dev@example.com",
            date: new Date(Date.now() - 86400000).toISOString()
          }
        ],
        files: [],
        metadata: {
          lastCommit: "abc123",
          contributors: ["dev@example.com", "contributor@example.com"],
          fileCount: 42
        }
      };

      results.push({
        providerId: provider.id,
        key: `git:${config.repository}:${config.branch}`,
        value: gitContext,
        metadata: {
          extractedAt: new Date(),
          size: JSON.stringify(gitContext).length,
          type: "git",
          tags: ["repository", "version-control"]
        }
      });

      return results;
    });

    // API Context Extractor
    this.extractors.set("api", async (provider) => {
      const config = provider.config as any;
      const results: ContextExtractionResult[] = [];
      
      // Simulate API documentation extraction
      const apiContext = {
        endpoint: config.endpoint,
        endpoints: [
          {
            path: "/api/v1/tools",
            method: "GET",
            description: "List all available MCP tools",
            parameters: [],
            response: {
              type: "array",
              items: { $ref: "#/definitions/McpTool" }
            }
          },
          {
            path: "/api/v1/tools/:id/execute",
            method: "POST",
            description: "Execute a specific MCP tool",
            parameters: [
              { name: "id", in: "path", type: "integer", required: true },
              { name: "params", in: "body", type: "object", required: true }
            ],
            response: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: { type: "any" },
                error: { type: "string" }
              }
            }
          }
        ],
        definitions: {
          McpTool: {
            type: "object",
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
              description: { type: "string" },
              schema: { type: "object" }
            }
          }
        }
      };

      results.push({
        providerId: provider.id,
        key: `api:${config.endpoint}`,
        value: apiContext,
        metadata: {
          extractedAt: new Date(),
          size: JSON.stringify(apiContext).length,
          type: "api",
          tags: ["documentation", "rest-api"]
        }
      });

      return results;
    });

    // Database Context Extractor
    this.extractors.set("database", async (provider) => {
      const config = provider.config as any;
      const results: ContextExtractionResult[] = [];
      
      // Simulate database schema extraction
      const dbContext = {
        tables: [
          {
            name: "mcp_tools",
            columns: [
              { name: "id", type: "serial", primary: true },
              { name: "name", type: "text", nullable: false },
              { name: "description", type: "text", nullable: false },
              { name: "schema", type: "json", nullable: false },
              { name: "created_at", type: "timestamp", default: "now()" }
            ],
            indexes: ["idx_mcp_tools_name"],
            rowCount: 10
          },
          {
            name: "mcp_requests",
            columns: [
              { name: "id", type: "serial", primary: true },
              { name: "tool_id", type: "integer", foreign: "mcp_tools.id" },
              { name: "input", type: "json", nullable: false },
              { name: "output", type: "json" },
              { name: "status", type: "text", nullable: false },
              { name: "created_at", type: "timestamp", default: "now()" }
            ],
            indexes: ["idx_mcp_requests_tool_id", "idx_mcp_requests_status"],
            rowCount: 156
          }
        ],
        relationships: [
          {
            from: "mcp_requests.tool_id",
            to: "mcp_tools.id",
            type: "many-to-one"
          }
        ]
      };

      results.push({
        providerId: provider.id,
        key: `database:schema`,
        value: dbContext,
        metadata: {
          extractedAt: new Date(),
          size: JSON.stringify(dbContext).length,
          type: "database",
          tags: ["schema", "postgresql"]
        }
      });

      return results;
    });
  }

  private async simulateFileRead(filePath: string): Promise<string> {
    // In a real implementation, this would read actual files
    const templates: Record<string, string> = {
      "src/index.ts": `import express from 'express';\nimport { mcpSimulator } from './services/mcp-simulator';\n\nconst app = express();\napp.use(express.json());\n\napp.post('/api/mcp/execute', async (req, res) => {\n  const { toolId, params } = req.body;\n  const result = await mcpSimulator.executeTool(toolId, params);\n  res.json(result);\n});\n\napp.listen(3000);`,
      "src/components/App.tsx": `import React from 'react';\nimport { McpToolList } from './McpToolList';\n\nexport function App() {\n  return (\n    <div className="app">\n      <h1>MCP Simulator</h1>\n      <McpToolList />\n    </div>\n  );\n}`,
      "src/utils/helpers.ts": `export function formatDate(date: Date): string {\n  return date.toISOString();\n}\n\nexport function parseJSON(text: string): any {\n  try {\n    return JSON.parse(text);\n  } catch {\n    return null;\n  }\n}`,
      "README.md": `# MCP Simulator\n\nA Model Context Protocol simulator for Replit.\n\n## Features\n- Tool execution simulation\n- Context extraction\n- GitHub integration\n\n## Usage\nSee documentation for details.`
    };

    return templates[filePath] || `// Content of ${filePath}`;
  }

  private getLanguageFromPath(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const languageMap: Record<string, string> = {
      ".ts": "typescript",
      ".tsx": "typescript-react",
      ".js": "javascript",
      ".jsx": "javascript-react",
      ".py": "python",
      ".md": "markdown",
      ".json": "json",
      ".yaml": "yaml",
      ".yml": "yaml"
    };
    return languageMap[ext] || "plaintext";
  }

  private extractImports(filePath: string): string[] {
    // Simplified import extraction
    return ["express", "react", "./services/mcp-simulator"];
  }

  private extractExports(filePath: string): string[] {
    // Simplified export extraction
    return ["App", "mcpSimulator", "formatDate", "parseJSON"];
  }

  private extractFunctions(filePath: string): string[] {
    // Simplified function extraction
    return ["executeTool", "getAvailableTools", "formatDate", "parseJSON"];
  }

  private extractClasses(filePath: string): string[] {
    // Simplified class extraction
    return ["McpSimulator", "ContextExtractor"];
  }

  async extractContext(providerId: number): Promise<ContextExtractionResult[]> {
    const provider = await storage.getMcpContextProvider(providerId);
    if (!provider) {
      throw new Error(`Provider with ID ${providerId} not found`);
    }

    if (!provider.enabled) {
      throw new Error(`Provider ${provider.name} is disabled`);
    }

    const extractor = this.extractors.get(provider.type);
    if (!extractor) {
      throw new Error(`No extractor available for provider type: ${provider.type}`);
    }

    const results = await extractor(provider);
    
    // Cache the results
    for (const result of results) {
      await storage.createMcpContextCacheItem({
        providerId: result.providerId,
        key: result.key,
        value: result.value,
        metadata: result.metadata,
        expiresAt: new Date(Date.now() + 3600000) // 1 hour TTL
      });
    }

    return results;
  }

  async extractAllContexts(): Promise<ContextExtractionResult[]> {
    const providers = await storage.getMcpContextProviders();
    const allResults: ContextExtractionResult[] = [];

    for (const provider of providers) {
      if (provider.enabled) {
        try {
          const results = await this.extractContext(provider.id);
          allResults.push(...results);
        } catch (error) {
          console.error(`Failed to extract context from provider ${provider.name}:`, error);
        }
      }
    }

    return allResults;
  }

  async getCachedContext(key: string): Promise<McpContextCache | undefined> {
    const cached = await storage.getMcpContextCacheItem(key);
    if (cached && cached.expiresAt && new Date(cached.expiresAt) > new Date()) {
      return cached;
    }
    return undefined;
  }

  async searchContext(query: string): Promise<ContextExtractionResult[]> {
    const allCache = await storage.getMcpContextCache();
    const results: ContextExtractionResult[] = [];
    
    for (const item of allCache) {
      // Simple search implementation
      const valueStr = JSON.stringify(item.value).toLowerCase();
      if (valueStr.includes(query.toLowerCase())) {
        results.push({
          providerId: item.providerId!,
          key: item.key,
          value: item.value,
          metadata: item.metadata as any
        });
      }
    }
    
    return results;
  }
}

export const contextExtractor = new ContextExtractor();