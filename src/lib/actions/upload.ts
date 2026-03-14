"use server";

import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function uploadFile(formData: FormData) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn("BLOB_READ_WRITE_TOKEN is not set. Skipping file upload.");
    return null;
  }

  const file = formData.get("file") as File;
  if (!file || file.size === 0) return null;

  try {
    const blob = await put(file.name, file, {
      access: "public",
    });
    return blob.url;
  } catch (error) {
    console.error("UPLOAD_ERROR:", error);
    return null;
  }
}
