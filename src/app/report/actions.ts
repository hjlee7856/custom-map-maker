"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedUser } from "@/lib/auth";
import { createReport, type ReportMutationInput } from "@/lib/place-repository";

type ActionResult = {
  error?: string;
  success?: boolean;
};

export async function createReportAction(input: ReportMutationInput): Promise<ActionResult> {
  try {
    await requireAuthenticatedUser();
    await createReport(input);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/report");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "제보 등록에 실패했습니다." };
  }
}
