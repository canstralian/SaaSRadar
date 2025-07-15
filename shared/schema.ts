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
