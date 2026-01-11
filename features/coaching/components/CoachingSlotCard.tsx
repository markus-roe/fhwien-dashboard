import { Clock, Users } from "lucide-react";
import type { CoachingSlot, Course } from "@/shared/lib/api-types";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { currentUser } from "@/shared/data/mockData";
import { MemberBadge } from "@/features/dashboard/components/MemberBadge";

type CoachingSlotCardProps = {
  slot: CoachingSlot;
  course?: Course;
  isProfessor: boolean;
  onBook: (slotId: number) => void;
  onCancelBooking: (slotId: number) => void;
  onDelete: (slotId: number) => void;
};

export function CoachingSlotCard({
  slot,
  course,
  isProfessor,
  onBook,
  onCancelBooking,
  onDelete,
}: CoachingSlotCardProps) {
  const isBooked = slot.participants.some((p) => p.name === currentUser.name);
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
            </div>
          </div>

          {/* Details */}
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
                    <MemberBadge key={participant.id} member={participant} />
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
        </div>
      </CardContent>
    </Card>
  );
}
