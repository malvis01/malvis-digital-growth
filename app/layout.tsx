import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata={title:"Malvis Digital Growth",description:"Digital marketing and business growth platform."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}