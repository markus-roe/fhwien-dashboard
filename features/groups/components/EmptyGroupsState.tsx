import { Users } from "lucide-react";

export function EmptyGroupsState() {
  return (
    <div className="text-center">
      <Users className="w-6 h-6 text-zinc-300 mx-auto mb-2" />
      <p className="text-xs text-zinc-500">Du bist noch in keiner Gruppe.</p>
    </div>
  );
}
