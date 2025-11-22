import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FH Wien - DTI/DI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="bg-zinc-50 text-zinc-900 min-h-screen flex flex-col overflow-x-hidden selection:bg-zinc-200">
        {children}
      </body>
    </html>
  );
}
