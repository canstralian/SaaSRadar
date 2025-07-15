import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import StatsOverview from "@/components/stats-overview";
import OpportunityCard from "@/components/opportunity-card";
import ActivityFeed from "@/components/activity-feed";
import CommunitiesPanel from "@/components/communities-panel";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Opportunity } from "@shared/schema";

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score");
  const { toast } = useToast();

  const { data: opportunities, isLoading, refetch } = useQuery({
    queryKey: ["/api/opportunities"],
    select: (data: Opportunity[]) => {
      let filtered = data;
      
      if (searchTerm) {
        filtered = filtered.filter(opp => 
          opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (categoryFilter !== "all") {
        filtered = filtered.filter(opp => 
          opp.category.toLowerCase() === categoryFilter.toLowerCase()
        );
      }
      
      // Sort by score (high to low) by default
      filtered.sort((a, b) => {
        if (sortBy === "score") return b.score - a.score;
        if (sortBy === "recent") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return 0;
      });
      
      return filtered;
    }
  });

  const handleGenerateIdea = async () => {
    try {
      const painPoint = "Users struggle with managing their daily tasks and productivity";
      await apiRequest("POST", "/api/opportunities/generate", { painPoint });
      refetch();
      toast({
        title: "Success",
        description: "New SaaS idea generated successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate SaaS idea. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl p-6 shadow-sm border border-border">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onGenerateIdea={handleGenerateIdea} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            {/* Filter Controls */}
            <div className="bg-card rounded-xl p-4 lg:p-6 shadow-sm border border-border">
              <div className="flex flex-col space-y-4">
                <h2 className="text-lg lg:text-xl font-bold text-foreground">Trending Opportunities</h2>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search opportunities..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 sm:gap-4">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="developer tools">Developer Tools</SelectItem>
                      <SelectItem value="hr & wellness">HR & Wellness</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="productivity">Productivity</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="e-commerce">E-commerce</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="score">Score: High to Low</SelectItem>
                      <SelectItem value="recent">Recent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Opportunity Cards */}
            <div className="space-y-6">
              {opportunities?.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
              
              {opportunities?.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No opportunities found matching your criteria.</p>
                </div>
              )}
            </div>

            {/* Load More Button */}
            {opportunities && opportunities.length > 0 && (
              <div className="text-center">
                <Button variant="outline" className="px-6 py-3">
                  Load More Opportunities
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <ActivityFeed />
            <CommunitiesPanel />
            
            {/* AI Analysis Status */}
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-6">AI Analysis Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pain Point Detection</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-sm font-medium text-secondary">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Opportunity Scoring</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-sm font-medium text-secondary">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Trend Analysis</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-sm font-medium text-accent">Processing</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Market Validation</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-sm font-medium text-secondary">Active</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-4 bg-primary rounded flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded"></div>
                  </div>
                  <span className="text-sm font-medium text-foreground">Next AI Analysis</span>
                </div>
                <p className="text-sm text-muted-foreground">Deep market research for top 10 opportunities</p>
                <p className="text-xs text-muted-foreground mt-1">Scheduled for 2:00 PM</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start space-x-3"
                  onClick={handleGenerateIdea}
                >
                  <Plus className="h-4 w-4 text-primary" />
                  <span>Generate New Idea</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start space-x-3">
                  <div className="h-4 w-4 text-primary">📊</div>
                  <span>Export Report</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start space-x-3">
                  <div className="h-4 w-4 text-primary">⚙️</div>
                  <span>Settings</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start space-x-3">
                  <div className="h-4 w-4 text-primary">❓</div>
                  <span>Help & Support</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
