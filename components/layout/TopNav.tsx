"use client";

import { Search } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export const TopNav = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/schedule") {
      return pathname === "/schedule" || pathname === "/";
    }
    return pathname === path;
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
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
                  ? "text-zinc-900 bg-zinc-100"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              Terminplan
            </Link>
            <Link
              href="/gruppen"
              className={`text-sm font-medium px-3 py-1.5 rounded-md transition-all ${
                isActive("/gruppen")
                  ? "text-zinc-900 bg-zinc-100"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              Gruppen
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-zinc-400 hover:cursor-not-allowed  px-3 py-1.5 rounded-md transition-all"
            >
              Coaching
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-4 w-px bg-zinc-200 hidden sm:block"></div>

          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-zinc-900">Markus R.</p>
              <p className="text-[10px] text-zinc-500">DTI Student</p>
            </div>
            <Avatar initials="MR" />
          </div>
        </div>
      </div>
    </nav>
  );
};
