"use client";

import Link from "next/link";
import { Button, Card, Flex, List, Statistic, Tag } from "antd";
import { categories, samplePlaces } from "@/lib/places";

const panelStyle = {
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: "24px",
  backdropFilter: "blur(10px)",
};

export default function AdminPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "24px", display: "grid", gap: "20px" }}>
      <Card style={panelStyle} styles={{ body: { padding: 24 } }} variant="borderless">
        <Flex justify="space-between" gap={16} wrap>
          <div>
            <p style={{ margin: 0, color: "var(--accent)", fontWeight: 700 }}>Admin Starter</p>
            <h1 style={{ margin: "8px 0 0", fontSize: "2rem" }}>운영/확인 대시보드</h1>
          </div>
          <Link href="/">
            <Button size="large">공개 지도 돌아가기</Button>
          </Link>
        </Flex>

        <div className="summary-grid" style={{ marginTop: "20px" }}>
          <Card size="small">
            <Statistic title="총 장소" value={samplePlaces.length} />
          </Card>
          <Card size="small">
            <Statistic title="확인 대기" value={samplePlaces.filter((place) => place.status === "pending").length} />
          </Card>
          <Card size="small">
            <Statistic title="카테고리" value={Object.keys(categories).length} />
          </Card>
        </div>
      </Card>

      <Card title="장소 목록" style={panelStyle} styles={{ body: { padding: 0 } }} variant="borderless">
        <List
          className="dashboard-list"
          dataSource={samplePlaces}
          renderItem={(place) => (
            <List.Item className="dashboard-list-item">
              <Flex justify="space-between" align="center" gap={12} style={{ width: "100%" }} wrap>
                <div>
                  <strong>{place.name}</strong>
                  <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>
                    {categories[place.category]} · {place.city} · {place.address}
                  </p>
                </div>
                <Tag color={place.status === "published" ? "green" : "gold"}>
                  {place.status === "published" ? "공개" : "검토 필요"}
                </Tag>
              </Flex>
            </List.Item>
          )}
        />
      </Card>
    </main>
  );
}
