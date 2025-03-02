import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { User } from "next-auth";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const user: User | undefined = session?.user;

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Profile</h1>
      {user ? (
        <div>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          {/* <p>Wallet Address: {user.walletAddress}</p> */}
        </div>
      ) : (
        <p>Please log in to view your profile.</p>
      )}
    </div>
  );
}
