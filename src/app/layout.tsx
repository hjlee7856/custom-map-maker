import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Custom Map Maker",
  description: "지역 기반 제보/장소 관리 CMS 시작점",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                borderRadius: 12,
              },
            }}
          >
            {children}
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
