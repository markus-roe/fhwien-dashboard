"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Input } from "@/shared/components/ui/Input";
import { Button } from "@/shared/components/ui/Button";
import { Sidebar } from "@/shared/components/layout/Sidebar";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import type { Session } from "@/shared/lib/api-types";
import { currentUserApi } from "@/shared/lib/api";
import { User, Mail, GraduationCap, Lock } from "lucide-react";

export default function ProfilPage() {
  const { user: currentUser, loading: userLoading } = useCurrentUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email || "");
    }
  }, [currentUser]);

  if (userLoading || !currentUser) {
    return <div className="p-4">Laden...</div>;
  }

  const handleSaveProfile = () => {
    // Profile save logic would go here
    console.log("Profile saved", { name, email });
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Bitte füllen Sie alle Felder aus");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwörter stimmen nicht überein");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Das neue Passwort muss mindestens 6 Zeichen lang sein");
      return;
    }

    setIsChangingPassword(true);

    try {
      await currentUserApi.changePassword({
        currentPassword,
        newPassword,
      });

      setPasswordSuccess("Passwort erfolgreich geändert");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Fehler beim Ändern des Passworts";
      setPasswordError(
        errorMessage.includes("incorrect")
          ? "Aktuelles Passwort ist falsch"
          : errorMessage
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSessionClick = (session: Session) => {
    // Session click handler for sidebar
    console.log("Session clicked", session);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        <aside className="hidden lg:flex lg:flex-col lg:w-[300px] lg:shrink-0 lg:overflow-y-scroll">
          <Sidebar
            onSessionClick={handleSessionClick}
            emptyMessage="Keine anstehenden Termine."
          />
        </aside>

        <div className="flex-1 min-w-0 space-y-3">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="mb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
                  Profil
                </h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-6">
                {/* Profile Information */}
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar initials={currentUser.initials} size="lg" />
                    <div>
                      <h2 className="text-lg font-semibold text-zinc-900">
                        {currentUser.name}
                      </h2>
                      <p className="text-sm text-zinc-500">
                        {currentUser.program} Student
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-zinc-700 mb-1.5 block flex items-center gap-2">
                        <User className="w-4 h-4 text-zinc-500" />
                        Name
                      </label>
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-zinc-700 mb-1.5 block flex items-center gap-2">
                        <Mail className="w-4 h-4 text-zinc-500" />
                        E-Mail
                      </label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-zinc-700 mb-1.5 block flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-zinc-500" />
                        Studiengang
                      </label>
                      <Input
                        type="text"
                        value={currentUser.program || ""}
                        readOnly
                        className="bg-zinc-50"
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={handleSaveProfile}
                      >
                        Profil speichern
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Password Change */}
                <div className="lg:border-l lg:border-zinc-200 lg:pl-8">
                  <div className="flex items-center gap-2 mb-6">
                    <Lock className="w-5 h-5 text-zinc-600" />
                    <h2 className="text-lg font-semibold text-zinc-900">
                      Passwort ändern
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-zinc-700 mb-1.5 block">
                        Aktuelles Passwort
                      </label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          setPasswordError("");
                          setPasswordSuccess("");
                        }}
                        placeholder="Aktuelles Passwort eingeben"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-zinc-700 mb-1.5 block">
                        Neues Passwort
                      </label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPasswordError("");
                          setPasswordSuccess("");
                        }}
                        placeholder="Neues Passwort eingeben"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-zinc-700 mb-1.5 block">
                        Passwort bestätigen
                      </label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setPasswordError("");
                          setPasswordSuccess("");
                        }}
                        placeholder="Neues Passwort bestätigen"
                      />
                    </div>

                    {passwordError && (
                      <div className="text-sm text-red-600">{passwordError}</div>
                    )}

                    {passwordSuccess && (
                      <div className="text-sm text-green-600">
                        {passwordSuccess}
                      </div>
                    )}

                    <div className="pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={handleChangePassword}
                        disabled={isChangingPassword}
                      >
                        {isChangingPassword
                          ? "Wird geändert..."
                          : "Passwort ändern"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
