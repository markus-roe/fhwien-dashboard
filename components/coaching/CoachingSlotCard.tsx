import { Clock, Users, ChevronDown, ChevronUp } from "lucide-react";
import type { CoachingSlot, Course } from "@/data/mockData";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { currentUser } from "@/data/mockData";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";

type CoachingSlotCardProps = {
  slot: CoachingSlot;
  course?: Course;
  isProfessor: boolean;
  onBook: (slotId: string) => void;
  onCancelBooking: (slotId: string) => void;
  onDelete: (slotId: string) => void;
};

export function CoachingSlotCard({
  slot,
  course,
  isProfessor,
  onBook,
  onCancelBooking,
  onDelete,
}: CoachingSlotCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isBooked = slot.participants.some((p) => p === currentUser.name);
  const isFull = slot.participants.length >= slot.maxParticipants;
  const canBook = !isBooked && !isFull && !isProfessor;

  const slotDateTime = new Date(slot.date);
  const [hours, minutes] = slot.time.split(":").map(Number);
  slotDateTime.setHours(hours, minutes);

  const isPast = slotDateTime < new Date();

  return (
    <Card
      className={`hover:border-zinc-300 hover:shadow-sm transition-all ${
        isPast ? "opacity-60" : ""
      }`}
    >
      <CardContent className="p-3.5">
        <div className="space-y-2">
          {/* Header: Course name and expand button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              {course && (
                <h3 className="text-sm font-semibold text-zinc-900 truncate">
                  {course.title}
                </h3>
              )}
              {/* Time - always visible */}
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="text-xs text-zinc-600">
                  {slot.time} - {slot.endTime}
                </span>
              </div>
              {/* Participants count and names - always visible */}
              <div className="flex items-center gap-1.5 mt-1">
                <Users className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="text-xs text-zinc-600">
                  {slot.participants.length}/{slot.maxParticipants}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {!isProfessor && (
                <>
                  {canBook && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBook(slot.id);
                      }}
                      variant="primary"
                      className="text-xs h-6 px-2"
                    >
                      Beitreten
                    </Button>
                  )}
                  {isBooked && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancelBooking(slot.id);
                      }}
                      variant="destructive"
                      className="text-xs h-6 px-2"
                    >
                      Verlassen
                    </Button>
                  )}
                  {isFull && !isBooked && (
                    <span className="text-xs text-zinc-500">Voll</span>
                  )}
                </>
              )}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2.5 hover:bg-zinc-100 rounded transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label={
                  isExpanded ? "Details ausblenden" : "Details anzeigen"
                }
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-zinc-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-zinc-400" />
                )}
              </button>
            </div>
          </div>

          {/* Expanded details */}
          {isExpanded && (
            <div className="pt-2 border-t border-zinc-100 space-y-2">
              <div className="space-y-1.5 text-xs">
                {slot.description && (
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    {slot.description}
                  </p>
                )}
              </div>

              {slot.participants.length > 0 && (
                <div className="pt-1.5 border-t border-zinc-100">
                  <div className="flex flex-wrap gap-1">
                    {slot.participants.map((participant) => (
                      <div
                        key={participant}
                        className="flex items-center gap-1 px-1.5 py-0.5 bg-zinc-50 rounded text-xs"
                      >
                        <Badge
                          rounded="md"
                          key={participant}
                          variant="default"
                          size="sm"
                          className="normal-case font-normal"
                        >
                          {participant}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isPast && (
                <div className="text-xs text-center text-zinc-400 pt-0.5">
                  Vergangen
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
