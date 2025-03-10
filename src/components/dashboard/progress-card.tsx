import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Challenge {
  id: string;
  title: string;
  progress: number;
}

interface ProgressCardProps {
  challenges: Challenge[];
}

export function ProgressCard({ challenges }: ProgressCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Challenge Progress</CardTitle>
        <CardDescription>Track your ongoing challenges</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.length === 0 ? (
          <p className="text-center text-muted-foreground">No active challenges</p>
        ) : (
          challenges.map((challenge) => (
            <div key={challenge.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{challenge.title}</span>
                <span>{challenge.progress}%</span>
              </div>
              <Progress value={challenge.progress} className="h-2" />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
