// web/src/app/login/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios"; // Uses our configured api instance
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// This function sends the form data to our backend
const postLogin = async (formData: any) => {
  const { data } = await api.post("/auth/login", formData);
  return data;
};

export default function LoginPage() {
  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  const { register, handleSubmit } = useForm();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  const mutation = useMutation({
    mutationFn: postLogin,
    onSuccess: (data) => {
      console.log("Login successful!", data);
      // The context's login function handles setting user state and redirecting
      login(data);
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });

  // This function is called when the email/password form is submitted
  const onSubmit = (formData: any) => {
    mutation.mutate(formData);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      {isLoading || user ? (<p>Loading...</p> ):
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Email/Password Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register("password")} />
              </div>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full"
              >
                {mutation.isPending ? "Logging In..." : "Login"}
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <Button asChild variant="outline" className="w-full">
            <a href="http://localhost:3000/auth/google">
              {/* You can add a Google icon/logo here */}
              Sign in with Google
            </a>
          </Button>
        </CardContent>
      </Card>
}
    </div>
  );
}