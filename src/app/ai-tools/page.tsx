"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brain, Code, Shield, Search, Zap, BarChart } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: JSX.Element;
  status: "free" | "premium";
  usageCount: number;
}

const tools: Tool[] = [
  {
    id: "1",
    name: "AI Model Analyzer",
    description: "Analyze and optimize your AI models for better performance and security.",
    category: "Analysis",
    icon: <Brain className="w-8 h-8" />,
    status: "premium",
    usageCount: 1520,
  },
  {
    id: "2",
    name: "Code Scanner",
    description: "Scan your code for potential vulnerabilities and security issues.",
    category: "Security",
    icon: <Code className="w-8 h-8" />,
    status: "free",
    usageCount: 2341,
  },
  {
    id: "3",
    name: "Threat Detector",
    description: "Real-time threat detection for your AI applications.",
    category: "Security",
    icon: <Shield className="w-8 h-8" />,
    status: "premium",
    usageCount: 890,
  },
  {
    id: "4",
    name: "Dataset Explorer",
    description: "Explore and analyze your datasets for AI training.",
    category: "Analysis",
    icon: <Search className="w-8 h-8" />,
    status: "free",
    usageCount: 1750,
  },
  {
    id: "5",
    name: "Model Optimizer",
    description: "Optimize your AI models for better performance.",
    category: "Optimization",
    icon: <Zap className="w-8 h-8" />,
    status: "premium",
    usageCount: 1230,
  },
  {
    id: "6",
    name: "Performance Monitor",
    description: "Monitor your AI models' performance in real-time.",
    category: "Monitoring",
    icon: <BarChart className="w-8 h-8" />,
    status: "free",
    usageCount: 980,
  },
];

export default function AIToolsPage() {
  const [category, setCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredTools = tools.filter((tool) => {
    const matchesCategory = category === "all" || tool.category === category;
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">AI Tools</h1>
          <p className="text-muted-foreground mt-2">
            Powerful tools for AI development and security
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="flex-1">
          <Input
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Analysis">Analysis</SelectItem>
            <SelectItem value="Security">Security</SelectItem>
            <SelectItem value="Optimization">Optimization</SelectItem>
            <SelectItem value="Monitoring">Monitoring</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <Card key={tool.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {tool.icon}
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {tool.name}
                    {tool.status === "premium" && (
                      <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                        Premium
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>{tool.category}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-muted-foreground">{tool.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                {tool.usageCount.toLocaleString()} uses
              </span>
              <Button>
                Launch Tool
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
