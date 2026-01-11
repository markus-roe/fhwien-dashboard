"use client";

import {
  Search,
  Menu,
  X,
  Calendar,
  Users,
  MessageSquare,
  GraduationCap,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/Popover";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { signOut } from "next-auth/react";

export const TopNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user: currentUser, loading: userLoading } = useCurrentUser();

  const canSeeDashboard = currentUser?.role === "professor" || currentUser?.role === "admin";

  const handleLogout = async () => {
    // Speichere E-Mail im localStorage vor dem Logout
    if (currentUser?.email) {
      try {
        localStorage.setItem("lastLoginEmail", currentUser.email);
      } catch (error) {
        console.error("[LOGOUT] Failed to save email to localStorage:", error);
      }
    }
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  const isActive = (path: string) => {
    if (path === "/uebersicht") {
      return pathname === "/uebersicht" || pathname === "/";
    }
    if (path === "/schedule") {
      return pathname === "/schedule";
    }
    return pathname === path;
  };

  const isDashboardActive = () => {
    return pathname.startsWith("/dashboard");
  };

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-zinc-200/80">
        <div className="w-full px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/uebersicht" className="flex items-center gap-2">
              <Image
                src="/fhwien.png"
                alt="FH Wien Logo"
                width={32}
                height={32}
                className="rounded-md shadow-sm"
              />

              <span className="font-semibold text-sm tracking-tight text-zinc-900">
                FH WIEN
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              <Link
                href="/uebersicht"
                className={`text-sm font-medium px-3 py-1.5 rounded-md transition-all ${isActive("/uebersicht")
                  ? "text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-900"
                  }`}
              >
                Übersicht
              </Link>
              <Link
                href="/schedule"
                className={`text-sm font-medium px-3 py-1.5 rounded-md transition-all ${isActive("/schedule")
                  ? "text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-900"
                  }`}
              >
                Terminplan
              </Link>
              <Link
                href="/gruppen"
                className={`text-sm font-medium px-3 py-1.5 rounded-md transition-all ${isActive("/gruppen")
                  ? "text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-900"
                  }`}
              >
                Gruppen
              </Link>
              <Link
                href="/coaching"
                className={`text-sm font-medium px-3 py-1.5 rounded-md transition-all ${isActive("/coaching")
                  ? "text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-900"
                  }`}
              >
                Coachings
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!userLoading && canSeeDashboard && (
              <Link href="/dashboard/lvs" className="hidden md:block">
                <Button
                  variant="primary"
                  size="sm"
                  icon={GraduationCap}
                  iconPosition="left"
                >
                  Dashboard
                </Button>
              </Link>
            )}
            {!userLoading && currentUser && (
              <div className="hidden md:flex items-center gap-3">
                <div className="h-4 w-px bg-zinc-200 hidden sm:block"></div>

                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-medium text-zinc-900">
                          {currentUser.name}
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          {currentUser.email}
                        </p>
                      </div>
                      <Avatar initials={currentUser.initials} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-56 p-1">
                    <div className="space-y-0.5">
                      <Link
                        href="/profil"
                        className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors w-full"
                      >
                        <User className="w-4 h-4 text-zinc-500" />
                        <span>Profil</span>
                      </Link>
                      <button
                        className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors w-full text-left"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4 text-zinc-500" />
                        <span>Abmelden</span>
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -mr-2 text-zinc-600 hover:text-zinc-900 rounded-md transition-all"
              aria-label="Menü öffnen"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${mobileMenuOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
          }`}
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100" : "opacity-0"
            }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 ease-out ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <div className="flex flex-col h-full">
            {/* Header - matches TopNav exactly */}
            <div className="w-full px-6 h-14 flex items-center justify-between border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Image
                  src="/fhwien.png"
                  alt="FH Wien Logo"
                  width={32}
                  height={32}
                  className="rounded-md shadow-sm"
                />
                <span className="font-semibold text-sm tracking-tight text-zinc-900">
                  FH WIEN
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-2 text-zinc-600 hover:text-zinc-900 rounded-md transition-all"
                aria-label="Menü schließen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              <div className="space-y-1">
                <Link
                  href="/uebersicht"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all active:scale-[0.98] ${isActive("/uebersicht")
                    ? "text-zinc-900 font-medium"
                    : "text-zinc-600 hover:text-zinc-900"
                    }`}
                >
                  <LayoutDashboard
                    className={`w-5 h-5 flex-shrink-0 ${isActive("/uebersicht") ? "text-zinc-900" : "text-zinc-400"
                      }`}
                  />
                  <span className="text-base">Übersicht</span>
                </Link>
                <Link
                  href="/schedule"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all active:scale-[0.98] ${isActive("/schedule")
                    ? "text-zinc-900 font-medium"
                    : "text-zinc-600 hover:text-zinc-900"
                    }`}
                >
                  <Calendar
                    className={`w-5 h-5 flex-shrink-0 ${isActive("/schedule") ? "text-zinc-900" : "text-zinc-400"
                      }`}
                  />
                  <span className="text-base">Terminplan</span>
                </Link>
                <Link
                  href="/gruppen"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all active:scale-[0.98] ${isActive("/gruppen")
                    ? "text-zinc-900 font-medium"
                    : "text-zinc-600 hover:text-zinc-900"
                    }`}
                >
                  <Users
                    className={`w-5 h-5 flex-shrink-0 ${isActive("/gruppen") ? "text-zinc-900" : "text-zinc-400"
                      }`}
                  />
                  <span className="text-base">Gruppen</span>
                </Link>
                <Link
                  href="/coaching"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all active:scale-[0.98] ${isActive("/coaching")
                    ? "text-zinc-900 font-medium"
                    : "text-zinc-600 hover:text-zinc-900"
                    }`}
                >
                  <MessageSquare
                    className={`w-5 h-5 flex-shrink-0 ${isActive("/coaching") ? "text-zinc-900" : "text-zinc-400"
                      }`}
                  />
                  <span className="text-base">Coaching</span>
                </Link>
                {!userLoading && canSeeDashboard && (
                  <Link
                    href="/dashboard/lvs"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all active:scale-[0.98] ${isDashboardActive()
                      ? "text-zinc-900 font-medium"
                      : "text-zinc-600 hover:text-zinc-900"
                      }`}
                  >
                    <GraduationCap
                      className={`w-5 h-5 flex-shrink-0 ${isDashboardActive() ? "text-zinc-900" : "text-zinc-400"
                        }`}
                    />
                    <span className="text-base">Dashboard</span>
                  </Link>
                )}
              </div>
            </nav>

            {/* User Profile Footer */}
            {!userLoading && currentUser && (
              <div className="p-4 border-t border-zinc-200 bg-zinc-50/50">
                <div className="space-y-1">
                  <Link
                    href="/profil"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white transition-colors"
                  >
                    <User className="w-5 h-5 text-zinc-400" />
                    <span className="text-base text-zinc-700">Profil</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white transition-colors w-full text-left"
                  >
                    <LogOut className="w-5 h-5 text-zinc-400" />
                    <span className="text-base text-zinc-700">Abmelden</span>
                  </button>
                  <div className="flex items-center gap-3 p-3 rounded-xl">
                    <Avatar initials={currentUser.initials} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {currentUser.program || ""} {currentUser.role === "professor" ? "Professor" : "Student"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
