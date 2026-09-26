import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Malvis Digital Growth | Digital Marketing & Business Growth",
  description: "Build your business presence, promote products and services, manage leads, run campaigns and understand your growth with Malvis Digital Growth.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
