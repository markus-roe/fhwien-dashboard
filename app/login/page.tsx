"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/Button";
import Image from "next/image";
import { Mail, X, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [emailInput, setEmailInput] = useState(""); // Was der Benutzer tippt
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [showEmailInput, setShowEmailInput] = useState(false);
  
  const DEFAULT_DOMAIN = "@edu.fh-wien.ac.at";

  // Normalisiere E-Mail: füge Domain hinzu wenn kein @ vorhanden
  const normalizeEmail = (input: string): string => {
    if (!input) return "";
    // Wenn bereits @ vorhanden, unverändert zurückgeben
    if (input.includes("@")) {
      return input;
    }
    // Sonst Domain hinzufügen
    return input + DEFAULT_DOMAIN;
  };

  // Lade gespeicherte E-Mail beim Mount
  useEffect(() => {
    try {
      const lastEmail = localStorage.getItem("lastLoginEmail");
      if (lastEmail) {
        setSavedEmail(lastEmail);
        setEmail(lastEmail);
        // Extrahiere Benutzername aus gespeicherter E-Mail
        const username = lastEmail.replace(DEFAULT_DOMAIN, "");
        setEmailInput(username);
        setShowEmailInput(false); // Zeige zuerst die gespeicherte E-Mail
      } else {
        setShowEmailInput(true); // Keine gespeicherte E-Mail, zeige Input direkt
      }
    } catch (error) {
      console.error("[LOGIN] Failed to read from localStorage:", error);
      setShowEmailInput(true);
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/uebersicht");
    }
  }, [status, session, router]);

  const handleUseOtherUser = () => {
    try {
      localStorage.removeItem("lastLoginEmail");
    } catch (error) {
      console.error("[LOGIN] Failed to remove email from localStorage:", error);
    }
    setSavedEmail(null);
    setEmail("");
    setEmailInput("");
    setShowEmailInput(true);
  };

  const handleUseSavedEmail = () => {
    if (savedEmail) {
      setEmail(savedEmail);
      // Extrahiere Benutzername aus gespeicherter E-Mail
      const username = savedEmail.replace(DEFAULT_DOMAIN, "");
      setEmailInput(username);
      setShowEmailInput(true);
    }
  };

  const handleEmailInputChange = (value: string) => {
    setEmailInput(value);
    // Normalisiere E-Mail für Submit
    setEmail(normalizeEmail(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Stelle sicher, dass E-Mail normalisiert ist
    const normalizedEmail = normalizeEmail(emailInput);

    try {
      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Ungültige E-Mail oder Passwort");
        console.log("[LOGIN] Login failed:", result.error);
      } else {
        console.log("[LOGIN] Login successful, redirecting...");
        // Speichere erfolgreiche E-Mail (vollständig)
        try {
          localStorage.setItem("lastLoginEmail", normalizedEmail);
        } catch (error) {
          console.error("[LOGIN] Failed to save email to localStorage:", error);
        }
        // Force session refresh
        window.location.href = "/uebersicht";
      }
    } catch (err) {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-zinc-500">Laden...</div>
      </div>
    );
  }

  // Don't render login form if already authenticated (will redirect)
  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-8">
          <div className="flex flex-col items-center mb-8">
            <Image
              src="/fhwien.png"
              alt="FH Wien Logo"
              width={64}
              height={64}
              className="rounded-md shadow-sm mb-4"
            />
            <h1 className="text-2xl font-semibold text-zinc-900">
              Anmelden
            </h1>
            <p className="text-sm text-zinc-500 mt-2">
              Melden Sie sich mit Ihren Zugangsdaten an
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Gespeicherte E-Mail Anzeige */}
            {savedEmail && !showEmailInput && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Letzte Anmeldung
                </label>
                <div className="relative group">
                  <div className="flex items-center gap-3 p-4 bg-zinc-50 border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">
                        {savedEmail}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Klicken Sie, um sich anzumelden
                      </p>
                    </div>
                    <Mail className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  </div>
                  <button
                    type="button"
                    onClick={handleUseSavedEmail}
                    className="absolute inset-0 w-full h-full"
                    aria-label="Gespeicherte E-Mail verwenden"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUseOtherUser}
                  className="w-full text-sm text-zinc-600 hover:text-zinc-900 py-2 px-3 rounded-md hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Anderen Benutzer verwenden
                </button>
              </div>
            )}

            {/* E-Mail Input mit automatischer Domain-Ergänzung */}
            {showEmailInput && (
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-700 mb-1.5"
                >
                  E-Mail
                </label>
                <div className="relative">
                  {!emailInput || !emailInput.includes("@") ? (
                    // Standard: Zeige Benutzername + Domain getrennt an
                    <div className="flex items-center border border-zinc-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
                      <input
                        id="email"
                        type="text"
                        value={emailInput}
                        onChange={(e) => handleEmailInputChange(e.target.value)}
                        required
                        className="flex-1 px-3 py-2 focus:outline-none text-sm bg-transparent"
                        placeholder="benutzername"
                        disabled={loading}
                        autoFocus={showEmailInput}
                        autoComplete="username"
                      />
                      <div className="px-3 py-2 border-l border-zinc-200 bg-zinc-50">
                        <span className="text-sm text-zinc-600 font-medium">
                          {DEFAULT_DOMAIN}
                        </span>
                      </div>
                    </div>
                  ) : (
                    // Normales Input für vollständige E-Mail (wenn @ eingegeben wurde)
                    <input
                      id="email"
                      type="email"
                      value={emailInput}
                      onChange={(e) => handleEmailInputChange(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="vollständige E-Mail"
                      disabled={loading}
                      autoFocus={showEmailInput}
                      autoComplete="username"
                    />
                  )}
                </div>
                {(!emailInput || !emailInput.includes("@")) && (
                  <p className="text-xs text-zinc-500 mt-1.5">
                    Geben Sie nur den Benutzernamen ein, die Domain wird automatisch ergänzt
                  </p>
                )}
              </div>
            )}

            {/* Passwort Input - nur anzeigen wenn E-Mail Input sichtbar ist */}
            {showEmailInput && (
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-700 mb-1.5"
                >
                  Passwort
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="••••••••"
                  disabled={loading}
                  autoFocus={showEmailInput && email !== ""}
                />
              </div>
            )}

            {/* Anmelden Button - nur anzeigen wenn Formular vollständig sichtbar ist */}
            {showEmailInput && (
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Wird angemeldet..." : "Anmelden"}
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
