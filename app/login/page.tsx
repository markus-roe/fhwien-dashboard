"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/Button";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/uebersicht");
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Ungültige E-Mail oder Passwort");
        console.log("[LOGIN] Login failed:", result.error);
      } else {
        console.log("[LOGIN] Login successful, redirecting...");
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

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-700 mb-1.5"
              >
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="ihre.email@example.com"
                disabled={loading}
              />
            </div>

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
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Wird angemeldet..." : "Anmelden"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
