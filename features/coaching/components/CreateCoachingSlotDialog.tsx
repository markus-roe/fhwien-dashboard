import { useEffect, useState, useRef } from "react";
import { X, Minus, Plus, Search } from "lucide-react";
import type { Course, User, CoachingSlot, LocationType } from "@/shared/lib/api-types";
import { Button } from "@/shared/components/ui/Button";
import { Select } from "@/shared/components/ui/Select";
import { Input, Textarea } from "@/shared/components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/Dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/shared/components/ui/Popover";
import { DateTimePickerSection } from "@/shared/components/ui/DateTimePickerSection";
import { Badge } from "@/shared/components/ui/Badge";
import { format } from "date-fns";
import type { CreateCoachingSlotFormData } from "@/features/coaching/types";

type CreateCoachingSlotDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  courses: Course[];
  users: User[];
  onSubmit: (data: CreateCoachingSlotFormData) => void;
  mode?: "create" | "edit";
  initialData?: CoachingSlot;
};

const initialFormState: CreateCoachingSlotFormData = {
  courseId: 0,
  date: new Date(),
  time: "",
  endTime: "",
  location: "",
  locationType: "on_campus",
  maxParticipants: 4,
  participantIds: [],
  description: "",
};

export function CreateCoachingSlotDialog({
  isOpen,
  onOpenChange,
  courses,
  users,
  onSubmit,
  mode = "create",
  initialData,
}: CreateCoachingSlotDialogProps) {
  const [formState, setFormState] =
    useState<CreateCoachingSlotFormData>(initialFormState);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [participantSearch, setParticipantSearch] = useState("");
  const [isParticipantPopoverOpen, setIsParticipantPopoverOpen] = useState(false);
  const participantInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        // Convert participant names to IDs
        const participants = initialData.participants
          .map((participant) => {
            const user = users.find((u) => u.id === participant.id);
            return user;
          })
          .filter((user): user is User => !!user);

        setFormState({
          courseId: initialData.courseId,
          date: new Date(initialData.date),
          time: initialData.time,
          endTime: initialData.endTime,
          location: "", // CoachingSlot doesn't have location stored
          locationType: "on_campus",
          maxParticipants: initialData.maxParticipants,
          participantIds: participants.map((user) => user.id),
          description: initialData.description || "",
        });
      } else {
        setFormState({
          ...initialFormState,
          date: new Date(),
        });
      }
    }
  }, [isOpen, mode, initialData, users]);

  const handleSubmit = () => {
    if (
      !formState.courseId ||
      !formState.time ||
      !formState.endTime ||
      !formState.location.trim()
    ) {
      return;
    }

    onSubmit(formState);
    setFormState(initialFormState);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFormState(initialFormState);
    onOpenChange(false);
  };

  const handleAddParticipant = (user?: User) => {
    const userToAdd = user || selectedUser;
    if (userToAdd && !formState.participantIds.includes(userToAdd.id)) {
      setFormState((prev) => ({
        ...prev,
        participantIds: [...prev.participantIds, userToAdd.id],
      }));
      setSelectedUser(null);
      setParticipantSearch("");
    }
  };

  const handleRemoveParticipant = (user: User) => {
    setFormState((prev) => ({
      ...prev,
      participantIds: prev.participantIds.filter((id) => id !== user.id),
    }));
  };

  const availableUsers = users.filter(
    (user) => !formState.participantIds.includes(user.id)
  );

  // Filter users by search query
  const filteredAvailableUsers = availableUsers
  .filter((user) => user.role === "student" || user.role === "admin")
  .filter((user) => {
    if (!participantSearch.trim()) return true;
    const searchLower = participantSearch.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.program?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  // Focus input when popover opens
  useEffect(() => {
    if (isParticipantPopoverOpen && participantInputRef.current) {
      setTimeout(() => {
        participantInputRef.current?.focus();
      }, 100);
    }
  }, [isParticipantPopoverOpen]);

  // Reset search when popover closes
  useEffect(() => {
    if (!isParticipantPopoverOpen) {
      setParticipantSearch("");
      setSelectedUser(null);
    }
  }, [isParticipantPopoverOpen]);

  const isFormValid =
    formState.courseId &&
    formState.time &&
    formState.endTime &&
    formState.location.trim() &&
    formState.maxParticipants > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden mx-2 sm:mx-4">
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle>
            {mode === "edit"
              ? "Coaching-Slot bearbeiten"
              : "Neuen Coaching-Slot erstellen"}
          </DialogTitle>
        </DialogHeader>
        <div className="p-3 sm:p-4 md:p-6 overflow-x-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[270px,1fr] gap-4 md:gap-8 min-w-0">
            {/* Left: Date & Time */}
            <DateTimePickerSection
              date={formState.date}
              time={formState.time}
              endTime={formState.endTime}
              onDateChange={(date) =>
                setFormState((prev) => ({ ...prev, date }))
              }
              onTimeChange={(time) =>
                setFormState((prev) => ({ ...prev, time }))
              }
              onEndTimeChange={(endTime) =>
                setFormState((prev) => ({ ...prev, endTime }))
              }
            />

            {/* Right: All other fields */}
            <div className="space-y-4 md:pl-6 md:border-l md:border-zinc-200">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Fach
                </label>
                <Select
                  options={[
                    { value: "", label: "Fach auswählen" },
                    ...courses.map((course) => ({
                      value: course.id.toString(),
                      label: course.title,
                    })),
                  ]}
                  value={formState.courseId.toString()}
                  onChange={(value) =>
                    setFormState((prev) => ({ ...prev, courseId: parseInt(value) }))
                  }
                  placeholder="Fach auswählen"
                />
              </div>

              {/* Mobile: Native date input */}
              <label className="md:hidden block text-sm font-medium text-zinc-700 mb-1">
                Datum
              </label>
              <div className="md:hidden w-full py-1.5 border border-zinc-200 rounded-lg bg-white text-zinc-900 transition-all">
                <input
                  type="date"
                  value={format(formState.date, "yyyy-MM-dd")}
                  onChange={(e) => {
                    const selectedDate = e.target.value
                      ? new Date(e.target.value)
                      : new Date();
                    setFormState((prev) => ({ ...prev, date: selectedDate }));
                  }}
                  className="md:hidden w-full bg-white text-zinc-900 transition-all"
                />
              </div>
              {/* Mobile: Startzeit and Endzeit in 2 columns */}
              <div className="md:hidden grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Startzeit
                  </label>
                  <div className="w-full py-1.5 border border-zinc-200 rounded-lg bg-white text-zinc-900 transition-all">
                    <input
                      type="time"
                      value={formState.time}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          time: e.target.value,
                        }))
                      }
                      className="w-full bg-white text-zinc-900 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Endzeit
                  </label>
                  <div className="w-full py-1.5 border border-zinc-200 rounded-lg bg-white text-zinc-900 transition-all">
                    <input
                      type="time"
                      value={formState.endTime}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                      className="w-full bg-white text-zinc-900 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Ort
                </label>
                <Input
                  type="text"
                  value={formState.location}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="z.B. B309 oder Microsoft Teams"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Art des Ortes
                  </label>
                  <Select
                    options={[
                      { value: "on-campus", label: "Vor Ort" },
                      { value: "online", label: "Online" },
                    ]}
                    value={formState.locationType}
                    onChange={(value) =>
                      setFormState((prev) => ({
                        ...prev,
                        locationType: value as LocationType,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Maximale Teilnehmer
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormState((prev) => ({
                          ...prev,
                          maxParticipants: Math.max(
                            1,
                            prev.maxParticipants - 1
                          ),
                        }))
                      }
                      className="p-2 border border-zinc-200 rounded-lg hover:border-zinc-300 hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      disabled={formState.maxParticipants === 1}
                      aria-label="Verringern"
                    >
                      <Minus className="w-4 h-4 text-zinc-600" />
                    </button>
                    <Input
                      type="number"
                      value={formState.maxParticipants}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10) || 1;
                        setFormState((prev) => ({
                          ...prev,
                          maxParticipants: Math.max(1, value),
                        }));
                      }}
                      min="1"
                      className="flex-1 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormState((prev) => ({
                          ...prev,
                          maxParticipants: prev.maxParticipants + 1,
                        }))
                      }
                      className="p-2 border border-zinc-200 rounded-lg hover:border-zinc-300 hover:bg-zinc-50 transition-colors shrink-0"
                      aria-label="Erhöhen"
                    >
                      <Plus className="w-4 h-4 text-zinc-600" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Teilnehmer
                </label>
                <div className="space-y-2">
                  <Popover open={isParticipantPopoverOpen} onOpenChange={setIsParticipantPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full justify-start"
                        icon={Plus}
                        iconPosition="left"
                      >
                        Teilnehmer hinzufügen
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-[calc(100vw-2rem)] sm:w-80 max-w-sm p-0" 
                      align="start"
                    >
                      <div className="p-2 sm:p-2 border-b border-zinc-200">
                        <Input
                          ref={participantInputRef}
                          type="text"
                          placeholder="Teilnehmer suchen..."
                          value={participantSearch}
                          onChange={(e) => setParticipantSearch(e.target.value)}
                          icon={Search}
                          className="text-sm sm:text-sm py-2.5 sm:py-2"
                        />
                      </div>
                      <div className="max-h-[50vh] sm:max-h-[300px] overflow-auto space-y-0.5 p-1 sm:p-1">
                        {filteredAvailableUsers.length > 0 ? (
                          filteredAvailableUsers.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => {
                                handleAddParticipant(user);
                                setIsParticipantPopoverOpen(false);
                              }}
                              className="w-full px-3 sm:px-3 py-3 sm:py-2 text-sm text-left rounded-lg hover:bg-zinc-100 active:bg-zinc-200 transition-colors text-zinc-700 touch-manipulation"
                            >
                              <div className="font-medium">{user.name}</div>
                              {user.program && (
                                <div className="text-xs text-zinc-500">
                                  {user.program}
                                </div>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-3 sm:py-2 text-xs text-zinc-500 text-center">
                            {availableUsers.length === 0
                              ? "Keine verfügbaren Teilnehmer"
                              : "Keine Ergebnisse"}
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  {formState.participantIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-2 border border-zinc-200 rounded-lg bg-zinc-50 min-h-[60px]">
                      {formState.participantIds.map((id) => {
                        const user = users.find((u) => u.id === id);
                        if (!user) return null;
                        return (
                          <Badge
                            key={id}
                            variant="default"
                            size="sm"
                            className="flex items-center gap-1.5 pr-1"
                          >
                            <span>{user.name}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveParticipant(user)}
                              className="ml-1 hover:bg-zinc-200 rounded-full p-0.5 transition-colors"
                              aria-label={`${id} entfernen`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Beschreibung (optional)
                </label>
                <Textarea
                  value={formState.description}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Beschreibung des Coaching-Slots..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-zinc-200">
            <Button
              className="w-full sm:flex-1 order-2 sm:order-1"
              disabled={!isFormValid}
              onClick={handleSubmit}
            >
              {mode === "edit" ? "Speichern" : "Erstellen"}
            </Button>
            <Button
              className="w-full sm:flex-1 order-1 sm:order-2"
              variant="secondary"
              onClick={handleCancel}
            >
              Abbrechen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
