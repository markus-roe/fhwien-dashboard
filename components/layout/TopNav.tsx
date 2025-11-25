"use client";

import { Search, Menu, X, Calendar, Users, MessageSquare } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { currentUser } from "@/data/mockData";

export const TopNav = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/schedule") {
      return pathname === "/schedule" || pathname === "/";
    }
    return pathname === path;
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
            <Link href="/schedule" className="flex items-center gap-2">
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
                href="/schedule"
                className={`text-sm font-medium px-3 py-1.5 rounded-md transition-all ${
                  isActive("/schedule")
                    ? "text-zinc-900"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Terminplan
              </Link>
              <Link
                href="/gruppen"
                className={`text-sm font-medium px-3 py-1.5 rounded-md transition-all ${
                  isActive("/gruppen")
                    ? "text-zinc-900"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Gruppen
              </Link>
              <Link
                href="/coaching"
                className={`text-sm font-medium px-3 py-1.5 rounded-md transition-all ${
                  isActive("/coaching")
                    ? "text-zinc-900"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Coaching
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-4 w-px bg-zinc-200 hidden sm:block"></div>

            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-zinc-900">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-zinc-500">
                  {currentUser.program} Student
                </p>
              </div>
              <Avatar initials={currentUser.initials} />
            </div>
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
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
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
                  href="/schedule"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all active:scale-[0.98] ${
                    isActive("/schedule")
                      ? "text-zinc-900 font-medium"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <Calendar
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive("/schedule") ? "text-zinc-900" : "text-zinc-400"
                    }`}
                  />
                  <span className="text-base">Terminplan</span>
                </Link>
                <Link
                  href="/gruppen"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all active:scale-[0.98] ${
                    isActive("/gruppen")
                      ? "text-zinc-900 font-medium"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <Users
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive("/gruppen") ? "text-zinc-900" : "text-zinc-400"
                    }`}
                  />
                  <span className="text-base">Gruppen</span>
                </Link>
                <Link
                  href="/coaching"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all active:scale-[0.98] ${
                    isActive("/coaching")
                      ? "text-zinc-900 font-medium"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <MessageSquare
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive("/coaching") ? "text-zinc-900" : "text-zinc-400"
                    }`}
                  />
                  <span className="text-base">Coaching</span>
                </Link>
              </div>
            </nav>

            {/* User Profile Footer */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-50/50">
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-colors">
                <Avatar initials={currentUser.initials} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {currentUser.program} Student
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
