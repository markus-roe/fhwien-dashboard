"use client";

import { Clock, Video, ArrowRight, MapPin } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { LocationType } from "@/data/mockData";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface NextUpCardProps {
  session: {
    id: string;
    title: string;
    date: Date;
    time: string;
    endTime: string;
    location: string;
    locationType: LocationType;
    isLive: boolean;
  };
  onOpenPanel?: () => void;
}

export const NextUpCard = ({ session, onOpenPanel }: NextUpCardProps) => {
  return (
    <div
      onClick={onOpenPanel}
      className="hidden md:block group cursor-pointer relative w-full bg-white rounded-xl border border-zinc-200 p-3 sm:p-4 shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-blue-300 hover:bg-blue-50/30"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-[var(--primary)]"></div>

      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="text-xs sm:text-sm font-medium text-zinc-900">Nächste Einheit</h3>
      </div>

      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {session.isLive && (
              <Badge
                variant="red"
                className="flex items-center gap-1.5 text-[10px] px-1.5 py-0.5"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                </span>
                Jetzt live
              </Badge>
            )}
            <span className="text-zinc-400 text-[11px] font-medium">
              {format(session.date, "EEEE, d. MMM", { locale: de })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500">
            <Clock className="w-3 h-3" />
            <span className="text-[10px] font-medium tabular-nums">
              {session.time} – {session.endTime}
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-zinc-900 leading-tight group-hover:text-[var(--primary)] transition-colors line-clamp-2">
            {session.title}
          </h3>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-zinc-600">
            {session.locationType === "online" ? (
              <Video className="w-3 h-3 text-[var(--primary)]" />
            ) : (
              <MapPin className="w-3 h-3 text-[var(--primary)]" />
            )}
            <span className="text-[10px] font-medium truncate">{session.location}</span>
          </div>
          {session.locationType === "online" ? (
            <Button
              className="w-auto px-3 py-1.5 text-[10px] h-auto shrink-0"
              icon={ArrowRight}
              onClick={(e) => {
                e.stopPropagation();
                onOpenPanel?.();
              }}
            >
              Beitreten
            </Button>
          ) : (
            <Button
              className="w-auto px-3 py-1.5 text-[10px] h-auto shrink-0"
              icon={ArrowRight}
              onClick={(e) => {
                e.stopPropagation();
                onOpenPanel?.();
              }}
            >
              Details
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
