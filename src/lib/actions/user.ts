"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateUser(userId: string, data: {
  name?: string;
  phone?: string;
  subject?: string;
  title?: string;
  departmentId?: string;
  role?: "ADMIN" | "MANAGER" | "USER";
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can manage users.");
  }

  try {
    await db.update(users)
      .set({
        ...data,
      })
      .where(eq(users.id, userId));

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("UPDATE_USER_ERROR:", error);
    return { success: false, error: error.message };
  }
}
