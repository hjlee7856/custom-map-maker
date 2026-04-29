"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AutoComplete, Button, Card, Flex, Form, Input, InputNumber } from "antd";
import { createReportAction } from "@/app/report/actions";
import { CoordinatePicker } from "@/components/coordinate-picker";
import type { Category, Place } from "@/lib/places";
import type { ReportMutationInput } from "@/lib/place-repository";

const panelStyle = {
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: "24px",
  backdropFilter: "blur(10px)",
};

const defaultValues: ReportMutationInput = {
  name: "",
  category: "",
  description: "",
  address: "",
  city: "",
  latitude: 37.5665,
  longitude: 126.978,
};

type ReportFormProps = {
  categories: Category[];
  previewPlaces: Place[];
  userEmail?: string;
};

function getDefaultCategoryValue(categories: Category[]) {
  return categories.find((category) => category.id === "report")?.label ?? categories[0]?.label ?? "제보";
}

export function ReportForm({ categories, previewPlaces, userEmail }: ReportFormProps) {
  const router = useRouter();
  const [form] = Form.useForm<ReportMutationInput>();
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const defaultCategoryValue = useMemo(() => getDefaultCategoryValue(categories), [categories]);
  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: category.label,
        label: category.label,
      })),
    [categories],
  );

  function resetForm() {
    form.setFieldsValue({
      ...defaultValues,
      category: defaultCategoryValue,
    });
  }

  function submit(values: ReportMutationInput) {
    setFeedback(null);

    startTransition(async () => {
      const result = await createReportAction(values);

      if (result.error) {
        setFeedback({ type: "error", text: result.error });
        return;
      }

      setFeedback({
        type: "success",
        text: "제보를 등록했습니다. 관리자 확인 후 공개 지도에 반영됩니다.",
      });
      resetForm();
      router.refresh();
    });
  }

  return (
    <main style={{ minHeight: "100vh", padding: "24px" }}>
      <Card style={panelStyle} styles={{ body: { padding: 24 } }} variant="borderless">
        <Flex justify="space-between" gap={16} wrap>
          <div>
            <p style={{ margin: 0, color: "var(--accent)", fontWeight: 700 }}>Report Flow</p>
            <h1 style={{ margin: "8px 0 0", fontSize: "2rem" }}>지도 제보 등록</h1>
            <p style={{ margin: "10px 0 0", color: "var(--muted)" }}>
              {userEmail ? `${userEmail} 계정으로 제보 등록` : "로그인한 사용자만 제보를 등록할 수 있습니다."}
            </p>
          </div>
          <Flex gap={12} wrap>
            <Link href="/">
              <Button size="large">공개 지도 돌아가기</Button>
            </Link>
            <Link href="/admin">
              <Button size="large">관리자 화면</Button>
            </Link>
          </Flex>
        </Flex>

        <Form<ReportMutationInput>
          form={form}
          layout="vertical"
          onFinish={submit}
          initialValues={{
            ...defaultValues,
            category: defaultCategoryValue,
          }}
          style={{ marginTop: 24 }}
        >
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
              rules={[{ required: true, message: "카테고리를 입력해주세요." }]}
              extra="기존 카테고리를 선택하거나 새 카테고리명을 직접 입력할 수 있습니다."
            >
              <AutoComplete
                size="large"
                options={categoryOptions}
                placeholder="예: 제보, 맛집, 주차"
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

            <Form.Item label="위도" name="latitude" rules={[{ required: true, message: "위도를 입력해주세요." }]}>
              <InputNumber size="large" style={{ width: "100%" }} step={0.0001} />
            </Form.Item>

            <Form.Item label="경도" name="longitude" rules={[{ required: true, message: "경도를 입력해주세요." }]}>
              <InputNumber size="large" style={{ width: "100%" }} step={0.0001} />
            </Form.Item>
          </div>

          <Form.Item shouldUpdate noStyle>
            {() => (
              <CoordinatePicker
                categories={categories}
                places={previewPlaces}
                value={{
                  latitude: Number(form.getFieldValue("latitude") ?? defaultValues.latitude),
                  longitude: Number(form.getFieldValue("longitude") ?? defaultValues.longitude),
                }}
                onChange={({ latitude, longitude }) => {
                  form.setFieldsValue({ latitude, longitude });
                }}
              />
            )}
          </Form.Item>

          {feedback ? (
            <div className={`feedback-panel ${feedback.type === "error" ? "is-error" : "is-success"}`}>
              {feedback.text}
            </div>
          ) : null}

          <Flex gap={12} wrap style={{ marginTop: 20 }}>
            <Button htmlType="submit" type="primary" size="large" loading={isPending}>
              제보 등록
            </Button>
            <Button
              size="large"
              onClick={() => {
                setFeedback(null);
                resetForm();
              }}
              disabled={isPending}
            >
              입력 초기화
            </Button>
          </Flex>
        </Form>
      </Card>
    </main>
  );
}
