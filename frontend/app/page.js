'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ArrowRight, Brain, Zap, ShieldCheck } from 'lucide-react';

const cards = [
  { icon: '', title: 'Student Hub',       desc: 'Upload resume, chat with mentors, get AI-ranked',   href: '/student/login',           accent: '#4f46e5' },
  { icon: '', title: 'Employee Portal',   desc: 'Assess candidates & feed the AI ranking engine',    href: '/employee',           accent: '#ec4899' },
  { icon: '', title: 'Company Dashboard', desc: 'AI-powered analytics & ranked candidate pipeline',  href: '/company/dashboard',  accent: '#10b981' },
];

const features = [
  { icon: <Brain size={22} color="#4f46e5" />, title: 'AI Resume Analysis', desc: 'Our AI parses your PDF resume and extracts skills, experience, and capabilities.' },
  { icon: <Zap   size={22} color="#ec4899" />, title: 'Chat-Informed Ranking', desc: 'Real chat conversations are analyzed alongside your resume to compute a live match score.' },
  { icon: <ShieldCheck size={22} color="#10b981" />, title: 'Verified Profiles', desc: 'Every candidate goes through a verification pipeline before being surfaced to recruiters.' },
];

export default function Home() {
  return (
    <div className="page-wrapper">
      {/* Hero gradient */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 420,
        background: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 50%, #3b82f6 100%)',
        clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 100%)',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar theme="dark" />

        <div className="page-body" style={{ paddingTop: 32 }}>

          {/* ── Hero ──────────────────────────────── */}
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 64px' }}>
            <span style={{
              display: 'inline-block', background: 'rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.9)', fontSize: '0.78rem', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '5px 14px', borderRadius: 20, marginBottom: 22,
            }}>
              AI-Powered Recruitment Platform
            </span>
            <h1 style={{ fontSize: '3.2rem', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 18 }}>
              Match the Right Talent<br />to the Right Role
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, marginBottom: 36 }}>
              Upload your resume, connect with industry mentors, and let our AI engine rank your candidacy — all in real time.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/student/login" className="btn btn-primary" style={{ padding: '13px 30px', fontSize: '0.95rem', background: '#fff', color: '#4f46e5', borderRadius: 10 }}>
                Get Started as Student
              </Link>
              <Link href="/company/dashboard" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 28px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.3)',
                color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', fontWeight: 600,
              }}>
                Company Dashboard <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* ── Portal cards ─────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 56 }}>
            {cards.map(({ icon, title, desc, href, accent }) => (
              <Link key={href} href={href} style={{ display: 'block' }}>
                <div
                  className="card"
                  style={{ padding: '28px 24px', cursor: 'pointer', borderTop: `3px solid ${accent}`, transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--shadow-xl)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: 14 }}>{icon}</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>{title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: 16 }}>{desc}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: accent, fontWeight: 600, fontSize: '0.85rem' }}>
                    Open portal <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* ── Feature strip ─────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {features.map(({ icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ padding: 12, background: 'var(--surface)', borderRadius: 12, boxShadow: 'var(--shadow-sm)', flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
