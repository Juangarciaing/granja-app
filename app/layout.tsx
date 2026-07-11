import type { Metadata, Viewport } from "next";
import "./globals.css";

import { InstallPrompt } from "@/components/pwa/InstallPrompt";

export const metadata: Metadata = {
  title: "Granja — Calculadora de Alimento",
  description:
    "Registro de cerdas, partos y cálculo de alimento diario en lactancia.",
  // iOS Safari does not read the web app manifest's `icons` array for the
  // home-screen icon — it only honors an explicit `apple-touch-icon` link.
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-512.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2e6b3f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <InstallPrompt />
        {children}
      </body>
    </html>
  );
}
