import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

export const users = sqliteTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  departmentId: text("department_id").references(() => departments.id),
  role: text("role", { enum: ["ADMIN", "MANAGER", "USER"] }).default("USER"),
  phone: text("phone"),
  subject: text("subject"),
  title: text("title"),
});

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

export const departments = sqliteTable("department", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
});

export const documents = sqliteTable("document", {
  id: text("id").notNull().primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  files: text("files"), // Store JSON array of { name, url, source }
  authorId: text("author_id")
    .notNull()
    .references(() => users.id),
  departmentId: text("department_id").references(() => departments.id),
  status: text("status", { enum: ["PENDING", "APPROVED", "REJECTED"] }).default("PENDING"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).$defaultFn(() => new Date()),
});

export const approvals = sqliteTable("approval", {
  id: text("id").notNull().primaryKey(),
  documentId: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  approverId: text("approver_id")
    .notNull()
    .references(() => users.id),
  order: integer("order").notNull(), // 1 for first, 2 for second
  status: text("status", { enum: ["PENDING", "APPROVED", "REJECTED"] }).default("PENDING"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
});

export const defaultApprovalLines = sqliteTable("default_approval_line", {
  id: text("id").notNull().primaryKey(),
  departmentId: text("department_id")
    .notNull()
    .references(() => departments.id),
  approverId: text("approver_id")
    .notNull()
    .references(() => users.id),
  order: integer("order").notNull(), // 1 for first, 2 for second
});

export const usersRelations = relations(users, ({ many, one }) => ({
  documents: many(documents),
  approvals: many(approvals),
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
}));

export const departmentsRelations = relations(departments, ({ many }) => ({
  users: many(users),
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  author: one(users, {
    fields: [documents.authorId],
    references: [users.id],
  }),
  department: one(departments, {
    fields: [documents.departmentId],
    references: [departments.id],
  }),
  approvals: many(approvals),
}));

export const approvalsRelations = relations(approvals, ({ one }) => ({
  document: one(documents, {
    fields: [approvals.documentId],
    references: [documents.id],
  }),
  approver: one(users, {
    fields: [approvals.approverId],
    references: [users.id],
  }),
}));

export const defaultApprovalLinesRelations = relations(defaultApprovalLines, ({ one }) => ({
  department: one(departments, {
    fields: [defaultApprovalLines.departmentId],
    references: [departments.id],
  }),
  approver: one(users, {
    fields: [defaultApprovalLines.approverId],
    references: [users.id],
  }),
}));
