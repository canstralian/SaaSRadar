import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Search, Lightbulb, Star, TrendingUp } from "lucide-react";

interface StatsData {
  activeMonitors: number;
  painPointsDetected: number;
  saasIdeasGenerated: number;
  highPotentialIdeas: number;
}

export default function StatsOverview() {
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ["/api/stats"]
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="stats-card">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      title: "Active Monitors",
      value: stats?.activeMonitors || 0,
      icon: Eye,
      color: "text-primary",
      bgColor: "bg-primary/10",
      change: "+12%",
      period: "vs last month"
    },
    {
      title: "Pain Points Detected",
      value: stats?.painPointsDetected || 0,
      icon: Search,
      color: "text-accent",
      bgColor: "bg-accent/10",
      change: "+8%",
      period: "vs last week"
    },
    {
      title: "SaaS Ideas Generated",
      value: stats?.saasIdeasGenerated || 0,
      icon: Lightbulb,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      change: "+23%",
      period: "vs last week"
    },
    {
      title: "High-Potential Ideas",
      value: stats?.highPotentialIdeas || 0,
      icon: Star,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      change: "+15%",
      period: "vs last week"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((item) => (
        <Card key={item.title} className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <p className="text-2xl font-bold text-foreground">{item.value.toLocaleString()}</p>
              </div>
              <div className={`w-12 h-12 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-secondary mr-1" />
              <span className="text-secondary font-medium">{item.change}</span>
              <span className="text-muted-foreground ml-1">{item.period}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
