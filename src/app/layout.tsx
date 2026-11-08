import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { getSiteUrl } from "@/lib/env";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: "Sally Perfumaria", template: "%s | Sally Perfumaria" },
  description:
    "Perfumes femininos, masculinos e unissex com curadoria Sally e o Consultor de Fragrâncias com IA.",
  openGraph: { siteName: "Sally Perfumaria", locale: "pt_BR", type: "website" },
};

export const viewport: Viewport = { themeColor: "#b0306a" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
