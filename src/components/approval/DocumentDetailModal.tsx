"use client";

import { useState } from "react";

interface Approval {
  id: string;
  status: string;
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
  fileUrl?: string | null; // Old field for backward compatibility
  files: string | null; // New field as JSON string
  status: string | null;
  author: {
    name: string | null;
    email: string;
  };
  approvals: Approval[];
}

interface FileInfo {
  name: string;
  url: string;
  source: "local" | "google_drive";
}

export default function DocumentDetailModal({ 
  document, 
  onClose 
}: { 
  document: Document; 
  onClose: () => void 
}) {
  let filesList: FileInfo[] = [];
  try {
    if (document.files) {
      filesList = JSON.parse(document.files);
    } else if (document.fileUrl) {
      // Compatibility with old data
      filesList = [{ name: "첨부파일", url: document.fileUrl, source: "local" }];
    }
  } catch (e) {
    console.error("FILES_PARSE_ERROR:", e);
  }
  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-card modal-content" onClick={e => e.stopPropagation()} style={{
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '40px',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: '1.5rem',
          cursor: 'pointer'
        }}>✕</button>

        <div style={{ marginBottom: '30px' }}>
          <span style={{ 
            padding: '5px 12px', 
            borderRadius: '20px', 
            fontSize: '0.8rem', 
            background: 'rgba(255,255,255,0.1)',
            marginBottom: '15px',
            display: 'inline-block'
          }}>
            {new Date(document.createdAt!).toLocaleDateString()}
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px' }}>{document.title}</h2>
          <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)' }}>
            <span>기안자: <strong>{document.author.name}</strong></span>
            <span>|</span>
            <span>상태: <strong>{document.status}</strong></span>
          </div>
        </div>

        <div style={{ 
          background: 'rgba(255,255,255,0.03)', 
          padding: '25px', 
          borderRadius: '15px', 
          marginBottom: '30px',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap'
        }}>
          {document.content || "내용이 없습니다."}
        </div>

        {filesList.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '1rem' }}>첨부파일 ({filesList.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filesList.map((file, idx) => (
                <div key={idx} style={{ 
                  padding: '15px', 
                  borderRadius: '12px', 
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255,255,255,0.02)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{file.source === 'google_drive' ? '📁' : '📄'}</span>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{file.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {file.source === 'google_drive' ? 'Google Drive' : '내부 스토리지'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => window.open(file.url, '_blank', 'width=800,height=1000')} 
                    className="btn btn-secondary"
                    style={{ padding: '6px 15px', fontSize: '0.8rem' }}
                  >
                    보기
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 style={{ marginBottom: '15px', fontSize: '1rem' }}>결재선 현황</h3>
          <div style={{ display: 'flex', gap: '20px' }}>
            {document.approvals.sort((a,b) => a.order - b.order).map((app, idx) => (
              <div key={app.id} style={{ 
                flex: 1, 
                padding: '15px', 
                borderRadius: '12px', 
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>{idx + 1}차 결재</p>
                <p style={{ fontWeight: '700', marginBottom: '8px' }}>{app.approver.name}</p>
                <span style={{ 
                  fontSize: '0.75rem', 
                  padding: '2px 8px', 
                  borderRadius: '10px',
                  background: app.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: app.status === 'APPROVED' ? 'var(--success)' : 'var(--pending)'
                }}>
                  {app.status === 'APPROVED' ? '승인' : '대기'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
