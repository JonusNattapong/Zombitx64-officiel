import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>View and manage your profile information.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Name: {session.user.name}</p>
          <p>Email: {session.user.email}</p>
          {/* Add more profile information here */}
        </CardContent>
      </Card>
    </div>
  );
}
