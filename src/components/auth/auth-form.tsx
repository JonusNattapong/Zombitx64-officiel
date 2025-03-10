"use client"

import * as React from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast"
import { Icons } from "@/components/ui/icons"

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  type: "login" | "register"
}

interface FormData {
  email: string
  password: string
  name?: string
  rememberMe?: boolean
}

function validateAuthForm(data: FormData) {
    const errors: Partial<FormData> = {};

    if (!data.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Email is invalid";
    }

    if (!data.password) {
      errors.password = "Password is required";
    } else if (data.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (data.name && data.name.length < 3) {
        errors.name = "Name must be at least 3 characters";
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
}

export function AuthForm({ className, type, ...props }: AuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [loginAttempts, setLoginAttempts] = React.useState<number>(0);
  const [isLocked, setIsLocked] = React.useState<boolean>(false);
  const loginCooldownTime = 300000; // 5 minutes in milliseconds

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  React.useEffect(() => {
    if (isLocked) {
      const timer = setTimeout(() => {
        setIsLocked(false);
        setLoginAttempts(0);
      }, loginCooldownTime);
      return () => clearTimeout(timer);
    }
  }, [isLocked]);

  async function onSubmit(data: FormData) {
    if (isLocked) {
      toast({
        title: "Account Locked",
        description: "Too many login attempts. Please try again in 5 minutes.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const validation = validateAuthForm(data);
    if (!validation.valid) {
      Object.entries(validation.errors || {}).forEach(([_, message]) => {
        toast({
          title: "Validation Error",
          description: message,
          variant: "destructive",
        });
      });
      setIsLoading(false);
      return;
    }

    try {
      if (type === "login") {
        const result = await signIn("credentials", {
          redirect: false,
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe,
        });

        if (!result?.error) {
          toast({
            title: "Success",
            description: "Logged in successfully",
          });
          router.push("/");
          router.refresh();
          reset();
          setLoginAttempts(0);
        } else {
          const newAttempts = loginAttempts + 1;
          setLoginAttempts(newAttempts);
          
          if (newAttempts >= 5) {
            setIsLocked(true);
            toast({
              title: "Account Locked",
              description: "Too many failed attempts. Please try again in 5 minutes.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: "Invalid credentials. Attempts remaining: " + (5 - newAttempts),
              variant: "destructive",
            });
          }
        }
      } else {
        // Register
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          toast({
            title: "Success",
            description: "Account created successfully",
          });
          // After successful registration, sign in automatically
          const result = await signIn("credentials", {
            redirect: false,
            email: data.email,
            password: data.password,
          });

          if (!result?.error) {
            router.push("/");
            router.refresh();
          }
        } else {
          const errorData = await response.json();
          toast({
            title: "Error",
            description: errorData.error || "Registration failed",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          {type === "register" && (
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                type="text"
                disabled={isLoading || isLocked}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoComplete="email"
              disabled={isLoading || isLocked}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              disabled={isLoading || isLocked}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          {type === "login" && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded border-gray-300"
                  disabled={isLoading || isLocked}
                  {...register("rememberMe")}
                />
                <Label htmlFor="remember">Remember me</Label>
              </div>
              <Button
                variant="link"
                className="px-0 font-normal"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/forgot-password");
                }}
                disabled={isLoading || isLocked}
              >
                Forgot password?
              </Button>
            </div>
          )}
          <Button disabled={isLoading || isLocked}>
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                {type === "login" ? "Signing in..." : "Creating account..."}
              </>
            ) : (
              <>{type === "login" ? "Sign In" : "Sign Up"}</>
            )}
          </Button>
          {isLocked && (
            <p className="text-sm text-red-500 text-center">
              Account locked. Please try again in 5 minutes.
            </p>
          )}
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="grid gap-2">
        <Button
          variant="outline"
          type="button"
          disabled={isLoading || isLocked}
          onClick={async () => {
            try {
              setIsLoading(true);
              await signIn("google", {
                redirect: false,
              }).then((result) => {
                if (result?.error) {
                  console.error("Google sign in error:", result.error);
                  toast({
                    title: "Error",
                    description: "Failed to sign in with Google. Please try again.",
                    variant: "destructive",
                  });
                }
                if (result?.ok) {
                  router.push("/");
                  router.refresh();
                }
              });
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to connect with Google. Please try again.",
                variant: "destructive",
              });
            } finally {
              setIsLoading(false);
            }
          }}
        >
          <Icons.google className="h-5 w-5 mr-2" />
          Continue with Google
        </Button>
        <Button
          variant="outline"
          type="button"
          disabled={isLoading || isLocked}
          onClick={async () => {
            try {
              setIsLoading(true);
              await signIn("github", {
                redirect: false,
              }).then((result) => {
                if (result?.error) {
                  console.error("GitHub sign in error:", result.error);
                  toast({
                    title: "Error",
                    description: "Failed to sign in with GitHub. Please try again.",
                    variant: "destructive",
                  });
                }
                if (result?.ok) {
                  router.push("/");
                  router.refresh();
                }
              });
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to connect with GitHub. Please try again.",
                variant: "destructive",
              });
            } finally {
              setIsLoading(false);
            }
          }}
        >
          <Icons.github className="h-5 w-5 mr-2" />
          Continue with GitHub
        </Button>
      </div>
    </div>
  );
}
