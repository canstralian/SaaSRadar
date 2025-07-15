import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface GeneratedSaaSIdea {
  title: string;
  description: string;
  category: string;
  estimatedRevenue: string;
  competitionLevel: string;
  timeToMarket: string;
  painPoints: string[];
  score: number;
}

export async function generateSaaSIdea(painPointText: string): Promise<GeneratedSaaSIdea> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert SaaS business idea generator. Based on the pain point provided, generate a comprehensive SaaS business idea. Respond with JSON in this exact format:
          {
            "title": "string",
            "description": "string (2-3 sentences)",
            "category": "string",
            "estimatedRevenue": "string (e.g., '$50K', '$120K')",
            "competitionLevel": "string (Low, Medium, High)",
            "timeToMarket": "string (e.g., '4-6 months', '8-12 months')",
            "painPoints": ["string array of related pain points"],
            "score": number (1-100 based on opportunity potential)
          }`
        },
        {
          role: "user",
          content: `Generate a SaaS business idea based on this pain point: ${painPointText}`
        }
      ],
      response_format: { type: "json_object" },
      timeout: 30000, // 30 second timeout
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      title: result.title || "Untitled SaaS Idea",
      description: result.description || "No description provided",
      category: result.category || "General",
      estimatedRevenue: result.estimatedRevenue || "$50K",
      competitionLevel: result.competitionLevel || "Medium",
      timeToMarket: result.timeToMarket || "6-12 months",
      painPoints: result.painPoints || [painPointText],
      score: Math.max(1, Math.min(100, result.score || 50))
    };
  } catch (error) {
    console.error("Failed to generate SaaS idea:", error);
    throw new Error("Failed to generate SaaS idea: " + (error as Error).message);
  }
}

export async function analyzePainPoints(discussions: string[]): Promise<{
  painPoints: string[];
  severity: string;
  opportunities: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing community discussions to identify pain points and business opportunities. Analyze the provided discussions and respond with JSON in this format:
          {
            "painPoints": ["array of identified pain points"],
            "severity": "string (Low, Medium, High, Critical)",
            "opportunities": number (count of potential SaaS opportunities)
          }`
        },
        {
          role: "user",
          content: `Analyze these discussions for pain points and opportunities: ${discussions.join('\n---\n')}`
        }
      ],
      response_format: { type: "json_object" },
      timeout: 30000, // 30 second timeout
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      painPoints: result.painPoints || [],
      severity: result.severity || "Medium",
      opportunities: result.opportunities || 0
    };
  } catch (error) {
    console.error("Failed to analyze pain points:", error);
    throw new Error("Failed to analyze pain points: " + (error as Error).message);
  }
}