import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/lib/auth";
import Link from "next/link";
import UserNav from "@/components/layout/UserNav";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "UBMK 내부 결재 시스템",
  description: "울란바트루 엠케이스쿨 온라인 교무실 내부 결재 시스템",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
      </head>
      <body>
        <Providers>
          <nav className="glass-card" style={{ 
            margin: '10px 10px 20px 10px', 
            padding: '12px 20px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            position: 'sticky', 
            top: '10px', 
            zIndex: 100 
          }}>
            <Link href="/" style={{ fontSize: '1.2rem', fontWeight: 'bold', textDecoration: 'none', color: 'var(--primary)', whiteSpace: 'nowrap' }}>
              UBMK Approval
            </Link>
            <div>
              {session ? (
                <UserNav user={session.user as any} />
              ) : (
                <a href="/api/auth/signin" className="btn btn-primary">
                  Google 로그인
                </a>
              )}
            </div>
          </nav>
          <main className="container">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
