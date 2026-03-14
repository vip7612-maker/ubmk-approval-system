"use client";

import { useState, useRef, useEffect } from "react";
import { createApprovalRequest } from "@/lib/actions/approval";
import { uploadFile } from "@/lib/actions/upload";
import { DEPARTMENTS } from "@/lib/db/presets";

interface FileInfo {
  name: string;
  url: string;
  source: "local" | "google_drive";
}

export default function ApprovalForm({ users, defaultLines }: { users: any[], defaultLines: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [department, setDepartment] = useState("");
  const [approver1, setApprover1] = useState("");
  const [approver2, setApprover2] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fill approvers based on department
  useEffect(() => {
    if (department) {
      const deptLines = defaultLines.filter(l => l.departmentId === department);
      const app1 = deptLines.find(l => l.order === 1);
      const app2 = deptLines.find(l => l.order === 2);
      if (app1) setApprover1(app1.approverId);
      if (app2) setApprover2(app2.approverId);
    }
  }, [department, defaultLines]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append("file", file);
        
        const url = await uploadFile(formData);
        if (url) {
          setFiles(prev => [...prev, { name: file.name, url, source: "local" }]);
        }
      }
    } catch (error) {
      console.error("FileUpload error:", error);
      alert("파일 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openGooglePicker = () => {
    // This requires Google Picker API script loaded and configured.
    // For now, we'll simulate the integration.
    alert("구글 드라이브 연동 기능은 Google Cloud Console에서 Picker API와 API Key가 설정되어야 작동합니다.\n현재는 안내 메시지로 대체하며, 추후 API 정보를 입력하면 연동이 완료됩니다.");
    
    // Example of what would happen after picker:
    // const driveFile = { name: "Manual.pdf", url: "https://drive.google.com/...", source: "google_drive" };
    // setFiles(prev => [...prev, driveFile]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("content", content);
      formData.set("departmentId", department);
      formData.set("approver1Id", approver1);
      formData.set("approver2Id", approver2);
      formData.set("files", JSON.stringify(files));

      const result = await createApprovalRequest(formData);
      if (result.success) {
        setDepartment("");
        setTitle("");
        setContent("");
        setApprover1("");
        setApprover2("");
        setFiles([]);
        alert("결재가 신청되었습니다.");
        window.location.reload();
      } else {
        alert("결재 신청 중 오류가 발생했습니다: " + result.error);
      }
    } catch (error: any) {
      console.error("HANDLESUBMIT_ERROR:", error);
      alert("시스템 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '30px', margin: '0 auto 40px auto' }}>
      <h2 style={{ marginBottom: '25px', fontSize: '1.5rem', fontWeight: '700' }}>📄 새 결재 신청</h2>
      <form onSubmit={handleSubmit} className="approval-form-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-inner-row">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '600', color: 'var(--text-muted)' }}>소속 부서</label>
              <select 
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)' }}
                required
              >
                <option value="" style={{ color: '#000' }}>부서 선택</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept} style={{ color: '#000' }}>{dept}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '600', color: 'var(--text-muted)' }}>제목</label>
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text" 
                placeholder="결재 문서 제목을 입력하세요"
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'inherit', fontSize: '1rem' }}
                required
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '600', color: 'var(--text-muted)' }}>내용</label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="상세 내용을 입력하세요"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'inherit', resize: 'vertical', fontSize: '1rem' }}
            />
          </div>
          
          <div style={{ marginTop: '10px' }}>
            <label style={{ fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>첨부 파일 ({files.length})</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
              {files.map((file, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', 
                  background: 'rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '0.85rem' 
                }}>
                  <span>{file.source === 'google_drive' ? '📁' : '📄'}</span>
                  <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                  <button type="button" onClick={() => removeFile(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="btn"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '8px' }}
                disabled={isUploading}
              >
                ➕ 파일 추가
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }} 
                  multiple 
                />
              </button>
              <button 
                type="button" 
                onClick={openGooglePicker}
                className="btn"
                style={{ background: 'rgba(66, 133, 244, 0.1)', border: '1px solid rgba(66, 133, 244, 0.3)', color: '#4285F4', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" alt="G" style={{ width: '16px' }} />
                구글 드라이브에서 첨부
              </button>
            </div>
            {isUploading && <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '8px' }}>업로드 중...</p>}
          </div>
        </div>

        <div className="form-sidebar">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '600', color: 'var(--text-muted)' }}>1차 결재자 (부장)</label>
            <select 
              value={approver1}
              onChange={(e) => setApprover1(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)' }}
              required
            >
              <option value="" style={{ color: '#000' }}>선택하세요</option>
              {users.map((u) => (
                <option key={u.id} value={u.id} style={{ color: '#000' }}>{u.name || u.email}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '600', color: 'var(--text-muted)' }}>2차 결재자 (교장)</label>
            <select 
              value={approver2}
              onChange={(e) => setApprover2(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)' }}
              required
            >
              <option value="" style={{ color: '#000' }}>선택하세요</option>
              {users.map((u) => (
                <option key={u.id} value={u.id} style={{ color: '#000' }}>{u.name || u.email}</option>
              ))}
            </select>
          </div>
          
          <div style={{ marginTop: '20px', padding: '15px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '5px' }}>💡 부서를 선택하면 해당 부서의 기본 결재자가 자동으로 지정됩니다.</p>
          </div>

          <button type="submit" disabled={isSubmitting || isUploading} className="btn btn-primary" style={{ marginTop: 'auto', justifyContent: 'center', height: '50px', fontSize: '1.1rem' }}>
            {isSubmitting ? "처리 중..." : "🚀 결재 올리기"}
          </button>
        </div>
      </form>
    </div>
  );
}
