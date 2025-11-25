import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/layout/ClientLayout";

export const metadata: Metadata = {
  title: "FH Wien - DTI/DI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="min-h-screen">
      <body className="bg-zinc-50 text-zinc-900 min-h-screen flex flex-col selection:bg-zinc-200">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
