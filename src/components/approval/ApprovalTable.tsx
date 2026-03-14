"use client";

import { useState } from "react";
import DocumentDetailModal from "./DocumentDetailModal";

interface Approval {
  id: string;
  status: string;
  approverId: string;
  order: number;
  approver: {
    name: string | null;
  };
}

interface Document {
  id: string;
  title: string;
  content: string | null;
  createdAt: Date | null;
  fileUrl?: string | null;
  files: string | null;
  status: string | null;
  author: {
    name: string | null;
    email: string;
  };
  approvals: Approval[];
}

interface ApprovalTableProps {
  documents: Document[];
  currentUserId: string | undefined;
  approveAction: (docId: string, order: number) => Promise<void>;
}

export default function ApprovalTable({ documents, currentUserId, approveAction }: ApprovalTableProps) {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  return (
    <>
      <div className="table-wrapper">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
            <th style={{ padding: '12px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>날짜</th>
            <th style={{ padding: '12px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>기안자</th>
            <th style={{ padding: '12px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>결재문서</th>
            <th style={{ padding: '12px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', textAlign: 'center', fontSize: '0.85rem' }}>1차 결재</th>
            <th style={{ padding: '12px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', textAlign: 'center', fontSize: '0.85rem' }}>2차 결재</th>
            <th style={{ padding: '12px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>최종 상태</th>
          </tr>
        </thead>
        <tbody>
          {documents.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>등록된 결재 내역이 없습니다.</td>
            </tr>
          ) : (
            documents.map((doc) => {
              const app1 = doc.approvals.find(a => a.order === 1);
              const app2 = doc.approvals.find(a => a.order === 2);
              
              const canApprove1 = app1 && app1.approverId === currentUserId && app1.status === 'PENDING';
              const canApprove2 = app2 && app2.approverId === currentUserId && app2.status === 'PENDING';

              return (
                <tr key={doc.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  {/* 날짜 */}
                  <td style={{ padding: '8px 12px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {new Date(doc.createdAt!).toLocaleDateString()}
                  </td>
                  
                  {/* 기안자 */}
                  <td style={{ padding: '8px 12px', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>{doc.author.name}</td>
                  
                  {/* 결재문서 */}
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        fontSize: '0.9rem', 
                        fontWeight: '500',
                        maxWidth: '180px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }} title={doc.title}>
                        {doc.title}
                      </span>
                      <button 
                        onClick={() => setSelectedDoc(doc)}
                        className="btn"
                        style={{ 
                          padding: '2px 8px', 
                          fontSize: '0.7rem', 
                          background: 'rgba(255,255,255,0.1)', 
                          border: '1px solid var(--glass-border)',
                          borderRadius: '4px',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        보기 🔍
                      </button>
                    </div>
                  </td>

                  {/* 1차 결재 */}
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', minWidth: '50px' }}>{app1?.approver.name}</span>
                      {canApprove1 ? (
                        <button 
                          onClick={() => approveAction(doc.id, 1)}
                          className="btn btn-primary" 
                          style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                        >
                          결재하기
                        </button>
                      ) : (
                        <Badge status={app1?.status || 'PENDING'} />
                      )}
                    </div>
                  </td>

                  {/* 2차 결재 */}
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', minWidth: '50px' }}>{app2?.approver.name}</span>
                      {canApprove2 ? (
                        <button 
                          onClick={() => approveAction(doc.id, 2)}
                          className="btn btn-primary" 
                          style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                        >
                          결재하기
                        </button>
                      ) : (
                        <Badge status={app2?.status || 'PENDING'} />
                      )}
                    </div>
                  </td>

                  {/* 최종 상태 */}
                  <td style={{ padding: '8px 12px' }}>
                    <Badge status={doc.status || 'PENDING'} full />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
        </table>
      </div>

      {selectedDoc && (
        <DocumentDetailModal 
          document={selectedDoc} 
          onClose={() => setSelectedDoc(null)} 
        />
      )}
    </>
  );
}

function Badge({ status, full }: { status: string, full?: boolean }) {
  const colors = {
    APPROVED: { bg: 'rgba(16, 185, 129, 0.2)', text: 'var(--success)', label: full ? '결재 완료' : '승인' },
    PENDING: { bg: 'rgba(245, 158, 11, 0.2)', text: 'var(--pending)', label: full ? '결재 중' : '대기' },
    REJECTED: { bg: 'rgba(239, 68, 68, 0.2)', text: 'var(--danger)', label: full ? '반려됨' : '반려' },
  };
  const config = colors[status as keyof typeof colors] || colors.PENDING;

  return (
    <span style={{ 
      padding: '4px 10px', 
      borderRadius: '20px', 
      fontSize: '0.75rem',
      background: config.bg,
      color: config.text,
      fontWeight: '700',
      whiteSpace: 'nowrap'
    }}>
      {config.label}
    </span>
  );
}
