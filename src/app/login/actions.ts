"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type AuthActionResult = {
  error?: string;
  message?: string;
  success?: boolean;
};

function readCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!email || !password) {
    throw new Error("이메일과 비밀번호를 모두 입력해주세요.");
  }

  return { email, password };
}

export async function login(formData: FormData): Promise<AuthActionResult> {
  const supabase = await createClient();

  if (!supabase) {
    return { error: "Supabase 인증 설정이 없습니다." };
  }

  try {
    const credentials = readCredentials(formData);
    const { error } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "로그인에 실패했습니다." };
  }
}

export async function signup(formData: FormData): Promise<AuthActionResult> {
  const supabase = await createClient();

  if (!supabase) {
    return { error: "Supabase 인증 설정이 없습니다." };
  }

  try {
    const credentials = readCredentials(formData);
    const { error, data } = await supabase.auth.signUp(credentials);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/", "layout");

    if (data.session) {
      return { success: true };
    }

    return {
      success: true,
      message: "가입 요청이 완료되었습니다. 이메일 확인 후 로그인해주세요.",
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "회원가입에 실패했습니다." };
  }
}

export async function logout() {
  const supabase = await createClient();

  if (!supabase) {
    return;
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}
