import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegister from "./ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Malvis Digital Growth | Digital Marketing & Business Growth",
  description: "Build your business presence, promote products and services, manage leads, run campaigns and understand your growth with Malvis Digital Growth.",
  applicationName: "Malvis Digital Growth",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Malvis Growth",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
