"use client";

import { useState } from "react";
import { updateUser } from "@/lib/actions/user";

interface User {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  subject: string | null;
  title: string | null;
  role: string | null;
  departmentId: string | null;
}

interface UserManagementProps {
  users: User[];
  departments: { id: string, name: string }[];
}

export default function UserManagement({ users: initialUsers, departments }: UserManagementProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const updateData = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      subject: formData.get("subject") as string,
      title: formData.get("title") as string,
      departmentId: formData.get("departmentId") as string,
      role: formData.get("role") as any,
    };

    const result = await updateUser(editingUser.id, updateData);
    if (result.success) {
      alert("사용자 정보가 업데이트되었습니다.");
      setEditingUser(null);
      window.location.reload(); // Refresh to see updated data
    } else {
      alert("오류 발생: " + result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="glass-card" style={{ padding: '30px' }}>
      <h2 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        👥 교직원 명단 관리
      </h2>
      
      <div className="table-wrapper">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
              <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>성명</th>
              <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>이메일</th>
              <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>부서</th>
              <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>직함/과목</th>
              <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>연락처</th>
              <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>권한</th>
              <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {initialUsers.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '12px', fontWeight: '600' }}>{user.name || "미설정"}</td>
                <td style={{ padding: '12px', fontSize: '0.9rem' }}>{user.email}</td>
                <td style={{ padding: '12px', fontSize: '0.9rem' }}>
                  {departments.find(d => d.id === user.departmentId)?.name || "-"}
                </td>
                <td style={{ padding: '12px', fontSize: '0.9rem' }}>
                  {user.title || user.subject ? `${user.title || ""} (${user.subject || ""})` : "-"}
                </td>
                <td style={{ padding: '12px', fontSize: '0.9rem' }}>{user.phone || "-"}</td>
                <td style={{ padding: '12px' }}>
                   <span style={{ 
                     padding: '2px 8px', 
                     borderRadius: '4px', 
                     fontSize: '0.7rem', 
                     background: user.role === 'ADMIN' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255,255,255,0.1)',
                     color: user.role === 'ADMIN' ? 'var(--primary)' : 'inherit'
                   }}>
                     {user.role}
                   </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <button onClick={() => handleEdit(user)} className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'var(--glass-border)' }}>
                    수정
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '90%', padding: '30px' }}>
            <h3 style={{ marginBottom: '20px' }}>교직원 정보 수정</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>성명</label>
                  <input name="name" defaultValue={editingUser.name || ""} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'inherit' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>연락처</label>
                  <input name="phone" defaultValue={editingUser.phone || ""} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'inherit' }} />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>직함 (예: 교사, 부장)</label>
                  <input name="title" defaultValue={editingUser.title || ""} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'inherit' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>담당 과목</label>
                  <input name="subject" defaultValue={editingUser.subject || ""} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'inherit' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>부서</label>
                <select name="departmentId" defaultValue={editingUser.departmentId || ""} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'rgba(30,41,59,0.9)', color: '#fff' }}>
                  <option value="">부서 미지정</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>시스템 권한</label>
                <select name="role" defaultValue={editingUser.role || "USER"} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'rgba(30,41,59,0.9)', color: '#fff' }}>
                  <option value="USER">USER (일반 교사)</option>
                  <option value="MANAGER">MANAGER (부서 관리자)</option>
                  <option value="ADMIN">ADMIN (전체 관리자)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                  {isSubmitting ? "저장 중..." : "정보 수정 완료"}
                </button>
                <button type="button" onClick={() => setEditingUser(null)} className="btn" style={{ flex: 1, justifyContent: 'center', background: 'var(--glass-border)' }}>
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
