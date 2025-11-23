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
    <html lang="de" className="h-full">
      <body className="bg-zinc-50 text-zinc-900 h-full flex flex-col overflow-hidden selection:bg-zinc-200">
        {children}
      </body>
    </html>
  );
}
