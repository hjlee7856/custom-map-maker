"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/auth";
import {
  createCategory,
  createPlace,
  deletePlace,
  type PlaceMutationInput,
  updatePlace,
  updatePlaceStatus,
} from "@/lib/place-repository";
import type { Place } from "@/lib/places";

type ActionResult = {
  error?: string;
  success?: boolean;
};

export async function createPlaceAction(input: PlaceMutationInput): Promise<ActionResult> {
  try {
    await requireAdminUser();
    await createPlace(input);
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "장소 생성에 실패했습니다." };
  }
}

export async function createCategoryAction(label: string): Promise<ActionResult> {
  try {
    await requireAdminUser();
    await createCategory(label);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/report");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "카테고리 추가에 실패했습니다." };
  }
}

export async function updatePlaceAction(id: string, input: PlaceMutationInput): Promise<ActionResult> {
  try {
    await requireAdminUser();
    await updatePlace(id, input);
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "장소 수정에 실패했습니다." };
  }
}

export async function deletePlaceAction(id: string): Promise<ActionResult> {
  try {
    await requireAdminUser();
    await deletePlace(id);
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "장소 삭제에 실패했습니다." };
  }
}

export async function updatePlaceStatusAction(
  id: string,
  status: Place["status"],
): Promise<ActionResult> {
  try {
    await requireAdminUser();
    await updatePlaceStatus(id, status);
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "상태 변경에 실패했습니다." };
  }
}
