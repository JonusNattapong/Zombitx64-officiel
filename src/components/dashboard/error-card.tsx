import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorCardProps {
  title: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorCard({ title, message, onRetry }: ErrorCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {message || "An error occurred while loading the data."}
        </p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry} className="w-full">
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
