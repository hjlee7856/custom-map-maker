import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Custom Map Maker",
  description: "지도 기반 제보/장소 관리 CMS MVP 시작점",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
