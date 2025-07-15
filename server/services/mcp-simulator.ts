import { storage } from "../storage";
import type { 
  McpTool, 
  McpRequest, 
  InsertMcpRequest,
  McpContextProvider,
  McpContextCache,
  InsertMcpContextCache 
} from "@shared/schema";

export interface McpToolResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
}

export interface McpContext {
  providerId: number;
  providerName: string;
  type: string;
  data: any;
}

export class McpSimulator {
  private toolHandlers: Map<string, (params: any) => Promise<any>>;
  
  constructor() {
    this.toolHandlers = new Map();
    this.registerBuiltInHandlers();
  }

  private sanitizeParams(params: any): any {
    if (typeof params !== 'object' || params === null) {
      return {};
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(params)) {
      // Only allow alphanumeric keys
      if (!/^[a-zA-Z0-9_]+$/.test(key)) {
        continue;
      }

      if (typeof value === 'string') {
        // Basic XSS protection
        sanitized[key] = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      } else if (typeof value === 'number' && isFinite(value)) {
        sanitized[key] = value;
      } else if (typeof value === 'boolean') {
        sanitized[key] = value;
      } else if (Array.isArray(value)) {
        sanitized[key] = value.slice(0, 100); // Limit array size
      }
    }
    return sanitized;
  }

  private registerBuiltInHandlers() {
    // Web Search Handler
    this.toolHandlers.set("web_search", async (params: { query: string; limit?: number }) => {
      const { query, limit = 10 } = params;
      
      if (!query || typeof query !== 'string') {
        throw new Error('Query parameter is required and must be a string');
      }

      if (limit && (typeof limit !== 'number' || limit < 1 || limit > 50)) {
        throw new Error('Limit must be a number between 1 and 50');
      }
      
      // Simulate web search results
      const results = [];
      const actualLimit = Math.min(limit, 50); // Cap at 50 results
      
      for (let i = 0; i < actualLimit; i++) {
        results.push({
          title: `Result ${i + 1} for: ${query}`,
          url: `https://example.com/result-${i + 1}`,
          snippet: `This is a simulated search result for the query "${query}". In a real implementation, this would connect to a search API.`,
          relevanceScore: Math.random()
        });
      }
      
      return {
        query,
        totalResults: actualLimit * 10,
        results: results.sort((a, b) => b.relevanceScore - a.relevanceScore)
      };
    });

    // File Reader Handler
    this.toolHandlers.set("file_reader", async (params: { path: string; encoding?: string }) => {
      const { path, encoding = "utf8" } = params;
      
      // Simulate file reading
      return {
        path,
        encoding,
        content: `// Simulated content of file: ${path}\n\nexport function example() {\n  console.log("This is simulated file content");\n}\n`,
        metadata: {
          size: 1024,
          lastModified: new Date().toISOString(),
          mimeType: "text/plain"
        }
      };
    });

    // Code Analyzer Handler
    this.toolHandlers.set("code_analyzer", async (params: { filePath: string; analysisType: string }) => {
      const { filePath, analysisType } = params;
      
      const analyses: Record<string, any> = {
        dependencies: {
          imports: ["react", "express", "@shared/schema"],
          exports: ["McpSimulator", "McpContext"],
          externalDependencies: 12,
          internalDependencies: 5
        },
        structure: {
          classes: 3,
          functions: 15,
          interfaces: 7,
          linesOfCode: 250,
          complexity: "medium"
        },
        complexity: {
          cyclomaticComplexity: 8,
          cognitiveComplexity: 12,
          maintainabilityIndex: 75,
          technicalDebt: "2 hours"
        }
      };
      
      return {
        filePath,
        analysisType,
        result: analyses[analysisType] || { error: "Unknown analysis type" }
      };
    });
  }

  async executeTool(toolId: number, params: any): Promise<McpToolResult> {
    const startTime = Date.now();
    
    try {
      // Input validation
      if (!Number.isInteger(toolId) || toolId <= 0) {
        throw new Error('Invalid tool ID');
      }

      if (params && typeof params !== 'object') {
        throw new Error('Parameters must be an object');
      }

      // Sanitize params to prevent injection attacks
      const sanitizedParams = this.sanitizeParams(params || {});

      const tool = await storage.getMcpTool(toolId);
      if (!tool) {
        throw new Error(`Tool with ID ${toolId} not found`);
      }

      if (!tool.enabled) {
        throw new Error(`Tool ${tool.name} is disabled`);
      }

      // Validate parameters against schema
      if (tool.schema && typeof tool.schema === 'object') {
        const schema = tool.schema as any;
        if (schema.required) {
          for (const requiredParam of schema.required) {
            if (!(requiredParam in sanitizedParams)) {
              throw new Error(`Missing required parameter: ${requiredParam}`);
            }
          }
        }
      }

      const handler = this.toolHandlers.get(tool.name);
      if (!handler) {
        throw new Error(`No handler registered for tool: ${tool.name}`);
      }

      // Add timeout to prevent hanging requests
      const result = await Promise.race([
        handler(sanitizedParams),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Tool execution timeout')), 30000)
        )
      ]);
      const executionTime = Date.now() - startTime;

      // Record the request
      await storage.createMcpRequest({
        toolId,
        input: params,
        output: result,
        status: "completed",
        executionTime
      });

      return {
        success: true,
        data: result,
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      // Record the failed request
      await storage.createMcpRequest({
        toolId,
        input: params,
        output: null,
        status: "failed",
        error: errorMessage,
        executionTime
      });

      return {
        success: false,
        error: errorMessage,
        executionTime
      };
    }
  }

  async getAvailableTools(): Promise<McpTool[]> {
    const tools = await storage.getMcpTools();
    return tools.filter(tool => tool.enabled);
  }

  async registerCustomTool(name: string, handler: (params: any) => Promise<any>) {
    this.toolHandlers.set(name, handler);
  }
}

export const mcpSimulator = new McpSimulator();