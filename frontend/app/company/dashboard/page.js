'use client';
import React, { useState, useEffect } from 'react';
import { Users, BarChart3, TrendingUp, Bookmark, Eye, FileOutput, LayoutDashboard, Settings, Bell, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AIInsights from '@/components/AIInsights';
import CandidateMatching from '@/components/CandidateMatching';
import RecentActivity from '@/components/RecentActivity';
import StudentProfileModal from '@/components/StudentProfileModal';
import Navbar from '@/components/Navbar';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const TABS = [
  { icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
  { icon: <Users size={16} />,          label: 'Candidates' },
  { icon: <BarChart3 size={16} />,      label: 'Analytics' },
  { icon: <Settings size={16} />,       label: 'Settings' },
];

const FALLBACK = {
  totalViews: 1240, totalApplications: 86, totalBookmarks: 215,
  interactionsByDate: { Mon: 120, Tue: 150, Wed: 110, Thu: 190, Fri: 130, Sat: 80, Sun: 60 },
  aiInsight: 'Connect with more students to see AI insights.',
};

const Dashboard = () => {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [activities, setActivities] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/analytics/company/comp-1`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setData(FALLBACK); setLoading(false); });

    fetch(`${API_URL}/api/analytics/company/comp-1/recent`)
      .then(r => r.json())
      .then(setActivities)
      .catch(console.error);

    const socket = new SockJS(`${API_URL}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe('/topic/company/comp-1/activity', message => {
          const activity = JSON.parse(message.body);
          setActivities(prev => {
            const exists = prev.some(a => a.interaction.id === activity.interaction.id);
            if (exists) return prev;
            return [activity, ...prev].slice(0, 10);
          });
        });
      },
    });
    client.activate();
    return () => client.deactivate();
  }, []);

  const stats = data ? [
    { icon: <Eye size={20} color="#4f46e5" />, iconBg: '#eef2ff', label: 'Total Views',   value: data.totalViews,         delta: '+12%' },
    { icon: <FileOutput size={20} color="#ec4899" />, iconBg: '#fdf2f8', label: 'Applications', value: data.totalApplications,  delta: '+5%'  },
    { icon: <Bookmark size={20} color="#3b82f6" />,   iconBg: '#eff6ff', label: 'Bookmarks',    value: data.totalBookmarks,    delta: '+8%'  },
    { icon: <TrendingUp size={20} color="#10b981" />, iconBg: '#ecfdf5', label: 'Engagement',   value: '7.4%',                  delta: '+2%'  },
  ] : [];

  const chartData = data
    ? Object.entries(data.interactionsByDate || {}).map(([date, views]) => ({ date, views }))
    : [];

  return (
    <div className="page-wrapper">
      {/* Gradient header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 220,
        background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
        clipPath: 'polygon(0 0, 100% 0, 100% 78%, 0 100%)',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar theme="dark" />

        <div className="page-body animate-in" style={{ paddingTop: 24 }}>
          {/* Page header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div className="page-header" style={{ marginBottom: 0 }}>
              <h1>Company Dashboard</h1>
              <p>Strategic insights and AI-powered candidate analytics.</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.85)' }}>
                <Bell size={16} />
              </button>
              <button className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.85)', gap: 8 }}>
                <Download size={16} /> Export
              </button>
            </div>
          </div>

          {/* Tab bar */}
          <div className="card" style={{ display: 'flex', gap: 4, padding: 6, marginBottom: 28 }}>
            {TABS.map(({ icon, label }) => (
              <button
                key={label}
                onClick={() => setActiveTab(label)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 18px', borderRadius: 8, border: 'none',
                  background: activeTab === label ? 'var(--primary)' : 'transparent',
                  color:      activeTab === label ? '#fff' : 'var(--text-secondary)',
                  fontWeight: activeTab === label ? 600 : 500,
                  fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading dashboard data…
            </div>
          ) : (
            <div className="animate-in">
              {/* ── Dashboard tab ──────────────────────────── */}
              {activeTab === 'Dashboard' && (
                <>
                  {/* Stat cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
                    {stats.map((s, i) => (
                      <div key={i} className="card stat-card">
                        <div className="stat-icon" style={{ background: s.iconBg }}>{s.icon}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <span style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{s.value}</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--success)' }}>{s.delta}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chart + AI */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div className="card" style={{ padding: 28 }}>
                      <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, marginBottom: 4 }}>Interaction Trends</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 24 }}>Views over the past 7 days</div>
                      <div style={{ height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%"   stopColor="#4f46e5" stopOpacity={0.18} />
                                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', fontSize: 13 }} />
                            <Area type="monotone" dataKey="views" stroke="#4f46e5" strokeWidth={2} fill="url(#areaGrad)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <AIInsights insight={data.aiInsight} />
                  </div>

                  {/* Recent Activity section */}
                  <div style={{ marginTop: 24 }}>
                    <RecentActivity 
                      activities={activities} 
                      onViewProfile={(id) => setSelectedStudentId(id)} 
                    />
                  </div>
                </>
              )}

              {/* ── Candidates tab ─────────────────────────── */}
              {activeTab === 'Candidates' && <CandidateMatching roleId={1} />}

              {/* ── Analytics tab ──────────────────────────── */}
              {activeTab === 'Analytics' && (
                <div className="card" style={{ padding: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)', textAlign: 'center' }}>
                  <BarChart3 size={40} style={{ marginBottom: 14, opacity: 0.3 }} />
                  <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Detailed Analytics</p>
                  <p style={{ fontSize: '0.875rem' }}>Coming soon — advanced filtering, cohort analysis, and more.</p>
                </div>
              )}

              {/* ── Settings tab ───────────────────────────── */}
              {activeTab === 'Settings' && (
                <div className="card" style={{ padding: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)', textAlign: 'center' }}>
                  <Settings size={40} style={{ marginBottom: 14, opacity: 0.3 }} />
                  <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Settings</p>
                  <p style={{ fontSize: '0.875rem' }}>Company configuration options coming soon.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Student Profile Modal */}
      {selectedStudentId && (
        <StudentProfileModal 
          studentId={selectedStudentId} 
          onClose={() => setSelectedStudentId(null)}
          onVerify={async (id, status) => {
            await fetch(`${API_URL}/api/candidates/verify/${id}?status=${status}`, { method: 'POST' });
            setSelectedStudentId(null);
            // Refresh counts if needed
            fetch(`${API_URL}/api/analytics/company/comp-1`).then(r => r.json()).then(setData);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
