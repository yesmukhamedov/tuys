import type { Metadata } from "next";

import "@/styles/globals.css";
import Providers from "@/app/providers";

export const metadata: Metadata = {
  title: "Rumor Graph",
  description: "Public rumor graph explorer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
