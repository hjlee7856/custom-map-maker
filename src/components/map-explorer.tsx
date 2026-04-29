"use client";

import { logout } from "@/app/login/actions";
import { MapView } from "@/components/map-view";
import {
  getCategoryLabel,
  placeStatusColors,
  placeStatusLabels,
  type Category,
  type Place,
} from "@/lib/places";
import { Alert, Button, Card, Flex, Input, Segmented, Tag, Typography } from "antd";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

const pageStyle = {
  height: "100vh",
  padding: "16px",
  overflow: "hidden",
  background: "#f5f5f5",
};

const shellStyle = {
  display: "grid",
  gridTemplateColumns: "360px 1fr",
  gap: "16px",
  height: "100%",
  minHeight: 0,
};

const placeCardStyle = {
  cursor: "pointer",
};

const sidebarBodyStyle = {
  padding: 24,
  height: "100%",
  display: "flex",
  flexDirection: "column" as const,
  minHeight: 0,
};

const placesListStyle = {
  marginTop: "16px",
  padding: "8px",
  flex: 1,
  minHeight: 0,
  overflowY: "auto" as const,
  paddingRight: "4px",
};

const headerStyle = {
  width: "100%",
  alignItems: "center",
};

const headerActionsStyle = {
  marginLeft: "auto",
  flexWrap: "wrap" as const,
  justifyContent: "flex-end",
};

const { Title, Text, Paragraph } = Typography;

type MapExplorerProps = {
  categories: Category[];
  places: Place[];
  userEmail?: string;
};

export function MapExplorer({ categories, places, userEmail }: MapExplorerProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(
    places[0]?.id ?? null,
  );

  const categoryOptions = useMemo(
    () => [
      { label: "전체", value: "all" },
      ...categories.map((category) => ({
        label: category.label,
        value: category.id,
      })),
    ],
    [categories],
  );

  const filteredPlaces = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return places.filter((place) => {
      const matchesCategory =
        selectedCategory === "all" || place.category === selectedCategory;
      const matchesSearch =
        normalized.length === 0 ||
        [place.name, place.description, place.address, place.city].some(
          (value) => value.toLowerCase().includes(normalized),
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

  function signOut() {
    startTransition(async () => {
      await logout();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <main style={pageStyle}>
      <div className="app-shell" style={shellStyle}>
        <Card
          style={{ overflow: "hidden", minHeight: 0 }}
          styles={{ body: sidebarBodyStyle }}
        >
          <Flex gap={12} style={headerStyle}>
            <Title style={{ margin: 0, fontSize: "2.2rem", lineHeight: 1.1 }}>
              OO맵
            </Title>
            <Flex gap={8} style={headerActionsStyle}>
              {userEmail ? (
                <>
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => router.push("/report")}
                  >
                    제보하기
                  </Button>
                  <Button
                    size="small"
                    color="default"
                    variant="outlined"
                    onClick={() => router.push("/admin")}
                  >
                    관리자화면보기
                  </Button>
                  <Button
                    size="small"
                    color="default"
                    variant="filled"
                    onClick={signOut}
                    loading={isPending}
                  >
                    로그아웃
                  </Button>
                </>
              ) : (
                <Button
                  size="small"
                  type="primary"
                  onClick={() => router.push("/login")}
                >
                  로그인
                </Button>
              )}
            </Flex>
          </Flex>

          <Flex vertical gap={10} style={{ marginTop: "20px" }}>
            <Text strong>검색</Text>
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
              onChange={(value) => setSelectedCategory(String(value))}
            />
          </div>

          <div className="places-list" style={placesListStyle}>
            {filteredPlaces.length === 0 ? (
              <Alert
                type="info"
                showIcon
                message="검색어를 줄이거나 카테고리를 전체로 바꿔보세요."
              />
            ) : null}
            {filteredPlaces.map((place) => (
              <Card
                key={place.id}
                className={
                  effectiveSelectedPlaceId === place.id
                    ? "place-card is-selected"
                    : "place-card"
                }
                hoverable
                size="small"
                style={placeCardStyle}
                onClick={() => setSelectedPlaceId(place.id)}
              >
                <Flex justify="space-between" align="center" gap={12}>
                  <Text strong>{place.name}</Text>
                  <Tag color={placeStatusColors[place.status]}>
                    {placeStatusLabels[place.status]}
                  </Tag>
                </Flex>
                <Paragraph
                  type="secondary"
                  style={{ margin: "8px 0 0", lineHeight: 1.5 }}
                >
                  {place.description}
                </Paragraph>
                <Text type="secondary" style={{ fontSize: "0.92rem" }}>
                  {getCategoryLabel(categories, place.category)} · {place.city}{" "}
                  · {place.address}
                </Text>
              </Card>
            ))}
          </div>

        </Card>

        <Card
          style={{
            overflow: "hidden",
            height: "100%",
            minHeight: 0,
          }}
          styles={{ body: { padding: 0, height: "100%" } }}
        >
          <MapView
            categories={categories}
            places={filteredPlaces}
            selectedPlaceId={effectiveSelectedPlaceId}
            onSelectPlace={setSelectedPlaceId}
          />
        </Card>
      </div>
    </main>
  );
}
