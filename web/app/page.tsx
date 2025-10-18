// web/src/app/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { Dumbbell } from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();

  const renderAuthButtons = () => {
    if (isLoading) {
      return <div className="h-10 w-24 rounded-md animate-pulse bg-muted" />;
    }

    if (user) {
      return (
        <Button asChild size="lg">
          <Link href="/dashboard">Go to Your Dashboard</Link>
        </Button>
      );
    }

    return (
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center text-center p-4 min-h-[calc(100vh-80px)]">
      <Dumbbell className="h-16 w-16 mb-6" />
      <h1 className="text-4xl md:text-6xl font-bold mb-4">
        Welcome to FitTrack
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
        Your personal, all-in-one solution to track workouts, monitor
        nutrition, and achieve your fitness goals.
      </p>
      {renderAuthButtons()}
    </div>
  );
}