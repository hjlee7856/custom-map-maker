"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Flex, Form, Input, InputNumber, Select, Statistic, Tag } from "antd";
import { createPlaceAction, deletePlaceAction, updatePlaceAction } from "@/app/admin/actions";
import { logout } from "@/app/login/actions";
import { categories, type Place } from "@/lib/places";
import type { PlaceMutationInput } from "@/lib/place-repository";

const panelStyle = {
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: "24px",
  backdropFilter: "blur(10px)",
};

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
  userEmail?: string;
};

export function AdminDashboard({ places, userEmail }: AdminDashboardProps) {
  const router = useRouter();
  const [form] = Form.useForm<PlaceMutationInput>();
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    form.setFieldsValue(defaultValues);
  }, [form]);

  function resetForm() {
    setEditingPlaceId(null);
    form.setFieldsValue(defaultValues);
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

  return (
    <main style={{ minHeight: "100vh", padding: "24px", display: "grid", gap: "20px" }}>
      <Card style={panelStyle} styles={{ body: { padding: 24 } }} variant="borderless">
        <Flex justify="space-between" gap={16} wrap>
          <div>
            <p style={{ margin: 0, color: "var(--accent)", fontWeight: 700 }}>Admin Starter</p>
            <h1 style={{ margin: "8px 0 0", fontSize: "2rem" }}>운영/확인 대시보드</h1>
            <p style={{ margin: "10px 0 0", color: "var(--muted)" }}>
              {userEmail ? `${userEmail} 계정으로 로그인됨` : "인증된 사용자 전용 화면"}
            </p>
          </div>
          <Flex gap={12} wrap>
            <Link href="/">
              <Button size="large">공개 지도 돌아가기</Button>
            </Link>
            <Button size="large" onClick={signOut} loading={isPending}>
              로그아웃
            </Button>
          </Flex>
        </Flex>

        <div className="summary-grid" style={{ marginTop: "20px" }}>
          <Card size="small">
            <Statistic title="총 장소" value={places.length} />
          </Card>
          <Card size="small">
            <Statistic title="확인 대기" value={places.filter((place) => place.status === "pending").length} />
          </Card>
          <Card size="small">
            <Statistic title="카테고리" value={Object.keys(categories).length} />
          </Card>
        </div>
      </Card>

      <Card
        title={editingPlaceId ? "장소 수정" : "장소 추가"}
        style={panelStyle}
        styles={{ body: { padding: 24 } }}
        variant="borderless"
      >
        <Form<PlaceMutationInput> form={form} layout="vertical" onFinish={submit}>
          <div className="admin-form-grid">
            <Form.Item label="장소명" name="name" rules={[{ required: true, message: "장소명을 입력해주세요." }]}>
              <Input size="large" />
            </Form.Item>

            <Form.Item label="도시" name="city" rules={[{ required: true, message: "도시를 입력해주세요." }]}>
              <Input size="large" />
            </Form.Item>

            <Form.Item
              label="카테고리"
              name="category"
              rules={[{ required: true, message: "카테고리를 선택해주세요." }]}
            >
              <Select
                size="large"
                options={Object.entries(categories).map(([value, label]) => ({ value, label }))}
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
                ]}
              />
            </Form.Item>

            <Form.Item label="주소" name="address" rules={[{ required: true, message: "주소를 입력해주세요." }]}>
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
              <InputNumber size="large" style={{ width: "100%" }} step={0.0001} />
            </Form.Item>

            <Form.Item
              label="경도"
              name="longitude"
              rules={[{ required: true, message: "경도를 입력해주세요." }]}
            >
              <InputNumber size="large" style={{ width: "100%" }} step={0.0001} />
            </Form.Item>
          </div>

          {feedback ? (
            <div
              style={{
                marginBottom: 16,
                padding: "12px 14px",
                borderRadius: 16,
                background: feedback.type === "error" ? "rgba(220, 38, 38, 0.08)" : "rgba(15, 118, 110, 0.08)",
                color: feedback.type === "error" ? "#991b1b" : "var(--accent-strong)",
              }}
            >
              {feedback.text}
            </div>
          ) : null}

          <Flex gap={12} wrap>
            <Button type="primary" htmlType="submit" size="large" loading={isPending}>
              {editingPlaceId ? "수정 저장" : "장소 추가"}
            </Button>
            <Button size="large" onClick={resetForm} disabled={isPending}>
              새 입력으로 초기화
            </Button>
          </Flex>
        </Form>
      </Card>

      <Card title="장소 목록" style={panelStyle} styles={{ body: { padding: 0 } }} variant="borderless">
        <div className="dashboard-list">
          {places.map((place) => (
            <div className="dashboard-list-item" key={place.id}>
              <Flex justify="space-between" align="center" gap={16} style={{ width: "100%" }} wrap>
                <div>
                  <strong>{place.name}</strong>
                  <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>
                    {categories[place.category]} · {place.city} · {place.address}
                  </p>
                  <p style={{ margin: "10px 0 0", color: "var(--muted)", lineHeight: 1.5 }}>
                    {place.description}
                  </p>
                </div>
                <Flex gap={8} align="center" wrap>
                  <Tag color={place.status === "published" ? "green" : "gold"}>
                    {place.status === "published" ? "공개" : "검토 필요"}
                  </Tag>
                  <Button size="small" onClick={() => fillForm(place)} disabled={isPending}>
                    수정
                  </Button>
                  <Button danger size="small" onClick={() => remove(place)} disabled={isPending}>
                    삭제
                  </Button>
                </Flex>
              </Flex>
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}
