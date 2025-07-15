import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Radar } from "lucide-react";
import { Link, useLocation } from "wouter";

interface HeaderProps {
  onGenerateIdea?: () => void;
}

export default function Header({ onGenerateIdea }: HeaderProps) {
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    return location === path || (path === "/dashboard" && location === "/");
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Radar className="text-primary-foreground h-4 w-4" />
                </div>
                <span className="text-xl font-bold text-foreground">SaaS Radar</span>
              </div>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/dashboard">
                <a className={`pb-4 transition-colors ${
                  isActive("/dashboard") 
                    ? "text-primary font-medium border-b-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}>
                  Dashboard
                </a>
              </Link>
              <Link href="/opportunities">
                <a className={`pb-4 transition-colors ${
                  isActive("/opportunities") 
                    ? "text-primary font-medium border-b-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}>
                  Opportunities
                </a>
              </Link>
              <Link href="/communities">
                <a className={`pb-4 transition-colors ${
                  isActive("/communities") 
                    ? "text-primary font-medium border-b-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}>
                  Communities
                </a>
              </Link>
              <Link href="/mcp">
                <a className={`pb-4 transition-colors ${
                  isActive("/mcp") 
                    ? "text-primary font-medium border-b-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}>
                  MCP Simulator
                </a>
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={onGenerateIdea} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              New Monitor
            </Button>
            <div className="relative">
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </div>
            <div className="w-8 h-8 bg-muted rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
}
