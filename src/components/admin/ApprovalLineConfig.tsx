"use client";

import { useState, useEffect } from "react";
import { setDefaultApprovalLine, getDefaultApprovalLines } from "@/lib/actions/config";

interface User {
  id: string;
  name: string | null;
  role: string | null;
}

interface Department {
  id: string;
  name: string;
}

interface ApprovalLineConfigProps {
  departments: Department[];
  users: User[];
  initialConfigs: any[];
}

export default function ApprovalLineConfig({ departments, users, initialConfigs }: ApprovalLineConfigProps) {
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [approver1, setApprover1] = useState<string>("");
  const [approver2, setApprover2] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedDept) {
      const deptConfigs = initialConfigs.filter(c => c.departmentId === selectedDept);
      const app1 = deptConfigs.find(c => c.order === 1);
      const app2 = deptConfigs.find(c => c.order === 2);
      setApprover1(app1?.approverId || "");
      setApprover2(app2?.approverId || "");
    }
  }, [selectedDept, initialConfigs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept || !approver1 || !approver2) {
      alert("모든 항목을 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    const result = await setDefaultApprovalLine(selectedDept, approver1, approver2);
    if (result.success) {
      alert("기본 결재라인이 설정되었습니다.");
      window.location.reload();
    } else {
      alert("오류 발생: " + result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="glass-card" style={{ padding: '30px', marginTop: '30px' }}>
      <h2 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        ⚙️ 부서별 기본 결재라인 설정
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>부서 선택</label>
          <select 
            value={selectedDept} 
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(30,41,59,0.9)', color: '#fff' }}
          >
            <option value="">부서를 선택하세요</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>1차 결재자 (부장)</label>
          <select 
            value={approver1} 
            onChange={(e) => setApprover1(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(30,41,59,0.9)', color: '#fff' }}
          >
            <option value="">결재자 선택</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}({u.role})</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>2차 결재자 (관리위원)</label>
          <select 
            value={approver2} 
            onChange={(e) => setApprover2(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(30,41,59,0.9)', color: '#fff' }}
          >
            <option value="">결재자 선택</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}({u.role})</option>)}
          </select>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ padding: '10px 20px' }}>
          {isSubmitting ? "저장 중..." : "결재라인 저장"}
        </button>
      </form>

      <div style={{ marginTop: '30px' }}>
        <h3 style={{ fontSize: '0.9rem', marginBottom: '15px', color: 'var(--text-muted)' }}>현재 설정된 결재라인</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
          {departments.map(dept => {
            const configs = initialConfigs.filter(c => c.departmentId === dept.id).sort((a,b) => a.order - b.order);
            if (configs.length === 0) return null;
            return (
              <div key={dept.id} style={{ padding: '15px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
                <p style={{ fontWeight: '700', marginBottom: '10px', color: 'var(--primary)' }}>{dept.name}</p>
                <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {configs.map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{c.order}차 결재:</span>
                      <span style={{ fontWeight: '600' }}>{c.approver?.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
