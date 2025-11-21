"use client";

import { format } from "date-fns";

interface TodayListProps {
  date: Date;
  sessions: Array<{
    id: string;
    time: string;
    title: string;
    type: string;
    location: string;
    isLive?: boolean;
    isPast: boolean;
  }>;
  onSessionClick?: (sessionId: string) => void;
}

export const TodayList = ({
  date,
  sessions,
  onSessionClick,
}: TodayListProps) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-900">Heute</h3>
        <span className="text-[10px] text-zinc-400">
          {format(date, "MMM d")}
        </span>
      </div>

      <div className="space-y-3 relative">
        {/* Timeline line */}
        <div className="absolute left-[2.8rem] top-2 bottom-2 w-px bg-zinc-100"></div>

        {sessions.map((session, index) => (
          <div
            key={session.id}
            onClick={() => onSessionClick?.(session.id)}
            className={`group hover:bg-zinc-50 p-2 rounded-md transition-colors duration-200 ease-in-out flex gap-3 items-start relative z-10 ${
              session.isPast ? "opacity-60" : "cursor-pointer"
            }`}
          >
            <div className="w-8 text-[10px] font-medium text-zinc-400 pt-1 text-right tabular-nums">
              {session.time}
            </div>
            <div
              className={`w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm mt-1 shrink-0 ${
                session.isPast
                  ? "bg-zinc-200 group-hover:bg-zinc-300 transition-colors"
                  : "bg-blue-500"
              }`}
            ></div>
            <div
              className={`flex-1 min-w-0 ${
                index < sessions.length - 1
                  ? "pb-3 border-b border-zinc-50"
                  : ""
              }`}
            >
              <h4 className="text-xs font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {session.title}
              </h4>
              <p className="text-[10px] text-zinc-500 truncate">
                {session.type} • {session.location}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
