import { 
  opportunities, 
  communities, 
  painPoints, 
  activityFeed, 
  mcpTools,
  mcpContextProviders,
  mcpRequests,
  mcpContextCache,
  githubPRIntegrations,
  type Opportunity, 
  type InsertOpportunity, 
  type Community, 
  type InsertCommunity, 
  type PainPoint, 
  type InsertPainPoint, 
  type ActivityFeed, 
  type InsertActivityFeed,
  type McpTool,
  type InsertMcpTool,
  type McpContextProvider,
  type InsertMcpContextProvider,
  type McpRequest,
  type InsertMcpRequest,
  type McpContextCache,
  type InsertMcpContextCache,
  type GithubPRIntegration,
  type InsertGithubPRIntegration
} from "@shared/schema";

export interface IStorage {
  // Opportunities
  getOpportunities(): Promise<Opportunity[]>;
  getOpportunity(id: number): Promise<Opportunity | undefined>;
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  updateOpportunity(id: number, opportunity: Partial<InsertOpportunity>): Promise<Opportunity>;
  deleteOpportunity(id: number): Promise<void>;
  
  // Communities
  getCommunities(): Promise<Community[]>;
  getCommunity(id: number): Promise<Community | undefined>;
  createCommunity(community: InsertCommunity): Promise<Community>;
  
  // Pain Points
  getPainPoints(): Promise<PainPoint[]>;
  getPainPointsByCommunity(communityId: number): Promise<PainPoint[]>;
  createPainPoint(painPoint: InsertPainPoint): Promise<PainPoint>;
  
  // Activity Feed
  getActivityFeed(limit?: number): Promise<ActivityFeed[]>;
  createActivityFeedItem(item: InsertActivityFeed): Promise<ActivityFeed>;
  
  // MCP Tools
  getMcpTools(): Promise<McpTool[]>;
  getMcpTool(id: number): Promise<McpTool | undefined>;
  createMcpTool(tool: InsertMcpTool): Promise<McpTool>;
  updateMcpTool(id: number, tool: Partial<InsertMcpTool>): Promise<McpTool>;
  deleteMcpTool(id: number): Promise<void>;
  
  // MCP Context Providers
  getMcpContextProviders(): Promise<McpContextProvider[]>;
  getMcpContextProvider(id: number): Promise<McpContextProvider | undefined>;
  createMcpContextProvider(provider: InsertMcpContextProvider): Promise<McpContextProvider>;
  updateMcpContextProvider(id: number, provider: Partial<InsertMcpContextProvider>): Promise<McpContextProvider>;
  deleteMcpContextProvider(id: number): Promise<void>;
  
  // MCP Requests
  getMcpRequests(): Promise<McpRequest[]>;
  getMcpRequest(id: number): Promise<McpRequest | undefined>;
  createMcpRequest(request: InsertMcpRequest): Promise<McpRequest>;
  updateMcpRequest(id: number, request: Partial<InsertMcpRequest>): Promise<McpRequest>;
  
  // MCP Context Cache
  getMcpContextCache(providerId?: number): Promise<McpContextCache[]>;
  getMcpContextCacheItem(key: string): Promise<McpContextCache | undefined>;
  createMcpContextCacheItem(item: InsertMcpContextCache): Promise<McpContextCache>;
  updateMcpContextCacheItem(id: number, item: Partial<InsertMcpContextCache>): Promise<McpContextCache>;
  deleteMcpContextCacheItem(id: number): Promise<void>;
  
  // GitHub PR Integrations
  getGithubPRIntegrations(): Promise<GithubPRIntegration[]>;
  getGithubPRIntegration(id: number): Promise<GithubPRIntegration | undefined>;
  createGithubPRIntegration(integration: InsertGithubPRIntegration): Promise<GithubPRIntegration>;
  updateGithubPRIntegration(id: number, integration: Partial<InsertGithubPRIntegration>): Promise<GithubPRIntegration>;
  
  // User methods (keeping existing)
  getUser(id: number): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  createUser(user: any): Promise<any>;
}

export class MemStorage implements IStorage {
  private opportunities: Map<number, Opportunity>;
  private communities: Map<number, Community>;
  private painPoints: Map<number, PainPoint>;
  private activityFeed: Map<number, ActivityFeed>;
  private mcpTools: Map<number, McpTool>;
  private mcpContextProviders: Map<number, McpContextProvider>;
  private mcpRequests: Map<number, McpRequest>;
  private mcpContextCache: Map<number, McpContextCache>;
  private githubPRIntegrations: Map<number, GithubPRIntegration>;
  private users: Map<number, any>;
  private currentOpportunityId: number;
  private currentCommunityId: number;
  private currentPainPointId: number;
  private currentActivityId: number;
  private currentMcpToolId: number;
  private currentMcpProviderId: number;
  private currentMcpRequestId: number;
  private currentMcpCacheId: number;
  private currentGithubPRId: number;
  private currentUserId: number;

  constructor() {
    this.opportunities = new Map();
    this.communities = new Map();
    this.painPoints = new Map();
    this.activityFeed = new Map();
    this.mcpTools = new Map();
    this.mcpContextProviders = new Map();
    this.mcpRequests = new Map();
    this.mcpContextCache = new Map();
    this.githubPRIntegrations = new Map();
    this.users = new Map();
    this.currentOpportunityId = 1;
    this.currentCommunityId = 1;
    this.currentPainPointId = 1;
    this.currentActivityId = 1;
    this.currentMcpToolId = 1;
    this.currentMcpProviderId = 1;
    this.currentMcpRequestId = 1;
    this.currentMcpCacheId = 1;
    this.currentGithubPRId = 1;
    this.currentUserId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample MCP Tools
    const sampleMcpTools = [
      {
        name: "web_search",
        description: "Search the web for information",
        schema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
            limit: { type: "number", description: "Number of results", default: 10 }
          },
          required: ["query"]
        },
        category: "search"
      },
      {
        name: "file_reader",
        description: "Read file contents from the filesystem",
        schema: {
          type: "object",
          properties: {
            path: { type: "string", description: "File path" },
            encoding: { type: "string", description: "File encoding", default: "utf8" }
          },
          required: ["path"]
        },
        category: "file"
      },
      {
        name: "code_analyzer",
        description: "Analyze code structure and dependencies",
        schema: {
          type: "object",
          properties: {
            filePath: { type: "string", description: "Path to analyze" },
            analysisType: { 
              type: "string", 
              enum: ["dependencies", "structure", "complexity"],
              description: "Type of analysis"
            }
          },
          required: ["filePath", "analysisType"]
        },
        category: "analysis"
      }
    ];

    sampleMcpTools.forEach(tool => {
      const id = this.currentMcpToolId++;
      const now = new Date();
      this.mcpTools.set(id, { ...tool, id, enabled: true, createdAt: now, updatedAt: now });
    });

    // Sample MCP Context Providers
    const sampleProviders = [
      {
        name: "GitHub Repository",
        type: "git",
        config: {
          repository: "https://github.com/example/repo",
          branch: "main",
          includePatterns: ["**/*.ts", "**/*.tsx"],
          excludePatterns: ["node_modules/**", "dist/**"]
        },
        enabled: true
      },
      {
        name: "Project Files",
        type: "file",
        config: {
          basePath: "./",
          includePatterns: ["src/**", "docs/**"],
          excludePatterns: ["**/*.log", "**/.git/**"]
        },
        enabled: true
      },
      {
        name: "API Documentation",
        type: "api",
        config: {
          endpoint: "https://api.example.com/docs",
          authType: "bearer",
          refreshInterval: 3600
        },
        enabled: true
      }
    ];

    sampleProviders.forEach(provider => {
      const id = this.currentMcpProviderId++;
      this.mcpContextProviders.set(id, { ...provider, id, createdAt: new Date() });
    });
    // Sample communities
    const sampleCommunities = [
      { name: "r/entrepreneur", platform: "reddit", memberCount: "1.2M members", painPointsDetected: 847, isActive: true },
      { name: "Twitter #SaaS", platform: "twitter", memberCount: "Active hashtag", painPointsDetected: 623, isActive: true },
      { name: "HackerNews", platform: "hackernews", memberCount: "Tech community", painPointsDetected: 451, isActive: true },
      { name: "LinkedIn Groups", platform: "linkedin", memberCount: "Professional networks", painPointsDetected: 324, isActive: true }
    ];

    sampleCommunities.forEach(community => {
      const id = this.currentCommunityId++;
      this.communities.set(id, { ...community, id, createdAt: new Date() });
    });

    // Sample opportunities
    const sampleOpportunities = [
      {
        title: "AI-Powered Code Review Assistant",
        description: "Automated code review tool that helps developers catch bugs, improve code quality, and maintain coding standards across teams.",
        category: "Developer Tools",
        score: 94,
        potentialLevel: "High Potential",
        mentions: 247,
        communities: ["r/programming", "HackerNews"],
        estimatedRevenue: "$120K",
        competitionLevel: "Medium",
        timeToMarket: "8-12 months",
        painPoints: ["Manual code reviews take too long", "Inconsistent coding standards", "Bug detection issues"]
      },
      {
        title: "Remote Team Wellness Platform",
        description: "Comprehensive wellness platform for remote teams including mental health check-ins, virtual team building, and productivity tracking.",
        category: "HR & Wellness",
        score: 87,
        potentialLevel: "Trending",
        mentions: 189,
        communities: ["r/remotework", "LinkedIn"],
        estimatedRevenue: "$85K",
        competitionLevel: "Low",
        timeToMarket: "6-9 months",
        painPoints: ["Remote team isolation", "Mental health tracking", "Team engagement challenges"]
      },
      {
        title: "Smart Invoice Management System",
        description: "AI-powered invoicing solution that automates payment tracking, sends smart reminders, and provides cash flow insights for small businesses.",
        category: "Finance",
        score: 82,
        potentialLevel: "High Potential",
        mentions: 156,
        communities: ["r/entrepreneur", "Twitter"],
        estimatedRevenue: "$95K",
        competitionLevel: "High",
        timeToMarket: "4-6 months",
        painPoints: ["Late payments", "Manual invoice tracking", "Cash flow visibility"]
      }
    ];

    sampleOpportunities.forEach(opportunity => {
      const id = this.currentOpportunityId++;
      this.opportunities.set(id, { ...opportunity, id, createdAt: new Date(), updatedAt: new Date() });
    });

    // Sample activity feed
    const sampleActivities = [
      { type: "pain_point", message: "New pain point detected in r/webdev", metadata: { community: "r/webdev" } },
      { type: "opportunity", message: "High-scoring opportunity generated for API monitoring", metadata: { score: 91 } },
      { type: "mention", message: "247 new mentions found across 3 communities", metadata: { count: 247 } },
      { type: "trend", message: "Trending topic spike: Remote work tools", metadata: { topic: "Remote work tools" } },
      { type: "community", message: "New community added: IndieHackers", metadata: { community: "IndieHackers" } }
    ];

    sampleActivities.forEach(activity => {
      const id = this.currentActivityId++;
      this.activityFeed.set(id, { ...activity, id, createdAt: new Date() });
    });
  }

  // Opportunities
  async getOpportunities(): Promise<Opportunity[]> {
    return Array.from(this.opportunities.values()).sort((a, b) => b.score - a.score);
  }

  async getOpportunity(id: number): Promise<Opportunity | undefined> {
    return this.opportunities.get(id);
  }

  async createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity> {
    const id = this.currentOpportunityId++;
    const now = new Date();
    const newOpportunity: Opportunity = { ...opportunity, id, createdAt: now, updatedAt: now };
    this.opportunities.set(id, newOpportunity);
    return newOpportunity;
  }

  async updateOpportunity(id: number, opportunity: Partial<InsertOpportunity>): Promise<Opportunity> {
    const existing = this.opportunities.get(id);
    if (!existing) throw new Error("Opportunity not found");
    
    const updated: Opportunity = { ...existing, ...opportunity, updatedAt: new Date() };
    this.opportunities.set(id, updated);
    return updated;
  }

  async deleteOpportunity(id: number): Promise<void> {
    this.opportunities.delete(id);
  }

  // Communities
  async getCommunities(): Promise<Community[]> {
    return Array.from(this.communities.values()).sort((a, b) => b.painPointsDetected - a.painPointsDetected);
  }

  async getCommunity(id: number): Promise<Community | undefined> {
    return this.communities.get(id);
  }

  async createCommunity(community: InsertCommunity): Promise<Community> {
    const id = this.currentCommunityId++;
    const newCommunity: Community = { ...community, id, createdAt: new Date() };
    this.communities.set(id, newCommunity);
    return newCommunity;
  }

  // Pain Points
  async getPainPoints(): Promise<PainPoint[]> {
    return Array.from(this.painPoints.values());
  }

  async getPainPointsByCommunity(communityId: number): Promise<PainPoint[]> {
    return Array.from(this.painPoints.values()).filter(p => p.communityId === communityId);
  }

  async createPainPoint(painPoint: InsertPainPoint): Promise<PainPoint> {
    const id = this.currentPainPointId++;
    const newPainPoint: PainPoint = { ...painPoint, id, createdAt: new Date() };
    this.painPoints.set(id, newPainPoint);
    return newPainPoint;
  }

  // Activity Feed
  async getActivityFeed(limit: number = 10): Promise<ActivityFeed[]> {
    return Array.from(this.activityFeed.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createActivityFeedItem(item: InsertActivityFeed): Promise<ActivityFeed> {
    const id = this.currentActivityId++;
    const newItem: ActivityFeed = { ...item, id, createdAt: new Date() };
    this.activityFeed.set(id, newItem);
    return newItem;
  }

  // User methods (keeping existing)
  async getUser(id: number): Promise<any> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: any): Promise<any> {
    const id = this.currentUserId++;
    const user: any = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // MCP Tools
  async getMcpTools(): Promise<McpTool[]> {
    return Array.from(this.mcpTools.values());
  }

  async getMcpTool(id: number): Promise<McpTool | undefined> {
    return this.mcpTools.get(id);
  }

  async createMcpTool(tool: InsertMcpTool): Promise<McpTool> {
    const id = this.currentMcpToolId++;
    const now = new Date();
    const newTool: McpTool = { ...tool, id, createdAt: now, updatedAt: now };
    this.mcpTools.set(id, newTool);
    return newTool;
  }

  async updateMcpTool(id: number, tool: Partial<InsertMcpTool>): Promise<McpTool> {
    const existing = this.mcpTools.get(id);
    if (!existing) throw new Error(`MCP Tool with id ${id} not found`);
    const updated: McpTool = { ...existing, ...tool, updatedAt: new Date() };
    this.mcpTools.set(id, updated);
    return updated;
  }

  async deleteMcpTool(id: number): Promise<void> {
    this.mcpTools.delete(id);
  }

  // MCP Context Providers
  async getMcpContextProviders(): Promise<McpContextProvider[]> {
    return Array.from(this.mcpContextProviders.values());
  }

  async getMcpContextProvider(id: number): Promise<McpContextProvider | undefined> {
    return this.mcpContextProviders.get(id);
  }

  async createMcpContextProvider(provider: InsertMcpContextProvider): Promise<McpContextProvider> {
    const id = this.currentMcpProviderId++;
    const newProvider: McpContextProvider = { ...provider, id, createdAt: new Date() };
    this.mcpContextProviders.set(id, newProvider);
    return newProvider;
  }

  async updateMcpContextProvider(id: number, provider: Partial<InsertMcpContextProvider>): Promise<McpContextProvider> {
    const existing = this.mcpContextProviders.get(id);
    if (!existing) throw new Error(`MCP Context Provider with id ${id} not found`);
    const updated: McpContextProvider = { ...existing, ...provider };
    this.mcpContextProviders.set(id, updated);
    return updated;
  }

  async deleteMcpContextProvider(id: number): Promise<void> {
    this.mcpContextProviders.delete(id);
  }

  // MCP Requests
  async getMcpRequests(): Promise<McpRequest[]> {
    return Array.from(this.mcpRequests.values());
  }

  async getMcpRequest(id: number): Promise<McpRequest | undefined> {
    return this.mcpRequests.get(id);
  }

  async createMcpRequest(request: InsertMcpRequest): Promise<McpRequest> {
    const id = this.currentMcpRequestId++;
    const newRequest: McpRequest = { ...request, id, createdAt: new Date() };
    this.mcpRequests.set(id, newRequest);
    return newRequest;
  }

  async updateMcpRequest(id: number, request: Partial<InsertMcpRequest>): Promise<McpRequest> {
    const existing = this.mcpRequests.get(id);
    if (!existing) throw new Error(`MCP Request with id ${id} not found`);
    const updated: McpRequest = { ...existing, ...request };
    this.mcpRequests.set(id, updated);
    return updated;
  }

  // MCP Context Cache
  async getMcpContextCache(providerId?: number): Promise<McpContextCache[]> {
    const items = Array.from(this.mcpContextCache.values());
    if (providerId !== undefined) {
      return items.filter(item => item.providerId === providerId);
    }
    return items;
  }

  async getMcpContextCacheItem(key: string): Promise<McpContextCache | undefined> {
    return Array.from(this.mcpContextCache.values()).find(item => item.key === key);
  }

  async createMcpContextCacheItem(item: InsertMcpContextCache): Promise<McpContextCache> {
    const id = this.currentMcpCacheId++;
    const newItem: McpContextCache = { ...item, id, createdAt: new Date() };
    this.mcpContextCache.set(id, newItem);
    return newItem;
  }

  async updateMcpContextCacheItem(id: number, item: Partial<InsertMcpContextCache>): Promise<McpContextCache> {
    const existing = this.mcpContextCache.get(id);
    if (!existing) throw new Error(`MCP Context Cache item with id ${id} not found`);
    const updated: McpContextCache = { ...existing, ...item };
    this.mcpContextCache.set(id, updated);
    return updated;
  }

  async deleteMcpContextCacheItem(id: number): Promise<void> {
    this.mcpContextCache.delete(id);
  }

  // GitHub PR Integrations
  async getGithubPRIntegrations(): Promise<GithubPRIntegration[]> {
    return Array.from(this.githubPRIntegrations.values());
  }

  async getGithubPRIntegration(id: number): Promise<GithubPRIntegration | undefined> {
    return this.githubPRIntegrations.get(id);
  }

  async createGithubPRIntegration(integration: InsertGithubPRIntegration): Promise<GithubPRIntegration> {
    const id = this.currentGithubPRId++;
    const now = new Date();
    const newIntegration: GithubPRIntegration = { ...integration, id, createdAt: now, updatedAt: now };
    this.githubPRIntegrations.set(id, newIntegration);
    return newIntegration;
  }

  async updateGithubPRIntegration(id: number, integration: Partial<InsertGithubPRIntegration>): Promise<GithubPRIntegration> {
    const existing = this.githubPRIntegrations.get(id);
    if (!existing) throw new Error(`GitHub PR Integration with id ${id} not found`);
    const updated: GithubPRIntegration = { ...existing, ...integration, updatedAt: new Date() };
    this.githubPRIntegrations.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
