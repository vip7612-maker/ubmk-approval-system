"use server";

import { db } from "@/lib/db";
import { documents, approvals } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { eq, and } from "drizzle-orm";

export async function createApprovalRequest(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("로그인이 필요합니다. (Unauthorized)");

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const departmentId = formData.get("departmentId") as string;
    const approver1Id = formData.get("approver1Id") as string;
    const approver2Id = formData.get("approver2Id") as string;
    const filesJson = formData.get("files") as string; // JSON string of files array

    if (!title) throw new Error("Title is required");

    const docId = uuidv4();

    // Create document and approvals in a transaction or sequential with error handling
    await db.insert(documents).values({
      id: docId,
      title,
      content,
      files: filesJson,
      authorId: session.user.id,
      departmentId,
      status: "PENDING",
    });

    // Check if approvers exist or handle placeholders gracefully
    // For now, let's only insert if the ID is NOT a placeholder or actually exists
    const usersList = await db.query.users.findMany();
    const validUserIds = usersList.map(u => u.id);

    if (approver1Id && validUserIds.includes(approver1Id)) {
      await db.insert(approvals).values({
        id: uuidv4(),
        documentId: docId,
        approverId: approver1Id,
        order: 1,
        status: "PENDING",
      });
    }

    if (approver2Id && validUserIds.includes(approver2Id)) {
      await db.insert(approvals).values({
        id: uuidv4(),
        documentId: docId,
        approverId: approver2Id,
        order: 2,
        status: "PENDING",
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("CREATE_APPROVAL_ERROR:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

export async function approveDocument(docId: string, order: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Update specific approval
  await db.update(approvals)
    .set({ status: "APPROVED", updatedAt: new Date() })
    .where(and(eq(approvals.documentId, docId), eq(approvals.approverId, session.user.id!)));

  // If it's the 2nd approval or 1st approval and 1st only exists, complete document
  // Simplified logic for now
  if (order === 2) {
    await db.update(documents)
      .set({ status: "APPROVED" })
      .where(eq(documents.id, docId));
  }

  revalidatePath("/");
  return { success: true };
}
