"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Flex, Form, Input, Segmented, Typography } from "antd";
import { login, signup } from "@/app/login/actions";

type Mode = "login" | "signup";
const { Title, Text, Paragraph } = Typography;

export function AuthPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; text: string } | null>(null);

  function submit() {
    setPending(true);
    setFeedback(null);

    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);

    startTransition(async () => {
      const result = mode === "login" ? await login(formData) : await signup(formData);

      if (result.error) {
        setFeedback({ type: "error", text: result.error });
        setPending(false);
        return;
      }

      if (result.message) {
        setFeedback({ type: "success", text: result.message });
        setPending(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px",
        display: "grid",
        placeItems: "center",
        background: "#f5f5f5",
      }}
    >
      <Card style={{ width: "min(460px, 100%)" }} styles={{ body: { padding: 24 } }}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <Flex vertical gap={16}>
          <div>
            <Text type="secondary">Supabase Auth</Text>
            <Title level={2} style={{ margin: "8px 0 0" }}>관리자 로그인</Title>
            <Paragraph type="secondary" style={{ margin: "10px 0 0", lineHeight: 1.6 }}>
              이메일/비밀번호 기반으로 로그인하고 관리자 화면 접근을 보호합니다.
            </Paragraph>
          </div>

          <Segmented
            block
            options={[
              { label: "로그인", value: "login" },
              { label: "회원가입", value: "signup" },
            ]}
            value={mode}
            onChange={(value) => setMode(value as Mode)}
          />

          <Form.Item label="이메일" style={{ marginBottom: 0 }}>
            <Input
              type="email"
              size="large"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item label="비밀번호" style={{ marginBottom: 0 }}>
            <Input.Password
              size="large"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호 입력"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </Form.Item>

          {feedback ? (
            <Alert
              type={feedback.type === "error" ? "error" : "success"}
              showIcon
              message={feedback.text}
            />
          ) : null}

          <Button type="primary" size="large" loading={pending} htmlType="submit">
            {mode === "login" ? "로그인" : "회원가입"}
          </Button>
          </Flex>
        </form>
      </Card>
    </main>
  );
}
