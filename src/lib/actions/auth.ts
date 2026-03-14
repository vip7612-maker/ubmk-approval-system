"use server";

import { signOut } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function handleSignOut() {
  await signOut({ redirectTo: "/" });
  revalidatePath("/");
  revalidatePath("/admin");
}
