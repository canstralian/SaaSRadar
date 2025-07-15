import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Radar, Menu } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-is-mobile";

interface HeaderProps {
  onGenerateIdea?: () => void;
}

export default function Header({ onGenerateIdea }: { onGenerateIdea: () => void }) {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location === path || (path === "/dashboard" && location === "/");

  const NavigationItems = () => (
    <>
      <Link href="/dashboard" className={`pb-4 transition-colors ${
        isActive("/dashboard") 
          ? "text-primary font-medium border-b-2 border-primary" 
          : "text-muted-foreground hover:text-foreground"
      }`}>
        Dashboard
      </Link>
      <Link href="/opportunities" className={`pb-4 transition-colors ${
        isActive("/opportunities") 
          ? "text-primary font-medium border-b-2 border-primary" 
          : "text-muted-foreground hover:text-foreground"
      }`}>
        Opportunities
      </Link>
      <Link href="/communities" className={`pb-4 transition-colors ${
        isActive("/communities") 
          ? "text-primary font-medium border-b-2 border-primary" 
          : "text-muted-foreground hover:text-foreground"
      }`}>
        Communities
      </Link>
      <Link href="/mcp" className={`pb-4 transition-colors ${
        isActive("/mcp") 
          ? "text-primary font-medium border-b-2 border-primary" 
          : "text-muted-foreground hover:text-foreground"
      }`}>
        MCP Simulator
      </Link>
    </>
  );

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Radar className="text-primary-foreground h-4 w-4" />
                </div>
                <span className="text-xl font-bold text-foreground hidden sm:block">SaaS Radar</span>
                <span className="text-lg font-bold text-foreground sm:hidden">SR</span>
              </div>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <NavigationItems />
            </nav>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {!isMobile && (
              <Button onClick={onGenerateIdea} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                New Monitor
              </Button>
            )}

            {isMobile && (
              <Button onClick={onGenerateIdea} size="icon" className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
              </Button>
            )}

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

            {!isMobile && <div className="w-8 h-8 bg-muted rounded-full"></div>}

            {isMobile && (
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col space-y-6 mt-6">
                    <div className="flex items-center space-x-2">
                      <Radar className="h-6 w-6 text-primary" />
                      <span className="text-lg font-bold text-foreground">SaaS Radar</span>
                    </div>
                    <nav className="flex flex-col space-y-4">
                      <NavigationItems />
                    </nav>
                    <div className="pt-4 border-t">
                      <Button onClick={onGenerateIdea} className="w-full bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        New Monitor
                      </Button>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="w-10 h-10 bg-muted rounded-full"></div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}