"use server";

import { redirect } from "next/navigation";

import { ApiError, updateProduct } from "./api";

export type EditFormState = {
  error?: string;
};

export async function updateProductAction(
  id: number,
  _prev: EditFormState,
  formData: FormData,
): Promise<EditFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name || !description) {
    return { error: "Name and description are required" };
  }

  try {
    await updateProduct(id, { name, description });
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    throw err;
  }

  redirect(`/products/${id}`);
}
