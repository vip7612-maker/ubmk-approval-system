import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { departments, users as usersTable, defaultApprovalLines } from "@/lib/db/schema";
import UserManagement from "@/components/admin/UserManagement";
import ApprovalLineConfig from "@/components/admin/ApprovalLineConfig";
import { getAllDefaultApprovalLines } from "@/lib/actions/config";

export default async function AdminPage() {
  const session = await auth();

  // Basic role check
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const users = await db.select().from(usersTable);
  const allDepartments = await db.select().from(departments);
  const initialConfigs = await getAllDefaultApprovalLines();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', paddingBottom: '100px' }}>
      <header>
        <h1 style={{ marginBottom: '10px' }}>시스템 관리자 센터</h1>
        <p style={{ color: 'var(--text-muted)' }}>교직원 명단 및 상세 정보를 관리하고 권한을 설정합니다.</p>
      </header>

      <section>
        <UserManagement 
          users={users as any} 
          departments={allDepartments} 
        />
        <ApprovalLineConfig 
          departments={allDepartments}
          users={users as any}
          initialConfigs={initialConfigs as any}
        />
      </section>
    </div>
  );
}
