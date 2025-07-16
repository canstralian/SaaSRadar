import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateSaaSIdea, analyzePainPoints } from "./services/openai";
import { mcpSimulator } from "./services/mcp-simulator";
import { contextExtractor } from "./services/context-extractor";
import { githubPRBot } from "./services/github-pr-bot";
import { asyncHandler } from "./middleware/security";
import { 
  insertOpportunitySchema, 
  insertCommunitySchema, 
  insertPainPointSchema, 
  insertActivityFeedSchema,
  insertMcpToolSchema,
  insertMcpContextProviderSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Opportunities routes
  app.get("/api/opportunities", asyncHandler(async (req, res) => {
    try {
      const opportunities = await storage.getOpportunities();
      res.json(opportunities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch opportunities" });
    }
  }));

  app.get("/api/opportunities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const opportunity = await storage.getOpportunity(id);
      if (!opportunity) {
        return res.status(404).json({ message: "Opportunity not found" });
      }
      res.json(opportunity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch opportunity" });
    }
  });

  app.post("/api/opportunities", async (req, res) => {
    try {
      const validatedData = insertOpportunitySchema.parse(req.body);
      const opportunity = await storage.createOpportunity(validatedData);
      
      // Create activity feed item
      await storage.createActivityFeedItem({
        type: "opportunity",
        message: `New opportunity created: ${opportunity.title}`,
        metadata: { opportunityId: opportunity.id, score: opportunity.score }
      });
      
      res.json(opportunity);
    } catch (error) {
      res.status(400).json({ message: "Invalid opportunity data" });
    }
  });

  app.post("/api/opportunities/generate", async (req, res) => {
    try {
      const { painPoint } = req.body;
      if (!painPoint || typeof painPoint !== 'string') {
        return res.status(400).json({ message: "Pain point is required" });
      }

      const generatedIdea = await generateSaaSIdea(painPoint);
      
      const opportunity = await storage.createOpportunity({
        title: generatedIdea.title,
        description: generatedIdea.description,
        category: generatedIdea.category,
        score: generatedIdea.score,
        potentialLevel: generatedIdea.score > 85 ? "High Potential" : generatedIdea.score > 70 ? "Trending" : "Medium",
        mentions: Math.floor(Math.random() * 300) + 50, // Mock mentions
        communities: ["AI Generated"],
        estimatedRevenue: generatedIdea.estimatedRevenue,
        competitionLevel: generatedIdea.competitionLevel,
        timeToMarket: generatedIdea.timeToMarket,
        painPoints: generatedIdea.painPoints
      });

      // Create activity feed item
      await storage.createActivityFeedItem({
        type: "opportunity",
        message: `AI generated new opportunity: ${opportunity.title}`,
        metadata: { opportunityId: opportunity.id, score: opportunity.score }
      });

      res.json(opportunity);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate SaaS idea: " + (error as Error).message });
    }
  });

  // Communities routes
  app.get("/api/communities", async (req, res) => {
    try {
      const communities = await storage.getCommunities();
      res.json(communities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch communities" });
    }
  });

  app.post("/api/communities", async (req, res) => {
    try {
      const validatedData = insertCommunitySchema.parse(req.body);
      const community = await storage.createCommunity(validatedData);
      
      // Create activity feed item
      await storage.createActivityFeedItem({
        type: "community",
        message: `New community added: ${community.name}`,
        metadata: { communityId: community.id }
      });
      
      res.json(community);
    } catch (error) {
      res.status(400).json({ message: "Invalid community data" });
    }
  });

  // Opportunities routes
  app.get("/api/opportunities", async (req, res) => {
    try {
      const opportunities = await storage.getOpportunities();
      res.json(opportunities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch opportunities" });
    }
  });

  app.post("/api/opportunities", async (req, res) => {
    try {
      const validatedData = insertOpportunitySchema.parse(req.body);
      const opportunity = await storage.createOpportunity(validatedData);
      
      // Create activity feed item
      await storage.createActivityFeedItem({
        type: "opportunity",
        message: `New opportunity identified: ${opportunity.title}`,
        metadata: { opportunityId: opportunity.id, viabilityScore: opportunity.viabilityScore }
      });
      
      res.json(opportunity);
    } catch (error) {
      res.status(400).json({ message: "Invalid opportunity data" });
    }
  });

  // Stats route
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Activity feed route
  app.get("/api/activity-feed", async (req, res) => {
    try {
      const activityFeed = await storage.getActivityFeed();
      res.json(activityFeed);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity feed" });
    }
  });

  // Pain points routes
  app.get("/api/pain-points", async (req, res) => {
    try {
      const painPoints = await storage.getPainPoints();
      res.json(painPoints);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pain points" });
    }
  });

  app.post("/api/pain-points", async (req, res) => {
    try {
      const validatedData = insertPainPointSchema.parse(req.body);
      const painPoint = await storage.createPainPoint(validatedData);
      
      // Create activity feed item
      await storage.createActivityFeedItem({
        type: "pain_point",
        message: `New pain point detected: ${painPoint.title}`,
        metadata: { painPointId: painPoint.id, severity: painPoint.severity }
      });
      
      res.json(painPoint);
    } catch (error) {
      res.status(400).json({ message: "Invalid pain point data" });
    }
  });

  // Activity feed routes
  app.get("/api/activity-feed", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getActivityFeed(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity feed" });
    }
  });

  // Analytics/Stats routes
  app.get("/api/stats", async (req, res) => {
    try {
      const opportunities = await storage.getOpportunities();
      const communities = await storage.getCommunities();
      const painPoints = await storage.getPainPoints();
      
      const stats = {
        activeMonitors: communities.filter(c => c.isActive).length,
        painPointsDetected: painPoints.length,
        saasIdeasGenerated: opportunities.length,
        highPotentialIdeas: opportunities.filter(o => o.potentialLevel === "High Potential").length
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // MCP Tools Routes
  app.get("/api/mcp/tools", async (req, res) => {
    try {
      const tools = await storage.getMcpTools();
      res.json(tools);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/mcp/tools/:id", async (req, res) => {
    try {
      const tool = await storage.getMcpTool(parseInt(req.params.id));
      if (!tool) {
        return res.status(404).json({ error: "Tool not found" });
      }
      res.json(tool);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/mcp/tools", async (req, res) => {
    try {
      const validation = insertMcpToolSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }
      const tool = await storage.createMcpTool(validation.data);
      res.json(tool);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/mcp/tools/:id/execute", async (req, res) => {
    try {
      const result = await mcpSimulator.executeTool(
        parseInt(req.params.id),
        req.body.params || {}
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // MCP Context Providers Routes
  app.get("/api/mcp/providers", async (req, res) => {
    try {
      const providers = await storage.getMcpContextProviders();
      res.json(providers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/mcp/providers", async (req, res) => {
    try {
      const validation = insertMcpContextProviderSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }
      const provider = await storage.createMcpContextProvider(validation.data);
      res.json(provider);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/mcp/providers/:id/extract", async (req, res) => {
    try {
      const results = await contextExtractor.extractContext(parseInt(req.params.id));
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // MCP Requests History
  app.get("/api/mcp/requests", async (req, res) => {
    try {
      const requests = await storage.getMcpRequests();
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // MCP Context Cache
  app.get("/api/mcp/context", async (req, res) => {
    try {
      const providerId = req.query.providerId ? parseInt(req.query.providerId as string) : undefined;
      const cache = await storage.getMcpContextCache(providerId);
      res.json(cache);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/mcp/context/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }
      const results = await contextExtractor.searchContext(query);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GitHub PR Integration Routes
  app.get("/api/github/integrations", async (req, res) => {
    try {
      const integrations = await storage.getGithubPRIntegrations();
      res.json(integrations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/github/webhook", async (req, res) => {
    try {
      const event = req.headers["x-github-event"] as string;
      await githubPRBot.handleWebhook(event, req.body);
      res.json({ message: "Webhook processed" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
