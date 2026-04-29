"use client";

import {
  createPlaceAction,
  deletePlaceAction,
  updatePlaceAction,
  updatePlaceStatusAction,
} from "@/app/admin/actions";
import { logout } from "@/app/login/actions";
import { CoordinatePicker } from "@/components/coordinate-picker";
import type { PlaceMutationInput } from "@/lib/place-repository";
import {
  getCategoryLabel,
  placeStatusColors,
  placeStatusLabels,
  type Category,
  type Place,
} from "@/lib/places";
import {
  Alert,
  Button,
  Card,
  Flex,
  Form,
  Input,
  InputNumber,
  Select,
  Statistic,
  Tag,
  Typography,
} from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
const { Title, Text, Paragraph } = Typography;

const defaultValues: PlaceMutationInput = {
  name: "",
  category: "food",
  description: "",
  address: "",
  city: "",
  status: "pending",
  latitude: 37.5665,
  longitude: 126.978,
};

type AdminDashboardProps = {
  places: Place[];
  categories: Category[];
  previewPlaces: Place[];
  userEmail?: string;
};

export function AdminDashboard({
  places,
  categories,
  previewPlaces,
  userEmail,
}: AdminDashboardProps) {
  const router = useRouter();
  const [form] = Form.useForm<PlaceMutationInput>();
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Place["status"]>(
    "all",
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const pendingCount = places.filter(
    (place) => place.status === "pending",
  ).length;
  const publishedCount = places.filter(
    (place) => place.status === "published",
  ).length;
  const rejectedCount = places.filter(
    (place) => place.status === "rejected",
  ).length;

  useEffect(() => {
    form.setFieldsValue({
      ...defaultValues,
      category: categories[0]?.id ?? defaultValues.category,
    });
  }, [categories, form]);

  const filteredPlaces = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return [...places]
      .filter((place) => {
        const matchesStatus =
          statusFilter === "all" || place.status === statusFilter;
        const matchesCategory =
          categoryFilter === "all" || place.category === categoryFilter;
        const matchesSearch =
          normalized.length === 0 ||
          [place.name, place.description, place.address, place.city].some(
            (value) => value.toLowerCase().includes(normalized),
          );

        return matchesStatus && matchesCategory && matchesSearch;
      })
      .sort((left, right) => {
        const weight = {
          pending: 0,
          rejected: 1,
          published: 2,
        } satisfies Record<Place["status"], number>;

        return (
          weight[left.status] - weight[right.status] ||
          left.name.localeCompare(right.name, "ko")
        );
      });
  }, [categoryFilter, places, search, statusFilter]);

  function resetForm() {
    setEditingPlaceId(null);
    form.setFieldsValue({
      ...defaultValues,
      category: categories[0]?.id ?? defaultValues.category,
    });
  }

  function fillForm(place: Place) {
    setEditingPlaceId(place.id);
    form.setFieldsValue({
      name: place.name,
      category: place.category,
      description: place.description,
      address: place.address,
      city: place.city,
      status: place.status,
      latitude: place.coordinates[1],
      longitude: place.coordinates[0],
    });
    setFeedback(null);
  }

  function submit(values: PlaceMutationInput) {
    setFeedback(null);

    startTransition(async () => {
      const result = editingPlaceId
        ? await updatePlaceAction(editingPlaceId, values)
        : await createPlaceAction(values);

      if (result.error) {
        setFeedback({ type: "error", text: result.error });
        return;
      }

      setFeedback({
        type: "success",
        text: editingPlaceId ? "장소를 수정했습니다." : "장소를 추가했습니다.",
      });
      resetForm();
      router.refresh();
    });
  }

  function remove(place: Place) {
    if (!window.confirm(`"${place.name}" 장소를 삭제할까요?`)) {
      return;
    }

    setFeedback(null);

    startTransition(async () => {
      const result = await deletePlaceAction(place.id);

      if (result.error) {
        setFeedback({ type: "error", text: result.error });
        return;
      }

      if (editingPlaceId === place.id) {
        resetForm();
      }

      setFeedback({ type: "success", text: "장소를 삭제했습니다." });
      router.refresh();
    });
  }

  function signOut() {
    startTransition(async () => {
      await logout();
      router.push("/");
      router.refresh();
    });
  }

  function changeStatus(place: Place, status: Place["status"]) {
    const actionLabel = placeStatusLabels[status];

    setFeedback(null);

    startTransition(async () => {
      const result = await updatePlaceStatusAction(place.id, status);

      if (result.error) {
        setFeedback({ type: "error", text: result.error });
        return;
      }

      setFeedback({
        type: "success",
        text: `"${place.name}" 상태를 ${actionLabel}(으)로 변경했습니다.`,
      });

      if (editingPlaceId === place.id) {
        form.setFieldValue("status", status);
      }

      router.refresh();
    });
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px",
        display: "grid",
        gap: "20px",
        background: "#f5f5f5",
      }}
    >
      <Card styles={{ body: { padding: 24 } }}>
        <Flex justify="space-between" gap={16} wrap>
          <div>
            <Text type="secondary">Admin Starter</Text>
            <Title level={2} style={{ margin: "8px 0 0" }}>운영/확인 대시보드</Title>
            <Paragraph type="secondary" style={{ margin: "10px 0 0" }}>
              {userEmail
                ? `${userEmail} 계정으로 로그인됨`
                : "인증된 사용자 전용 화면"}
            </Paragraph>
          </div>
          <Flex gap={12} wrap>
            <Link href="/report">
              <Button size="large">제보 화면 보기</Button>
            </Link>
            <Link href="/">
              <Button size="large">공개 지도 돌아가기</Button>
            </Link>
            <Button size="large" onClick={signOut} loading={isPending}>
              로그아웃
            </Button>
          </Flex>
        </Flex>

        <div
          className="summary-grid summary-grid-admin"
          style={{ marginTop: "20px" }}
        >
          <Card size="small">
            <Statistic title="총 장소" value={places.length} />
          </Card>
          <Card size="small">
            <Statistic title="확인 대기" value={pendingCount} />
          </Card>
          <Card size="small">
            <Statistic title="공개 중" value={publishedCount} />
          </Card>
          <Card size="small">
            <Statistic title="반려" value={rejectedCount} />
          </Card>
        </div>
      </Card>

      <section style={{ display: "grid", gap: "20px" }}>
        <Card
          title={editingPlaceId ? "장소 수정" : "장소 추가"}
          styles={{ body: { padding: 24 } }}
        >
          <Form<PlaceMutationInput>
            form={form}
            layout="vertical"
            onFinish={submit}
          >
            <div className="admin-form-grid">
              <Form.Item
                label="장소명"
                name="name"
                rules={[{ required: true, message: "장소명을 입력해주세요." }]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="도시"
                name="city"
                rules={[{ required: true, message: "도시를 입력해주세요." }]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="카테고리"
                name="category"
                rules={[
                  { required: true, message: "카테고리를 선택해주세요." },
                ]}
              >
                <Select
                  size="large"
                  options={categories.map((category) => ({
                    value: category.id,
                    label: category.label,
                  }))}
                />
              </Form.Item>

              <Form.Item
                label="상태"
                name="status"
                rules={[{ required: true, message: "상태를 선택해주세요." }]}
              >
                <Select
                  size="large"
                  options={[
                    { value: "published", label: "공개" },
                    { value: "pending", label: "확인 대기" },
                    { value: "rejected", label: "반려" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label="주소"
                name="address"
                rules={[{ required: true, message: "주소를 입력해주세요." }]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="설명"
                name="description"
                rules={[{ required: true, message: "설명을 입력해주세요." }]}
              >
                <Input.TextArea autoSize={{ minRows: 4, maxRows: 6 }} />
              </Form.Item>

              <Form.Item
                label="위도"
                name="latitude"
                rules={[{ required: true, message: "위도를 입력해주세요." }]}
              >
                <InputNumber
                  size="large"
                  style={{ width: "100%" }}
                  step={0.0001}
                />
              </Form.Item>

              <Form.Item
                label="경도"
                name="longitude"
                rules={[{ required: true, message: "경도를 입력해주세요." }]}
              >
                <InputNumber
                  size="large"
                  style={{ width: "100%" }}
                  step={0.0001}
                />
              </Form.Item>
            </div>

            <Form.Item shouldUpdate noStyle>
              {() => (
                <CoordinatePicker
                  categories={categories}
                  places={previewPlaces}
                  value={{
                    latitude: Number(
                      form.getFieldValue("latitude") ?? defaultValues.latitude,
                    ),
                    longitude: Number(
                      form.getFieldValue("longitude") ??
                        defaultValues.longitude,
                    ),
                  }}
                  onChange={({ latitude, longitude }) => {
                    form.setFieldsValue({ latitude, longitude });
                  }}
                />
              )}
            </Form.Item>

            {feedback ? (
              <Alert
                type={feedback.type === "error" ? "error" : "success"}
                showIcon
                message={feedback.text}
              />
            ) : null}

            <Flex gap={12} wrap>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={isPending}
              >
                {editingPlaceId ? "수정 저장" : "장소 추가"}
              </Button>
              <Button size="large" onClick={resetForm} disabled={isPending}>
                새 입력으로 초기화
              </Button>
            </Flex>
          </Form>
        </Card>
      </section>

      <Card
        title="검수 목록"
        styles={{ body: { padding: 24 } }}
      >
        <div className="admin-filter-bar">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            allowClear
            size="large"
            placeholder="장소명, 설명, 주소, 도시 검색"
          />
          <Select
            size="large"
            value={statusFilter}
            options={[
              { value: "all", label: "전체 상태" },
              { value: "pending", label: "확인 대기" },
              { value: "published", label: "공개" },
              { value: "rejected", label: "반려" },
            ]}
            onChange={(value) =>
              setStatusFilter(value as "all" | Place["status"])
            }
          />
          <Select
            size="large"
            value={categoryFilter}
            options={[
              { value: "all", label: "전체 카테고리" },
              ...categories.map((category) => ({
                value: category.id,
                label: category.label,
              })),
            ]}
            onChange={(value) => setCategoryFilter(value)}
          />
        </div>

        <div className="dashboard-list">
          {filteredPlaces.map((place) => (
            <div className="dashboard-list-item" key={place.id}>
              <Flex
                justify="space-between"
                align="center"
                gap={16}
                style={{ width: "100%" }}
                wrap
              >
                <div>
                  <strong>{place.name}</strong>
                  <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>
                    {getCategoryLabel(categories, place.category)} ·{" "}
                    {place.city} · {place.address}
                  </p>
                  <p
                    style={{
                      margin: "10px 0 0",
                      color: "var(--muted)",
                      lineHeight: 1.5,
                    }}
                  >
                    {place.description}
                  </p>
                </div>
                <Flex gap={8} align="center" wrap>
                  <Tag color={placeStatusColors[place.status]}>
                    {placeStatusLabels[place.status]}
                  </Tag>
                  {place.status !== "published" ? (
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => changeStatus(place, "published")}
                      disabled={isPending}
                    >
                      승인
                    </Button>
                  ) : null}
                  {place.status !== "rejected" ? (
                    <Button
                      danger
                      size="small"
                      onClick={() => changeStatus(place, "rejected")}
                      disabled={isPending}
                    >
                      반려
                    </Button>
                  ) : null}
                  <Button
                    size="small"
                    onClick={() => fillForm(place)}
                    disabled={isPending}
                  >
                    수정
                  </Button>
                  <Button
                    danger
                    size="small"
                    onClick={() => remove(place)}
                    disabled={isPending}
                  >
                    삭제
                  </Button>
                </Flex>
              </Flex>
            </div>
          ))}
          {filteredPlaces.length === 0 ? (
            <div className="dashboard-empty">조건에 맞는 장소가 없습니다.</div>
          ) : null}
        </div>
      </Card>
    </main>
  );
}
