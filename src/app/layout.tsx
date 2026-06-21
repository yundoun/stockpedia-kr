import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Stockpedia KR — 한국 주식 분석",
    template: "%s | Stockpedia KR",
  },
  description:
    "한국 주식 분석 플랫폼 — KOSPI/KOSDAQ 재무제표, 밸류에이션, 스크리너, 포트폴리오",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-stone-50 text-stone-900">
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
