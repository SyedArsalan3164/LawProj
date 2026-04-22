'use client';
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, FileText, Zap } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const scoreColor = (pct) => {
  if (pct >= 75) return '#10b981';
  if (pct >= 50) return '#f59e0b';
  return '#ef4444';
};

const scoreLabel = (pct) => {
  if (pct >= 75) return 'Excellent Fit';
  if (pct >= 50) return 'Good Match';
  if (pct >= 30) return 'Possible Match';
  return 'Low Match';
};

const ScoreRing = ({ pct, size = 64 }) => {
  const deg = pct * 3.6;
  const inner = size - 16;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `conic-gradient(${scoreColor(pct)} ${deg}deg, #e2e8f0 0deg)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <div style={{
        width: inner, height: inner, borderRadius: '50%', background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: size < 70 ? '0.85rem' : '1rem', fontWeight: 800, color: scoreColor(pct) }}>
          {Math.round(pct)}%
        </span>
      </div>
    </div>
  );
};

const StudentProfileModal = ({ studentId, onClose, onVerify }) => {
  const [fullProfile, setFullProfile] = useState(null);
  const [aiRank, setAiRank]           = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    
    Promise.all([
      fetch(`${API}/api/candidates/student/${studentId}`).then(r => r.json()),
      fetch(`${API}/api/candidates/ai-rank/${studentId}`).then(r => r.json())
    ]).then(([profile, rank]) => {
      setFullProfile(profile);
      setAiRank(rank);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to fetch profile/rank', err);
      setLoading(false);
    });
  }, [studentId]);

  if (!studentId) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ maxWidth: 820, width: '100%', maxHeight: '90vh', overflow: 'auto', padding: 36, borderRadius: 20 }}
        onClick={e => e.stopPropagation()}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            Loading student profile…
          </div>
        ) : (
          <>
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <ScoreRing pct={aiRank?.matchPercentage || 0} size={80} />
                <div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: '1.3rem' }}>{fullProfile?.name}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {scoreLabel(aiRank?.matchPercentage || 0)} · {Math.round(aiRank?.matchPercentage || 0)}% AI Match
                  </div>
                  {aiRank?.identifiedCapabilities?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      {aiRank.identifiedCapabilities.map((c, i) => (
                        <span key={i} className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{c}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <div className="divider" style={{ marginBottom: 24 }} />

            {/* AI Reasoning */}
            <p className="section-label">AI Analysis</p>
            <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 16, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24, borderLeft: '3px solid var(--primary)' }}>
              {(aiRank?.aiReasoning || '').replace(/\*\*/g, '')}
            </div>

            {/* Resume + Profile */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <p className="section-label">Resume Content</p>
                <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 16, fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.65, maxHeight: 260, overflowY: 'auto' }}>
                  {fullProfile?.resumeText || 'No resume uploaded yet.'}
                </div>
                {fullProfile?.githubUrl && (
                  <div style={{ marginTop: 14 }}>
                    <p className="section-label">GitHub</p>
                    <a href={fullProfile.githubUrl} target="_blank" rel="noreferrer"
                      style={{ color: 'var(--primary)', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                      {fullProfile.githubUrl}
                    </a>
                  </div>
                )}
              </div>
              <div>
                <p className="section-label">Skills</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                  {fullProfile?.skills?.length > 0
                    ? fullProfile.skills.map((s, i) => <span key={i} className="badge badge-blue">{s}</span>)
                    : <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No skills listed</span>}
                </div>
                <p className="section-label">Projects</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 200, overflowY: 'auto' }}>
                  {fullProfile?.projects?.length > 0
                    ? fullProfile.projects.map((p, i) => (
                        <div key={i} style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 14px' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 3 }}>{p.title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.description}</div>
                        </div>
                      ))
                    : <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No projects listed</span>}
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 2, gap: 8 }}
                onClick={() => onVerify(studentId, 'VERIFIED')}
              >
                <CheckCircle size={16} /> Verify & Shortlist
              </button>
              <button
                className="btn"
                style={{ flex: 1, background: 'rgba(239,68,68,0.07)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)', gap: 6 }}
                onClick={() => onVerify(studentId, 'REJECTED')}
              >
                <XCircle size={14} /> Reject
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentProfileModal;
