import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { User } from "next-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const user: User | undefined = session?.user;

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Profile</h1>
      {user ? (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
                <Avatar>
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback>{user.name ? user.name[0] : "U"}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle>{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <span className="font-medium">Name:</span> {user.name}
                </div>
                <div>
                    <span className="font-medium">Email:</span> {user.email}
                </div>
                <div>
                    <span className="font-medium">Role:</span> {user.role || "User"}
                </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <p>Please log in to view your profile.</p>
      )}
    </div>
  );
}
