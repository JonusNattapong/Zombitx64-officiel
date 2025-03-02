import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NextjsPage() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Next.js Documentation</CardTitle>
          <CardDescription>
            Learn about Next.js features and API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Placeholder content for Next.js documentation.</p>
          {/* Add more content here */}
        </CardContent>
      </Card>
    </div>
  );
}
