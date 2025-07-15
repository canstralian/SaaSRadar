import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Bookmark, Share2, MessageSquare, Users, Clock } from "lucide-react";
import type { Opportunity } from "@shared/schema";

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const getPotentialBadgeClass = (level: string) => {
    switch (level) {
      case "High Potential":
        return "potential-badge high";
      case "Trending":
        return "potential-badge trending";
      default:
        return "potential-badge medium";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  return (
    <Card className="opportunity-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-foreground">{opportunity.title}</h3>
              <div className="flex items-center space-x-2">
                <Badge className={getPotentialBadgeClass(opportunity.potentialLevel)}>
                  {opportunity.potentialLevel}
                </Badge>
                <Badge variant="secondary">{opportunity.category}</Badge>
              </div>
            </div>
            <p className="text-muted-foreground mb-4">{opportunity.description}</p>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{opportunity.mentions} mentions</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{opportunity.communities.join(", ")}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{formatTimeAgo(opportunity.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-2">
              <span className="score-badge">{opportunity.score}</span>
              <div className="text-xs text-muted-foreground">
                <div>Opportunity</div>
                <div>Score</div>
              </div>
            </div>
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500" 
                style={{ width: `${opportunity.score}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 lg:gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-sm lg:text-lg font-semibold text-foreground">{opportunity.estimatedRevenue}</div>
            <div className="text-xs text-muted-foreground">Est. Monthly Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-sm lg:text-lg font-semibold text-foreground">{opportunity.competitionLevel}</div>
            <div className="text-xs text-muted-foreground">Competition Level</div>
          </div>
          <div className="text-center">
            <div className="text-sm lg:text-lg font-semibold text-foreground">{opportunity.timeToMarket}</div>
            <div className="text-xs text-muted-foreground">Time to Market</div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              View Details
            </Button>
            <Button size="sm">
              Generate Business Plan
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
