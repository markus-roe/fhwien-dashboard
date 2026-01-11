"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/shared/components/ui/Card";

export default function DebugSessionPage() {
  const { data: session, status } = useSession();

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-4">Session Debug Info</h1>
          
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold text-lg mb-2">Status:</h2>
              <p className="text-sm font-mono bg-zinc-100 p-2 rounded">
                {status}
              </p>
            </div>

            {session && (
              <>
                <div>
                  <h2 className="font-semibold text-lg mb-2">Session Data:</h2>
                  <pre className="text-xs bg-zinc-100 p-4 rounded overflow-auto">
                    {JSON.stringify(session, null, 2)}
                  </pre>
                </div>

                <div>
                  <h2 className="font-semibold text-lg mb-2">User Info:</h2>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">ID:</span> {session.user?.id}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {session.user?.email}
                    </div>
                    <div>
                      <span className="font-medium">Name:</span> {session.user?.name}
                    </div>
                    <div>
                      <span className="font-medium">Role:</span> {(session.user as any)?.role}
                    </div>
                    <div>
                      <span className="font-medium">Initials:</span> {(session.user as any)?.initials}
                    </div>
                    <div>
                      <span className="font-medium">Program:</span> {(session.user as any)?.program}
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="font-semibold text-lg mb-2">Expires:</h2>
                  <p className="text-sm">
                    {session.expires ? new Date(session.expires).toLocaleString() : "N/A"}
                  </p>
                </div>
              </>
            )}

            {!session && status === "unauthenticated" && (
              <div className="text-red-600">
                Not authenticated
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
