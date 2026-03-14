"use client";

import { handleSignOut } from "@/lib/actions/auth";
import Link from "next/link";

interface UserNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

export default function UserNav({ user }: UserNavProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      <div style={{ textAlign: 'right', display: 'var(--display-user-info, block)' }}>
        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.name}</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.email}</div>
      </div>
      
      {/* EMERGENCY FALLBACK: If role is ADMIN or email is vip7612@gmail.com */}
      {(user.role === "ADMIN" || user.email === "vip7612@gmail.com") && (
        <Link href="/admin" className="btn" style={{ background: 'var(--primary)', color: '#fff', padding: '8px 15px', fontSize: '0.85rem', fontWeight: 'bold', zIndex: 1000 }}>
          ⚙️ 관리센터
        </Link>
      )}
      
      <button 
        onClick={async () => {
          console.log("LOGOUT_CLICKED");
          // 1. Clear all cookies manually
          document.cookie.split(";").forEach((c) => {
            document.cookie = c
              .replace(/^ +/, "")
              .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });
          // 2. Clear storage
          localStorage.clear();
          sessionStorage.clear();
          // 3. Force sign out via API
          window.location.href = "/api/auth/signout?callbackUrl=/";
        }}
        className="btn" 
        style={{ 
          background: 'var(--glass-border)', 
          color: 'var(--text-main)', 
          padding: '8px 15px', 
          cursor: 'pointer',
          zIndex: 1000,
          position: 'relative'
        }}
      >
        로그아웃
      </button>
    </div>
  );
}
