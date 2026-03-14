import { auth } from "@/lib/auth";
import ApprovalForm from "@/components/approval/ApprovalForm";
import { getDocumentsWithApprovals, getAllUsers, getAllDefaultApprovalLines } from "@/lib/actions/data";
import { approveDocument } from "@/lib/actions/approval";
import ApprovalTable from "@/components/approval/ApprovalTable";

export default async function Home() {
  const session = await auth();

  if (!session) {
    return (
      <div className="glass-card" style={{ padding: '60px', textAlign: 'center', marginTop: '40px' }}>
        <h2 style={{ marginBottom: '20px' }}>UBMK 교직원 전용 시스템입니다</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>계속하시려면 Google 계정으로 로그인해주세요.</p>
        <a href="/api/auth/signin" className="btn btn-primary" style={{ padding: '15px 40px', fontSize: '1.2rem', textDecoration: 'none' }}>
          Google 로그인
        </a>
      </div>
    );
  }

  const documents = await getDocumentsWithApprovals();
  const allUsers = await getAllUsers();
  const defaultLines = await getAllDefaultApprovalLines();

  const handleApprove = async (docId: string, order: number) => {
    "use server";
    await approveDocument(docId, order);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header>
        <h1>안녕하세요, {session.user?.name}님</h1>
        <p style={{ color: 'var(--text-muted)' }}>오늘도 즐거운 하루 되세요. 새로운 결재를 올리거나 상태를 확인할 수 있습니다.</p>
      </header>

      <section>
        <ApprovalForm users={allUsers} defaultLines={defaultLines as any} />
      </section>

      <section className="glass-card" style={{ padding: '30px', overflowX: 'auto' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: '700' }}>📊 최근 결재 현황</h2>
        <ApprovalTable 
          documents={documents as any} 
          currentUserId={session.user?.id}
          approveAction={handleApprove}
        />
      </section>
    </div>
  );
}
