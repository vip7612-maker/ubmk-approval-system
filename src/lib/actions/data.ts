"use server";

import { db } from "@/lib/db";
import { documents, approvals, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";

export async function getDocumentsWithApprovals() {
  const session = await auth();
  if (!session?.user) return [];

  const docs = await db.query.documents.findMany({
    orderBy: [desc(documents.createdAt)],
    with: {
      author: true,
      approvals: {
        with: {
          approver: true,
        },
        orderBy: (approvals, { asc }) => [asc(approvals.order)],
      },
    },
  });

  return docs;
}

export async function getAllUsers() {
  return await db.query.users.findMany();
}

export async function getAllDefaultApprovalLines() {
  return await db.query.defaultApprovalLines.findMany({
    with: {
      approver: true
    }
  });
}
