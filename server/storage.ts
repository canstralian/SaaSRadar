import { opportunities, communities, painPoints, activityFeed, type Opportunity, type InsertOpportunity, type Community, type InsertCommunity, type PainPoint, type InsertPainPoint, type ActivityFeed, type InsertActivityFeed } from "@shared/schema";

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
  private users: Map<number, any>;
  private currentOpportunityId: number;
  private currentCommunityId: number;
  private currentPainPointId: number;
  private currentActivityId: number;
  private currentUserId: number;

  constructor() {
    this.opportunities = new Map();
    this.communities = new Map();
    this.painPoints = new Map();
    this.activityFeed = new Map();
    this.users = new Map();
    this.currentOpportunityId = 1;
    this.currentCommunityId = 1;
    this.currentPainPointId = 1;
    this.currentActivityId = 1;
    this.currentUserId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
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
}

export const storage = new MemStorage();
