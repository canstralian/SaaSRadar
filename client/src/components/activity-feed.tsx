import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ActivityFeed } from "@shared/schema";

export default function ActivityFeed() {
  const { data: activities, isLoading } = useQuery<ActivityFeed[]>({
    queryKey: ["/api/activity-feed"],
  });

  const getActivityDotClass = (type: string) => {
    switch (type) {
      case "opportunity":
        return "activity-dot primary";
      case "pain_point":
        return "activity-dot primary";
      case "mention":
        return "activity-dot secondary";
      case "trend":
        return "activity-dot alert";
      case "community":
        return "activity-dot primary";
      default:
        return "activity-dot primary";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Live Activity Feed</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Live</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="activity-item">
                <div className="w-2 h-2 bg-muted rounded-full mt-2"></div>
                <div className="flex-1 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
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
        <CardTitle className="flex items-center justify-between">
          <span>Live Activity Feed</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse-dot"></div>
            <Badge variant="outline" className="text-xs">Live</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities?.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className={getActivityDotClass(activity.type)}></div>
              <div className="flex-1">
                <p className="text-sm text-foreground">{activity.message}</p>
                <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
        <Button variant="link" className="w-full mt-4 text-sm text-primary hover:text-primary/80">
          View All Activity
        </Button>
      </CardContent>
    </Card>
  );
}
