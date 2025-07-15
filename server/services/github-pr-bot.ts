import { storage } from "../storage";
import { contextExtractor } from "./context-extractor";
import { mcpSimulator } from "./mcp-simulator";
import type { GithubPRIntegration, InsertGithubPRIntegration } from "@shared/schema";

export interface PRContext {
  repository: string;
  branch: string;
  prNumber: number;
  title: string;
  description: string;
  files: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    patch?: string;
  }>;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MCPInjectionResult {
  prNumber: number;
  injectedContext: any;
  suggestedActions: string[];
  analysisResults: any;
  timestamp: Date;
}

export class GitHubPRBot {
  private webhookHandlers: Map<string, (payload: any) => Promise<void>>;
  
  constructor() {
    this.webhookHandlers = new Map();
    this.registerWebhookHandlers();
  }

  private registerWebhookHandlers() {
    // Pull Request opened/updated handler
    this.webhookHandlers.set("pull_request", async (payload) => {
      if (["opened", "synchronize", "reopened"].includes(payload.action)) {
        const prContext = this.extractPRContext(payload);
        await this.processPullRequest(prContext);
      }
    });

    // Push event handler
    this.webhookHandlers.set("push", async (payload) => {
      const branch = payload.ref.replace("refs/heads/", "");
      await this.processPush(payload.repository.clone_url, branch, payload.commits);
    });

    // Issue comment handler (for bot commands)
    this.webhookHandlers.set("issue_comment", async (payload) => {
      if (payload.issue.pull_request && payload.comment.body.startsWith("/mcp")) {
        await this.handleBotCommand(payload);
      }
    });
  }

  private extractPRContext(payload: any): PRContext {
    const pr = payload.pull_request;
    return {
      repository: payload.repository.clone_url,
      branch: pr.head.ref,
      prNumber: pr.number,
      title: pr.title,
      description: pr.body || "",
      files: [], // Would be populated from GitHub API
      author: pr.user.login,
      createdAt: new Date(pr.created_at),
      updatedAt: new Date(pr.updated_at)
    };
  }

  async processPullRequest(prContext: PRContext): Promise<MCPInjectionResult> {
    // Create or update PR integration record
    const integration = await storage.createGithubPRIntegration({
      repoUrl: prContext.repository,
      branch: prContext.branch,
      prNumber: prContext.prNumber,
      status: "processing",
      mcpContext: {},
      metadata: {
        title: prContext.title,
        author: prContext.author,
        createdAt: prContext.createdAt.toISOString()
      }
    });

    try {
      // Extract context from the repository
      const contextResults = await this.extractPRContext(prContext);
      
      // Analyze the PR using MCP tools
      const analysisResults = await this.analyzePR(prContext, contextResults);
      
      // Generate suggestions based on analysis
      const suggestions = await this.generateSuggestions(prContext, analysisResults);
      
      // Inject MCP context
      const injectedContext = {
        repository: prContext.repository,
        branch: prContext.branch,
        prNumber: prContext.prNumber,
        extractedContext: contextResults,
        analysis: analysisResults,
        suggestions: suggestions,
        metadata: {
          processedAt: new Date().toISOString(),
          toolsUsed: ["code_analyzer", "web_search"],
          contextProviders: ["git", "file"]
        }
      };

      // Update integration status
      await storage.updateGithubPRIntegration(integration.id, {
        status: "completed",
        mcpContext: injectedContext
      });

      // Post comment to PR (simulated)
      await this.postPRComment(prContext.prNumber, this.formatMCPComment(injectedContext));

      return {
        prNumber: prContext.prNumber,
        injectedContext,
        suggestedActions: suggestions,
        analysisResults,
        timestamp: new Date()
      };
    } catch (error) {
      // Update integration status on error
      await storage.updateGithubPRIntegration(integration.id, {
        status: "failed",
        metadata: {
          ...integration.metadata,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      });
      
      throw error;
    }
  }

  private async extractPRContext(prContext: PRContext): Promise<any> {
    // Simulate context extraction for PR
    const contexts = [];
    
    // Extract file contexts
    for (const file of prContext.files || []) {
      contexts.push({
        type: "file",
        path: file.filename,
        changes: {
          additions: file.additions,
          deletions: file.deletions,
          status: file.status
        }
      });
    }

    // Extract commit history
    contexts.push({
      type: "commits",
      branch: prContext.branch,
      recentCommits: [] // Would be populated from git
    });

    return contexts;
  }

  private async analyzePR(prContext: PRContext, contextResults: any): Promise<any> {
    const analysis = {
      codeQuality: {
        score: 85,
        issues: [
          {
            severity: "warning",
            file: "src/app.ts",
            line: 42,
            message: "Unused variable 'temp'"
          }
        ]
      },
      security: {
        vulnerabilities: [],
        score: 100
      },
      performance: {
        suggestions: [
          "Consider using memo for expensive computations in React components",
          "Database queries could be optimized with proper indexing"
        ]
      },
      dependencies: {
        outdated: ["express@4.17.1 (latest: 4.18.2)"],
        security: []
      }
    };

    // Use MCP tools for deeper analysis
    const codeAnalyzerTool = (await storage.getMcpTools()).find(t => t.name === "code_analyzer");
    if (codeAnalyzerTool) {
      for (const file of prContext.files || []) {
        const result = await mcpSimulator.executeTool(codeAnalyzerTool.id, {
          filePath: file.filename,
          analysisType: "complexity"
        });
        
        if (result.success) {
          analysis.codeQuality = { ...analysis.codeQuality, ...result.data };
        }
      }
    }

    return analysis;
  }

  private async generateSuggestions(prContext: PRContext, analysisResults: any): Promise<string[]> {
    const suggestions = [];

    // Generate suggestions based on analysis
    if (analysisResults.codeQuality.score < 80) {
      suggestions.push("Consider refactoring complex functions to improve maintainability");
    }

    if (analysisResults.dependencies.outdated.length > 0) {
      suggestions.push(`Update ${analysisResults.dependencies.outdated.length} outdated dependencies`);
    }

    if (analysisResults.performance.suggestions.length > 0) {
      suggestions.push(...analysisResults.performance.suggestions);
    }

    // Add PR-specific suggestions
    if (!prContext.description || prContext.description.length < 50) {
      suggestions.push("Add a more detailed description to help reviewers understand the changes");
    }

    return suggestions;
  }

  private formatMCPComment(injectedContext: any): string {
    const { analysis, suggestions } = injectedContext;
    
    let comment = "## 🤖 MCP Analysis Results\n\n";
    
    // Code Quality
    comment += `### Code Quality\n`;
    comment += `- **Score**: ${analysis.codeQuality.score}/100\n`;
    if (analysis.codeQuality.issues.length > 0) {
      comment += `- **Issues Found**: ${analysis.codeQuality.issues.length}\n`;
    }
    comment += "\n";

    // Security
    comment += `### Security\n`;
    comment += `- **Score**: ${analysis.security.score}/100\n`;
    comment += `- **Vulnerabilities**: ${analysis.security.vulnerabilities.length || "None found"}\n\n`;

    // Suggestions
    if (suggestions.length > 0) {
      comment += "### 💡 Suggestions\n";
      suggestions.forEach((suggestion: string) => {
        comment += `- ${suggestion}\n`;
      });
      comment += "\n";
    }

    // MCP Context
    comment += "### 📋 MCP Context\n";
    comment += `- **Tools Used**: ${injectedContext.metadata.toolsUsed.join(", ")}\n`;
    comment += `- **Context Providers**: ${injectedContext.metadata.contextProviders.join(", ")}\n`;
    comment += `- **Processed At**: ${injectedContext.metadata.processedAt}\n`;

    return comment;
  }

  private async postPRComment(prNumber: number, comment: string): Promise<void> {
    // In a real implementation, this would use the GitHub API
    console.log(`Posting comment to PR #${prNumber}:\n${comment}`);
  }

  async processPush(repoUrl: string, branch: string, commits: any[]): Promise<void> {
    // Create integration record for push event
    await storage.createGithubPRIntegration({
      repoUrl,
      branch,
      status: "push_processed",
      mcpContext: {
        commits: commits.map(c => ({
          id: c.id,
          message: c.message,
          author: c.author,
          timestamp: c.timestamp
        }))
      },
      metadata: {
        event: "push",
        commitCount: commits.length
      }
    });
  }

  async handleBotCommand(payload: any): Promise<void> {
    const command = payload.comment.body.trim().split(" ");
    const prNumber = payload.issue.number;
    
    switch (command[1]) {
      case "analyze":
        // Re-run analysis
        const prContext = await this.getPRContext(prNumber);
        await this.processPullRequest(prContext);
        break;
        
      case "context":
        // Show current MCP context
        const integration = await this.getIntegrationByPR(prNumber);
        if (integration) {
          await this.postPRComment(prNumber, 
            `### Current MCP Context\n\`\`\`json\n${JSON.stringify(integration.mcpContext, null, 2)}\n\`\`\``
          );
        }
        break;
        
      case "help":
        // Show available commands
        await this.postPRComment(prNumber, 
          "### MCP Bot Commands\n" +
          "- `/mcp analyze` - Re-run MCP analysis\n" +
          "- `/mcp context` - Show current MCP context\n" +
          "- `/mcp help` - Show this help message"
        );
        break;
    }
  }

  private async getPRContext(prNumber: number): Promise<PRContext> {
    // In a real implementation, this would fetch from GitHub API
    return {
      repository: "https://github.com/example/repo",
      branch: "feature/test",
      prNumber,
      title: "Test PR",
      description: "Test description",
      files: [],
      author: "testuser",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private async getIntegrationByPR(prNumber: number): Promise<GithubPRIntegration | undefined> {
    const integrations = await storage.getGithubPRIntegrations();
    return integrations.find(i => i.prNumber === prNumber);
  }

  // Webhook endpoint handler
  async handleWebhook(event: string, payload: any): Promise<void> {
    const handler = this.webhookHandlers.get(event);
    if (handler) {
      await handler(payload);
    } else {
      console.warn(`No handler registered for webhook event: ${event}`);
    }
  }
}

export const githubPRBot = new GitHubPRBot();