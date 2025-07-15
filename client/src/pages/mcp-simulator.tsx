import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  PlayCircle, 
  RefreshCw, 
  GitBranch, 
  Search, 
  FileCode, 
  Database, 
  Globe,
  History,
  CheckCircle,
  XCircle
} from "lucide-react";

interface McpTool {
  id: number;
  name: string;
  description: string;
  schema: any;
  category: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface McpContextProvider {
  id: number;
  name: string;
  type: string;
  config: any;
  enabled: boolean;
  createdAt: string;
}

interface McpRequest {
  id: number;
  toolId: number | null;
  input: any;
  output: any;
  status: string;
  error: string | null;
  executionTime: number | null;
  createdAt: string;
}

export default function McpSimulator() {
  const [selectedTool, setSelectedTool] = useState<McpTool | null>(null);
  const [toolParams, setToolParams] = useState<string>("{}");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch MCP tools
  const { data: tools = [], isLoading: toolsLoading } = useQuery<McpTool[]>({
    queryKey: ["/api/mcp/tools"]
  });

  // Fetch context providers
  const { data: providers = [], isLoading: providersLoading } = useQuery<McpContextProvider[]>({
    queryKey: ["/api/mcp/providers"]
  });

  // Fetch request history
  const { data: requests = [], isLoading: requestsLoading } = useQuery<McpRequest[]>({
    queryKey: ["/api/mcp/requests"]
  });

  // Execute tool mutation
  const executeTool = useMutation({
    mutationFn: async ({ toolId, params }: { toolId: number; params: any }) => {
      return apiRequest(`/api/mcp/tools/${toolId}/execute`, {
        method: "POST",
        body: JSON.stringify({ params })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mcp/requests"] });
      toast({
        title: "Tool executed successfully",
        description: "The tool has been executed and results are available."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Execution failed",
        description: error.message || "Failed to execute the tool",
        variant: "destructive"
      });
    }
  });

  // Extract context mutation
  const extractContext = useMutation({
    mutationFn: async (providerId: number) => {
      return apiRequest(`/api/mcp/providers/${providerId}/extract`, {
        method: "POST"
      });
    },
    onSuccess: () => {
      toast({
        title: "Context extracted",
        description: "Context has been successfully extracted and cached."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Extraction failed",
        description: error.message || "Failed to extract context",
        variant: "destructive"
      });
    }
  });

  const handleExecuteTool = () => {
    if (!selectedTool) return;
    
    try {
      const params = JSON.parse(toolParams);
      executeTool.mutate({ toolId: selectedTool.id, params });
    } catch (error) {
      toast({
        title: "Invalid parameters",
        description: "Please provide valid JSON parameters",
        variant: "destructive"
      });
    }
  };

  const getToolIcon = (category: string) => {
    switch (category) {
      case "search": return <Search className="h-4 w-4" />;
      case "file": return <FileCode className="h-4 w-4" />;
      case "analysis": return <Database className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case "git": return <GitBranch className="h-4 w-4" />;
      case "file": return <FileCode className="h-4 w-4" />;
      case "database": return <Database className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">MCP Simulator</h1>
        <p className="text-muted-foreground">
          Model Context Protocol simulator with Ghostwriter-style context extraction and CI/CD integration
        </p>
      </div>

      <Tabs defaultValue="tools" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="providers">Context Providers</TabsTrigger>
          <TabsTrigger value="history">Request History</TabsTrigger>
          <TabsTrigger value="search">Context Search</TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Tools</CardTitle>
                <CardDescription>Select a tool to execute</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {toolsLoading ? (
                      <p>Loading tools...</p>
                    ) : (
                      tools.map((tool) => (
                        <div
                          key={tool.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedTool?.id === tool.id
                              ? "border-primary bg-primary/10"
                              : "border-border hover:bg-muted/50"
                          }`}
                          onClick={() => {
                            setSelectedTool(tool);
                            setToolParams(JSON.stringify(
                              tool.schema?.properties 
                                ? Object.keys(tool.schema.properties).reduce((acc, key) => ({
                                    ...acc,
                                    [key]: tool.schema.properties[key].default || ""
                                  }), {})
                                : {},
                              null,
                              2
                            ));
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getToolIcon(tool.category)}
                              <h4 className="font-semibold">{tool.name}</h4>
                            </div>
                            <Badge variant={tool.enabled ? "default" : "secondary"}>
                              {tool.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                          <Badge variant="outline" className="mt-2">
                            {tool.category}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tool Execution</CardTitle>
                <CardDescription>
                  {selectedTool ? `Execute ${selectedTool.name}` : "Select a tool to execute"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedTool ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Tool Schema</Label>
                      <pre className="p-2 bg-muted rounded text-xs overflow-auto max-h-[150px]">
                        {JSON.stringify(selectedTool.schema, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <Label htmlFor="params">Parameters (JSON)</Label>
                      <Textarea
                        id="params"
                        value={toolParams}
                        onChange={(e) => setToolParams(e.target.value)}
                        placeholder='{"query": "example search"}'
                        className="font-mono h-[120px]"
                      />
                    </div>
                    <Button
                      onClick={handleExecuteTool}
                      disabled={!selectedTool.enabled || executeTool.isPending}
                      className="w-full"
                    >
                      {executeTool.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Execute Tool
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>
                      Select a tool from the list to view its details and execute it.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Context Providers</CardTitle>
              <CardDescription>Manage and extract context from various sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providersLoading ? (
                  <p>Loading providers...</p>
                ) : (
                  providers.map((provider) => (
                    <Card key={provider.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getProviderIcon(provider.type)}
                            <h4 className="font-semibold">{provider.name}</h4>
                          </div>
                          <Badge variant={provider.enabled ? "default" : "secondary"}>
                            {provider.enabled ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Type:</span> {provider.type}
                          </p>
                          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-[100px]">
                            {JSON.stringify(provider.config, null, 2)}
                          </pre>
                          <Button
                            size="sm"
                            onClick={() => extractContext.mutate(provider.id)}
                            disabled={!provider.enabled || extractContext.isPending}
                            className="w-full"
                          >
                            {extractContext.isPending ? (
                              <>
                                <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                                Extracting...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="mr-2 h-3 w-3" />
                                Extract Context
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request History</CardTitle>
              <CardDescription>View past tool executions and their results</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {requestsLoading ? (
                    <p>Loading history...</p>
                  ) : requests.length === 0 ? (
                    <Alert>
                      <AlertDescription>No requests have been made yet.</AlertDescription>
                    </Alert>
                  ) : (
                    requests.map((request) => (
                      <Card key={request.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {request.status === "completed" ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className="font-medium">
                                Request #{request.id}
                              </span>
                            </div>
                            <Badge variant={request.status === "completed" ? "default" : "destructive"}>
                              {request.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Tool ID:</span> {request.toolId || "N/A"}
                            </div>
                            <div>
                              <span className="font-medium">Execution Time:</span>{" "}
                              {request.executionTime ? `${request.executionTime}ms` : "N/A"}
                            </div>
                            <div>
                              <span className="font-medium">Input:</span>
                              <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-[100px]">
                                {JSON.stringify(request.input, null, 2)}
                              </pre>
                            </div>
                            {request.output && (
                              <div>
                                <span className="font-medium">Output:</span>
                                <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-[100px]">
                                  {JSON.stringify(request.output, null, 2)}
                                </pre>
                              </div>
                            )}
                            {request.error && (
                              <div>
                                <span className="font-medium text-red-500">Error:</span>
                                <p className="mt-1 text-red-500">{request.error}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Context Search</CardTitle>
              <CardDescription>Search through extracted context data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search context..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        // Trigger search
                      }
                    }}
                  />
                  <Button>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <Alert>
                  <AlertDescription>
                    Enter a search query to find relevant context from all extracted sources.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}