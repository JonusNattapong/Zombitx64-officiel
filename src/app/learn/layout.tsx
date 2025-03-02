import { Card } from "@/components/ui/card";
import Link from "next/link";

interface LayoutProps {
  children: React.ReactNode;
}

const topics = [
  {
    title: "Next.js",
    href: "/learn/nextjs",
  },
  {
    title: "Solidity",
    href: "/learn/solidity",
  },
  {
    title: "AI Cybersecurity",
    href: "/learn/ai-cybersecurity",
  },
];

export default function LearnLayout({ children }: LayoutProps) {
  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="p-4">
          <nav className="space-y-2">
            <Link href="/learn" className="block py-2 px-4 hover:bg-gray-100 rounded">
              Overview
            </Link>
            {topics.map((topic) => (
              <Link
                key={topic.href}
                href={topic.href}
                className="block py-2 px-4 hover:bg-gray-100 rounded"
              >
                {topic.title}
              </Link>
            ))}
          </nav>
        </Card>

        {/* Main content */}
        <div className="md:col-span-3">
          {children}
        </div>
      </div>
    </div>
  );
}
