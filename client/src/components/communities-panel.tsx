import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Community } from "@shared/schema";

export default function CommunitiesPanel() {
  const { data: communities, isLoading } = useQuery<Community[]>({
    queryKey: ["/api/communities"],
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "reddit":
        return "🔴";
      case "twitter":
        return "🐦";
      case "linkedin":
        return "💼";
      case "hackernews":
        return "🌐";
      default:
        return "💬";
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "reddit":
        return "bg-orange-100 text-orange-600";
      case "twitter":
        return "bg-blue-100 text-blue-600";
      case "linkedin":
        return "bg-blue-100 text-blue-600";
      case "hackernews":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Communities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="community-item">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-24 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-16"></div>
                  </div>
                </div>
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-8 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Communities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {communities?.map((community) => (
            <div key={community.id} className="community-item">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getPlatformColor(community.platform)}`}>
                  <span className="text-sm">{getPlatformIcon(community.platform)}</span>
                </div>
                <div>
                  <div className="font-medium text-foreground">{community.name}</div>
                  <div className="text-xs text-muted-foreground">{community.memberCount}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">{community.painPointsDetected}</div>
                <div className="text-xs text-muted-foreground">pain points</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
