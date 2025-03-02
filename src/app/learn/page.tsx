import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LearnPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to the Learning Hub</CardTitle>
        <CardDescription>
          Explore our comprehensive learning resources and start your journey in web development,
          blockchain, and cybersecurity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Getting Started</h3>
          <p>
            Choose a topic from the sidebar to begin learning. Each section contains detailed
            tutorials, examples, and hands-on exercises to help you master the concepts.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Learning Paths</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Next.js Development:</strong> Learn modern web development with Next.js
            </li>
            <li>
              <strong>Blockchain Development:</strong> Master Solidity and Web3
            </li>
            <li>
              <strong>AI & Cybersecurity:</strong> Explore AI applications in security
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
