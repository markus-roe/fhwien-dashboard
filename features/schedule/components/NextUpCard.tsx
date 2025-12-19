"use client";

import { Clock, Video, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";
import { LocationType } from "@/shared/data/mockData";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/Card";

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
    <div className="hidden md:block" onClick={onOpenPanel}>
      <Card className="group relative cursor-pointer overflow-hidden transition-all hover:shadow-md hover:border-blue-300 hover:bg-blue-50/30">
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--primary)]" />
        <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">
              Nächste Einheit
            </h3>
            {session.isLive && (
              <Badge
                variant="red"
                size="xs"
                className="flex items-center gap-1.5 text-[10px]"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                </span>
                Jetzt live
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:px-5 sm:py-3 pt-0 space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
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
              <span className="text-[10px] font-medium truncate">
                {session.location}
              </span>
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
        </CardContent>
      </Card>
    </div>
  );
};
