"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/auth";
import {
  createPlace,
  deletePlace,
  type PlaceMutationInput,
  updatePlace,
} from "@/lib/place-repository";

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
