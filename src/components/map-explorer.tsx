"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Flex, Input, List, Segmented, Statistic, Tag } from "antd";
import { MapView } from "@/components/map-view";
import { categories, type CategoryId, type Place } from "@/lib/places";

const pageStyle = {
  minHeight: "100vh",
  padding: "24px",
};

const shellStyle = {
  display: "grid",
  gridTemplateColumns: "360px 1fr",
  gap: "20px",
  minHeight: "calc(100vh - 48px)",
};

const panelStyle = {
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: "24px",
  backdropFilter: "blur(10px)",
};

const placeCardStyle = {
  cursor: "pointer",
};

type MapExplorerProps = {
  places: Place[];
};

export function MapExplorer({ places }: MapExplorerProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<"all" | CategoryId>("all");
  const [search, setSearch] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(places[0]?.id ?? null);

  const categoryOptions = useMemo(
    () => [
      { label: "전체", value: "all" },
      ...Object.entries(categories).map(([id, label]) => ({ label, value: id })),
    ],
    [],
  );

  const filteredPlaces = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return places.filter((place) => {
      const matchesCategory = selectedCategory === "all" || place.category === selectedCategory;
      const matchesSearch =
        normalized.length === 0 ||
        [place.name, place.description, place.address, place.city].some((value) =>
          value.toLowerCase().includes(normalized),
        );

      return matchesCategory && matchesSearch;
    });
  }, [places, search, selectedCategory]);

  const effectiveSelectedPlaceId = useMemo(() => {
    if (filteredPlaces.some((place) => place.id === selectedPlaceId)) {
      return selectedPlaceId;
    }

    return filteredPlaces[0]?.id ?? null;
  }, [filteredPlaces, selectedPlaceId]);

  return (
    <main style={pageStyle}>
      <div className="app-shell" style={shellStyle}>
        <Card style={panelStyle} styles={{ body: { padding: 24 } }} variant="borderless">
          <Flex vertical gap={12}>
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>Korea Map MVP</span>
            <h1 style={{ margin: 0, fontSize: "2.2rem", lineHeight: 1.1 }}>
              지역 기반 제보/장소 관리 CMS
            </h1>
            <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>
              서울 중심 기본값과 검색, 카테고리 필터, 리스트와 지도 연동을 우선 반영했습니다.
            </p>
          </Flex>

          <Flex vertical gap={10} style={{ marginTop: "20px" }}>
            <label htmlFor="place-search" style={{ fontWeight: 700 }}>
              검색
            </label>
            <Input
              id="place-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              allowClear
              size="large"
              placeholder="장소명, 설명, 주소, 도시 검색"
            />
          </Flex>

          <div style={{ marginTop: "16px" }}>
            <Segmented
              block
              options={categoryOptions}
              value={selectedCategory}
              onChange={(value) => setSelectedCategory(value as "all" | CategoryId)}
            />
          </div>

          <div className="summary-grid" style={{ marginTop: "20px" }}>
            <Card size="small">
              <Statistic title="전체" value={places.length} />
            </Card>
            <Card size="small">
              <Statistic title="현재 결과" value={filteredPlaces.length} />
            </Card>
            <Card size="small">
              <Statistic
                title="확인 대기"
                value={places.filter((place) => place.status === "pending").length}
              />
            </Card>
          </div>

          <List
            className="places-list"
            dataSource={filteredPlaces}
            locale={{ emptyText: "검색어를 줄이거나 카테고리를 전체로 바꿔보세요." }}
            renderItem={(place) => (
              <Card
                key={place.id}
                className={effectiveSelectedPlaceId === place.id ? "place-card is-selected" : "place-card"}
                hoverable
                size="small"
                style={placeCardStyle}
                onClick={() => setSelectedPlaceId(place.id)}
              >
                <Flex justify="space-between" align="center" gap={12}>
                  <strong>{place.name}</strong>
                  <Tag color={place.status === "published" ? "green" : "gold"}>
                    {place.status === "published" ? "공개" : "확인 대기"}
                  </Tag>
                </Flex>
                <p style={{ margin: "8px 0 0", color: "var(--muted)", lineHeight: 1.5 }}>
                  {place.description}
                </p>
                <p style={{ margin: "12px 0 0", fontSize: "0.92rem" }}>
                  {categories[place.category]} · {place.city} · {place.address}
                </p>
              </Card>
            )}
            split={false}
            style={{ marginTop: "20px" }}
          />

          <div style={{ marginTop: "20px" }}>
            <Button block type="primary" size="large" onClick={() => router.push("/admin")}>
              관리자 화면 보기
            </Button>
          </div>
        </Card>

        <Card
          style={{
            ...panelStyle,
            overflow: "hidden",
            minHeight: "70vh",
          }}
          styles={{ body: { padding: 0, height: "100%" } }}
          variant="borderless"
        >
          <MapView
            places={filteredPlaces}
            selectedPlaceId={effectiveSelectedPlaceId}
            onSelectPlace={setSelectedPlaceId}
          />
        </Card>
      </div>
    </main>
  );
}
