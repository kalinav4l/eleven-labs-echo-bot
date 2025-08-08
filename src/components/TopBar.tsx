import React from "react";
import { Link } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, LogOut, Search, Plus } from "lucide-react";
import { useUserBalance } from "@/hooks/useUserBalance";
import { useAuth } from "@/components/AuthContext";

export const TopBar: React.FC = () => {
  const { data: balanceData, isLoading } = useUserBalance();
  const { user, signOut } = useAuth();

  const balanceUsd = balanceData?.balance_usd ?? 0;
  const minutesLeft = balanceUsd / 0.15; // 1 minut = $0.15

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error("Sign out error", e);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 h-16 flex items-center gap-3">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <SidebarTrigger className="touch-target" />
          <Link to="/account" className="flex items-center gap-2 font-semibold text-foreground">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/lovable-uploads/f617a44e-5bc3-46cb-8232-3110c0cee83d.png" alt="Kalina AI logo" />
              <AvatarFallback className="text-xs">KA</AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline">Kalina AI</span>
          </Link>
        </div>

        {/* Center search */}
        <div className="flex-1 max-w-xl mx-auto hidden md:flex items-center">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Căutare…"
              className="pl-9 h-10"
              aria-label="Căutare"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-auto">
          <Badge variant="secondary" className="hidden sm:flex items-center gap-2">
            {isLoading ? (
              <span>Se încarcă…</span>
            ) : (
              <>
                <span>${balanceUsd.toFixed(2)} USD</span>
                <span className="text-muted-foreground">•</span>
                <span>{minutesLeft.toFixed(1)} min</span>
              </>
            )}
          </Badge>

          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link to="/pricing">
              <Plus className="h-4 w-4" />
              Adaugă credite
            </Link>
          </Button>

          <Button variant="ghost" size="icon" aria-label="Notificări" className="touch-target">
            <Bell className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || "Utilizator"} />
              <AvatarFallback>{user?.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="touch-target" aria-label="Deconectare">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
