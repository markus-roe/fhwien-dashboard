"use client";

import { useState, useEffect } from "react";
import { Calendar, Copy, Check, ExternalLink, Info } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";

export function CalendarSubscriptionCard() {
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [calendarUrl, setCalendarUrl] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch the calendar token and build the URL
  useEffect(() => {
    const fetchCalendarUrl = async () => {
      try {
        const response = await fetch("/api/calendar/token");
        if (response.ok) {
          const data = await response.json();
          const token = data.token;
          const url = `${window.location.origin}/api/calendar/feed.ics?token=${token}`;
          setCalendarUrl(url);
        } else {
          console.error("Failed to fetch calendar token");
          setCalendarUrl("");
        }
      } catch (error) {
        console.error("Error fetching calendar token:", error);
        setCalendarUrl("");
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarUrl();
  }, []);

  const handleCopy = async () => {
    if (!calendarUrl) return;
    
    try {
      await navigator.clipboard.writeText(calendarUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleOpenGoogleCalendar = () => {
    if (!calendarUrl) return;
    // Google Calendar subscription URL
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(calendarUrl)}`;
    window.open(googleCalendarUrl, "_blank");
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#012f64] rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-zinc-900 mb-1">
                Kalender abonnieren
              </h3>
              <p className="text-sm text-zinc-600">
                Abonniere deine Sessions und Coaching-Termine in Google Calendar, Outlook oder Apple Calendar
              </p>
            </div>
          </div>

          {/* URL Display */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-700">
              Kalender-URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                  <code className="flex-1 text-xs text-zinc-700 truncate font-mono">
                    {loading ? "Lade..." : calendarUrl || "Fehler beim Laden"}
                  </code>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCopy}
                icon={copied ? Check : Copy}
                iconPosition="left"
                className="whitespace-nowrap"
              >
                {copied ? "Kopiert!" : "Kopieren"}
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenGoogleCalendar}
              icon={ExternalLink}
              iconPosition="left"
              className="flex-1 sm:flex-none"
            >
              In Google Calendar öffnen
            </Button>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              <Info className="w-4 h-4" />
              <span>Anleitung</span>
            </button>
          </div>

          {/* Instructions */}
          {showInfo && (
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-3">
              <h4 className="text-sm font-semibold text-zinc-900">
                So abonnierst du den Kalender:
              </h4>
              <div className="space-y-2 text-sm text-zinc-700">
                <div>
                  <strong className="text-zinc-900">Google Calendar:</strong>
                  <ol className="list-decimal list-inside mt-1 space-y-1 ml-2">
                    <li>Klicke auf "In Google Calendar öffnen" oder</li>
                    <li>Gehe zu Google Calendar → Einstellungen → Kalender hinzufügen → Per URL</li>
                    <li>Füge die Kalender-URL ein</li>
                  </ol>
                </div>
                <div>
                  <strong className="text-zinc-900">Apple Calendar:</strong>
                  <ol className="list-decimal list-inside mt-1 space-y-1 ml-2">
                    <li>Öffne die Kalender-App</li>
                    <li>Gehe zu Ablage → Neues Kalender-Abonnement</li>
                    <li>Füge die Kalender-URL ein</li>
                  </ol>
                </div>
                <div>
                  <strong className="text-zinc-900">Outlook:</strong>
                  <ol className="list-decimal list-inside mt-1 space-y-1 ml-2">
                    <li>Gehe zu Kalender → Kalender hinzufügen → Aus dem Internet</li>
                    <li>Füge die Kalender-URL ein</li>
                  </ol>
                </div>
              </div>
              <p className="text-xs text-zinc-500 pt-2 border-t border-zinc-200">
                Der Kalender wird automatisch aktualisiert, wenn neue Termine hinzugefügt werden.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
