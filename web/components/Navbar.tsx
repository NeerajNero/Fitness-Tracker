// web/src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu, Dumbbell } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const closeSheet = () => setIsSheetOpen(false);

  return (
    <nav className="flex items-center justify-between p-4 border-b">
      <Link href="/" className="flex items-center gap-2 font-bold text-lg">
        <Dumbbell className="h-6 w-6" />
        <span>FitTrack</span>
      </Link>

      {/* --- Desktop Menu --- */}
      <div className="hidden md:flex items-center gap-4">
        {!isLoading &&
          (user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          ))}
      </div>

      {/* --- Mobile Menu --- */}
      <div className="md:hidden">
        {!isLoading && (
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-8">
                {user ? (
                  <>
                    <Button variant="ghost" asChild onClick={closeSheet}>
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                    <Button onClick={() => { closeSheet(); logout(); }}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild onClick={closeSheet}>
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild onClick={closeSheet}>
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </nav>
  );
}