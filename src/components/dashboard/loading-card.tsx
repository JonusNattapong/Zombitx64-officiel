import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingCardProps {
  title: string;
  items?: number;
}

export function LoadingCard({ title, items = 3 }: LoadingCardProps) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[150px]" />
        <Skeleton className="h-4 w-[200px]" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-4 w-[60px]" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
