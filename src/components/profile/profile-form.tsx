"use client";

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string | null;
  nameChanges: { createdAt: Date }[];
  createdAt: Date;
};

type ProfileFormData = {
  name: string;
  image?: FileList;
};

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
};

export function ProfileForm({
  user,
  canChangeName,
  nextNameChangeDate,
}: {
  user: User;
  canChangeName?: boolean | null;
  nextNameChangeDate?: Date | null;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const { toast } = useToast();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user.name || "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", data.name);
    if (data.image?.[0]) {
      formData.append("image", data.image[0]);
    }

    const response = await fetch("/api/user/profile", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      // Refresh the page to show updated data
      window.location.reload();
    } else {
      const errorData = await response.json();
      toast({
        title: "Error",
        description: errorData.error || "Failed to update profile",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsPasswordChanging(true);

    try {
      const response = await fetch("/api/user/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Password updated",
          description: "Your password has been changed successfully",
        });
        passwordForm.reset(); // Reset password form fields
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to update password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsPasswordChanging(false);
    }
  };

  return (
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
        <form
          onSubmit={handleProfileSubmit(onProfileSubmit)}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...registerProfile("name", { required: "Name is required" })}
              />
              {profileErrors.name && (
                <p className="text-red-500 text-sm">
                  {profileErrors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="image">Profile Image</Label>
              <Input id="image" type="file" {...registerProfile("image")} />
            </div>
            <div>
              <span className="font-medium">Email:</span> {user.email}
            </div>
            <div>
              <span className="font-medium">Role:</span> {user.role || "User"}
            </div>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
          {!canChangeName && nextNameChangeDate && (
            <div className="text-sm text-muted-foreground">
              You can change your name again after{" "}
              {formatDate(nextNameChangeDate)}
            </div>
          )}
        </form>

        {/* Password Change Form */}
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Change Password</h3>
          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...passwordForm.register("currentPassword", {
                  required: "Current password is required",
                })}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-red-500 text-sm">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...passwordForm.register("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-red-500 text-sm">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <Button type="submit" variant="outline" disabled={isPasswordChanging}>
              {isPasswordChanging ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
