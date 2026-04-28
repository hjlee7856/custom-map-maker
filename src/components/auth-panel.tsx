"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Flex, Input, Segmented } from "antd";
import { login, signup } from "@/app/login/actions";

const panelStyle = {
  width: "min(460px, 100%)",
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: "24px",
  backdropFilter: "blur(10px)",
};

type Mode = "login" | "signup";

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
      }}
    >
      <Card style={panelStyle} styles={{ body: { padding: 24 } }} variant="borderless">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <Flex vertical gap={16}>
          <div>
            <p style={{ margin: 0, color: "var(--accent)", fontWeight: 700 }}>Supabase Auth</p>
            <h1 style={{ margin: "8px 0 0", fontSize: "2rem" }}>관리자 로그인</h1>
            <p style={{ margin: "10px 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              이메일/비밀번호 기반으로 로그인하고 관리자 화면 접근을 보호합니다.
            </p>
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

          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ fontWeight: 700 }}>이메일</span>
            <Input
              type="email"
              size="large"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
            />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ fontWeight: 700 }}>비밀번호</span>
            <Input.Password
              size="large"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호 입력"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </label>

          {feedback ? (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 16,
                background: feedback.type === "error" ? "rgba(220, 38, 38, 0.08)" : "rgba(15, 118, 110, 0.08)",
                color: feedback.type === "error" ? "#991b1b" : "var(--accent-strong)",
              }}
            >
              {feedback.text}
            </div>
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
