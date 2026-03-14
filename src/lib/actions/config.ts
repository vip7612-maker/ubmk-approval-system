"use server";

import { db } from "@/lib/db";
import { defaultApprovalLines, users, departments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

export async function getDefaultApprovalLines(departmentId: string) {
  return await db.query.defaultApprovalLines.findMany({
    where: eq(defaultApprovalLines.departmentId, departmentId),
    with: {
      approver: true
    },
    orderBy: (lines, { asc }) => [asc(lines.order)]
  });
}

export async function setDefaultApprovalLine(departmentId: string, approver1Id: string, approver2Id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    // Delete existing lines for this department
    await db.delete(defaultApprovalLines).where(eq(defaultApprovalLines.departmentId, departmentId));

    // Insert new lines
    const newLines = [
      {
        id: uuidv4(),
        departmentId,
        approverId: approver1Id,
        order: 1
      },
      {
        id: uuidv4(),
        departmentId,
        approverId: approver2Id,
        order: 2
      }
    ];

    await db.insert(defaultApprovalLines).values(newLines);

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("SET_DEFAULT_APPROVAL_LINE_ERROR:", error);
    return { success: false, error: error.message };
  }
}

export async function getAllDefaultApprovalLines() {
  return await db.query.defaultApprovalLines.findMany({
    with: {
      department: true,
      approver: true
    }
  });
}
