// This file provides mock data structure for development reference
// The actual data comes from the backend API

export interface MockOpportunity {
  id: number;
  title: string;
  description: string;
  category: string;
  score: number;
  potentialLevel: "High Potential" | "Trending" | "Medium";
  mentions: number;
  communities: string[];
  estimatedRevenue: string;
  competitionLevel: "Low" | "Medium" | "High";
  timeToMarket: string;
  painPoints: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MockCommunity {
  id: number;
  name: string;
  platform: string;
  memberCount: string;
  painPointsDetected: number;
  isActive: boolean;
  createdAt: Date;
}

export interface MockActivity {
  id: number;
  type: "pain_point" | "opportunity" | "mention" | "trend" | "community";
  message: string;
  metadata?: any;
  createdAt: Date;
}

export interface MockStats {
  activeMonitors: number;
  painPointsDetected: number;
  saasIdeasGenerated: number;
  highPotentialIdeas: number;
}

// Mock data for development reference only
export const mockOpportunities: MockOpportunity[] = [
  {
    id: 1,
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
    painPoints: ["Manual code reviews take too long", "Inconsistent coding standards"],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const mockCommunities: MockCommunity[] = [
  {
    id: 1,
    name: "r/entrepreneur",
    platform: "reddit",
    memberCount: "1.2M members",
    painPointsDetected: 847,
    isActive: true,
    createdAt: new Date()
  }
];

export const mockActivities: MockActivity[] = [
  {
    id: 1,
    type: "pain_point",
    message: "New pain point detected in r/webdev",
    metadata: { community: "r/webdev" },
    createdAt: new Date()
  }
];

export const mockStats: MockStats = {
  activeMonitors: 24,
  painPointsDetected: 1847,
  saasIdeasGenerated: 156,
  highPotentialIdeas: 42
};
