'use client';
import React from 'react';
import { MessageSquare, User, Clock, ChevronRight, Zap } from 'lucide-react';

const RecentActivity = ({ activities, onViewProfile }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        <Clock size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
        <p style={{ fontSize: '0.875rem' }}>No recent activity yet.</p>
      </div>
    );
  }

  const formatTime = (ts) => {
    if (!ts) return 'Just now';
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStudentId = (activity) => {
    const { senderId, receiverId } = activity.interaction;
    if (senderId.startsWith('STUDENT_')) return senderId.replace('STUDENT_', '');
    if (receiverId.startsWith('STUDENT_')) return receiverId.replace('STUDENT_', '');
    return null;
  };

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Zap size={18} color="var(--primary)" fill="var(--primary)" />
        <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: '1rem' }}>Live Activity</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {activities.map((act, i) => {
          const studentId = getStudentId(act);
          return (
            <div 
              key={i} 
              style={{ 
                display: 'flex', gap: 14, padding: 14, borderRadius: 12, 
                background: 'var(--bg)', border: '1px solid var(--border)',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ 
                width: 40, height: 40, borderRadius: 10, background: 'var(--surface)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                border: '1px solid var(--border)'
              }}>
                <MessageSquare size={18} color="var(--primary)" />
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {act.studentName}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Started a conversation with <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{act.employeeName}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatTime(act.interaction.timestamp)}</span>
                <button 
                  onClick={() => studentId && onViewProfile(studentId)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: 4, 
                    fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600,
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0
                  }}
                >
                  View Profile <ChevronRight size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
