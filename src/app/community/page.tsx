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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp, Users, BookMarked } from "lucide-react";

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  likes: number;
  comments: number;
  category: string;
  timestamp: string;
}

const mockPosts: Post[] = [
  {
    id: "1",
    author: {
      name: "John Doe",
      avatar: "https://github.com/shadcn.png",
    },
    content: "Just completed my first AI model deployment! Check out my tutorial on model optimization techniques.",
    likes: 24,
    comments: 5,
    category: "AI Development",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    author: {
      name: "Jane Smith",
      avatar: "https://github.com/shadcn.png",
    },
    content: "Looking for collaborators on a blockchain-based AI marketplace project. DM if interested!",
    likes: 15,
    comments: 8,
    category: "Collaboration",
    timestamp: "4 hours ago",
  },
  {
    id: "3",
    author: {
      name: "Alex Johnson",
      avatar: "https://github.com/shadcn.png",
    },
    content: "Wrote a comprehensive guide on smart contract security best practices. Let me know your thoughts!",
    likes: 32,
    comments: 12,
    category: "Web3",
    timestamp: "6 hours ago",
  },
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("discussions");

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Community</h1>
          <p className="text-muted-foreground mt-2">
            Connect, collaborate, and learn with fellow developers
          </p>
        </div>
        <Button>Create Post</Button>
      </div>

      <Tabs defaultValue="discussions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="discussions">
            <MessageSquare className="w-4 h-4 mr-2" />
            Discussions
          </TabsTrigger>
          <TabsTrigger value="projects">
            <Users className="w-4 h-4 mr-2" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="resources">
            <BookMarked className="w-4 h-4 mr-2" />
            Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discussions" className="space-y-4">
          <div className="flex space-x-4 mb-6">
            <Input placeholder="Search discussions..." className="max-w-sm" />
            <Button variant="outline">Filter</Button>
          </div>

          {mockPosts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{post.author.name}</CardTitle>
                    <CardDescription>{post.timestamp}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p>{post.content}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex space-x-4">
                  <Button variant="ghost" size="sm">
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {post.comments}
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {post.category}
                </span>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>
                Find projects to collaborate on or start your own
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Project listings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Community Resources</CardTitle>
              <CardDescription>
                Helpful resources shared by the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Resource library coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
