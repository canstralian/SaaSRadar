import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  score: integer("score").notNull(),
  potentialLevel: text("potential_level").notNull(), // "High Potential", "Trending", "Medium"
  mentions: integer("mentions").notNull(),
  communities: text("communities").array().notNull(),
  estimatedRevenue: text("estimated_revenue").notNull(),
  competitionLevel: text("competition_level").notNull(), // "Low", "Medium", "High"
  timeToMarket: text("time_to_market").notNull(),
  painPoints: text("pain_points").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  platform: text("platform").notNull(), // "reddit", "twitter", "linkedin", "hackernews"
  memberCount: text("member_count"),
  painPointsDetected: integer("pain_points_detected").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const painPoints = pgTable("pain_points", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  communityId: integer("community_id").references(() => communities.id),
  mentions: integer("mentions").notNull().default(1),
  severity: text("severity").notNull(), // "Low", "Medium", "High", "Critical"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activityFeed = pgTable("activity_feed", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "pain_point", "opportunity", "mention", "trend"
  message: text("message").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOpportunitySchema = createInsertSchema(opportunities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunitySchema = createInsertSchema(communities).omit({
  id: true,
  createdAt: true,
});

export const insertPainPointSchema = createInsertSchema(painPoints).omit({
  id: true,
  createdAt: true,
});

export const insertActivityFeedSchema = createInsertSchema(activityFeed).omit({
  id: true,
  createdAt: true,
});

export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type Community = typeof communities.$inferSelect;
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type PainPoint = typeof painPoints.$inferSelect;
export type InsertPainPoint = z.infer<typeof insertPainPointSchema>;
export type ActivityFeed = typeof activityFeed.$inferSelect;
export type InsertActivityFeed = z.infer<typeof insertActivityFeedSchema>;

// MCP Simulator Schema
export const mcpTools = pgTable("mcp_tools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  schema: jsonb("schema").notNull(), // JSON schema for tool parameters
  category: text("category").notNull().default("general"),
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mcpContextProviders = pgTable("mcp_context_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'file', 'api', 'database', 'git'
  config: jsonb("config").notNull(), // Provider-specific configuration
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mcpRequests = pgTable("mcp_requests", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_id").references(() => mcpTools.id),
  input: jsonb("input").notNull(),
  output: jsonb("output"),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  error: text("error"),
  executionTime: integer("execution_time"), // milliseconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mcpContextCache = pgTable("mcp_context_cache", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").references(() => mcpContextProviders.id),
  key: text("key").notNull(),
  value: jsonb("value").notNull(),
  metadata: jsonb("metadata"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const githubPRIntegrations = pgTable("github_pr_integrations", {
  id: serial("id").primaryKey(),
  repoUrl: text("repo_url").notNull(),
  branch: text("branch").notNull(),
  prNumber: integer("pr_number"),
  status: text("status").notNull().default("pending"),
  mcpContext: jsonb("mcp_context"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertMcpToolSchema = createInsertSchema(mcpTools).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMcpContextProviderSchema = createInsertSchema(mcpContextProviders).omit({
  id: true,
  createdAt: true,
});

export const insertMcpRequestSchema = createInsertSchema(mcpRequests).omit({
  id: true,
  createdAt: true,
});

export const insertMcpContextCacheSchema = createInsertSchema(mcpContextCache).omit({
  id: true,
  createdAt: true,
});

export const insertGithubPRIntegrationSchema = createInsertSchema(githubPRIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type McpTool = typeof mcpTools.$inferSelect;
export type InsertMcpTool = z.infer<typeof insertMcpToolSchema>;

export type McpContextProvider = typeof mcpContextProviders.$inferSelect;
export type InsertMcpContextProvider = z.infer<typeof insertMcpContextProviderSchema>;

export type McpRequest = typeof mcpRequests.$inferSelect;
export type InsertMcpRequest = z.infer<typeof insertMcpRequestSchema>;

export type McpContextCache = typeof mcpContextCache.$inferSelect;
export type InsertMcpContextCache = z.infer<typeof insertMcpContextCacheSchema>;

export type GithubPRIntegration = typeof githubPRIntegrations.$inferSelect;
export type InsertGithubPRIntegration = z.infer<typeof insertGithubPRIntegrationSchema>;
