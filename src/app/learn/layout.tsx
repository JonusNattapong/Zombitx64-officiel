import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LearningPath {
  title: string;
  description: string;
  link: string;
  icon: string;
}

const learningPaths: LearningPath[] = [
  {
    title: "Next.js Development",
    description: "Learn modern web development with Next.js 14 and React",
    link: "/learn/nextjs",
    icon: "🌐",
  },
  {
    title: "Solidity & Web3",
    description: "Master blockchain development with Solidity",
    link: "/learn/solidity",
    icon: "⛓️",
  },
  {
    title: "AI & Cybersecurity",
    description: "Explore AI applications in cybersecurity",
    link: "/learn/ai-cybersecurity",
    icon: "🔒",
  },
];

export default function LearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Learning Hub</h1>
      {children ? (
        children
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningPaths.map((path) => (
            <Card key={path.link}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{path.icon}</span>
                  <span>{path.title}</span>
                </CardTitle>
                <CardDescription>{path.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href={path.link}
                  className="inline-block px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Start Learning
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
