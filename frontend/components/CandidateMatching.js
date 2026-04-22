'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Brain, UserCheck, X, RefreshCw, FileText, Zap, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import StudentProfileModal from './StudentProfileModal';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/* ── helpers ───────────────────────────────────────────────────── */
const scoreColor = (pct) => {
  if (pct >= 75) return '#10b981';
  if (pct >= 50) return '#f59e0b';
  return '#ef4444';
};

const scoreBg = (pct) => {
  if (pct >= 75) return 'rgba(16,185,129,0.08)';
  if (pct >= 50) return 'rgba(245,158,11,0.08)';
  return 'rgba(239,68,68,0.08)';
};

const scoreLabel = (pct) => {
  if (pct >= 75) return 'Excellent Fit';
  if (pct >= 50) return 'Good Match';
  if (pct >= 30) return 'Possible Match';
  return 'Low Match';
};

/* ── ScoreRing ─────────────────────────────────────────────────── */
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

/* ── Main component ─────────────────────────────────────────────── */
const CandidateMatching = ({ roleId }) => {
  const [candidates, setCandidates]         = useState([]);
  const [loading, setLoading]               = useState(true);
  const [refreshing, setRefreshing]         = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);  // full student profile
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const fetchCandidates = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const res  = await fetch(`${API}/api/candidates/match/${roleId}`);
      const data = await res.json();
      setCandidates(data);
    } catch (err) {
      console.error('Failed to fetch matches', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [roleId]);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  const openProfile = async (studentId, candidateData) => {
    setSelectedStudentId(studentId);
  };

  const verifyCandidate = async (studentId, status) => {
    await fetch(`${API}/api/candidates/verify/${studentId}?status=${status}`, { method: 'POST' });
    fetchCandidates(true);
    setSelectedStudentId(null);
  };

  /* ── Loading ─────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
        <Brain size={32} style={{ marginBottom: 14, opacity: 0.4 }} />
        <p style={{ fontWeight: 600 }}>AI is ranking the candidate pool…</p>
        <p style={{ fontSize: '0.83rem', marginTop: 6 }}>This analyses skills, resume text, and chat interactions.</p>
      </div>
    );
  }

  /* ── Empty ───────────────────────────────────────────────────── */
  if (!candidates.length) {
    return (
      <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
        <UserCheck size={32} style={{ marginBottom: 14, opacity: 0.35 }} />
        <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No candidates found</p>
        <p style={{ fontSize: '0.83rem', marginTop: 4 }}>Students need to apply or have interactions recorded.</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>
            AI-Ranked Candidates
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {candidates.length} candidates · scored across resume, chat quality & skills
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <span className="badge badge-blue" style={{ gap: 6 }}>
            <Brain size={12} /> AI Powered
          </span>
          <button
            className="btn btn-outline"
            style={{ padding: '8px 14px', fontSize: '0.82rem', gap: 6 }}
            onClick={() => fetchCandidates(true)}
            disabled={refreshing}
          >
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'Refreshing…' : 'Re-rank'}
          </button>
        </div>
      </div>

      {/* ── Candidate cards ────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {candidates.map((c, rank) => (
          <div
            key={c.studentId}
            className="card"
            style={{ padding: 24, transition: 'transform 0.2s, box-shadow 0.2s', borderLeft: `4px solid ${scoreColor(c.matchPercentage)}` }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              {/* Rank + Ring */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>#{rank + 1}</div>
                <ScoreRing pct={c.matchPercentage} size={72} />
                <div style={{
                  fontSize: '0.7rem', fontWeight: 700, color: scoreColor(c.matchPercentage),
                  background: scoreBg(c.matchPercentage), padding: '3px 8px', borderRadius: 20,
                }}>
                  {scoreLabel(c.matchPercentage)}
                </div>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: '1.05rem' }}>{c.studentName}</div>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                    background: c.verificationStatus === 'VERIFIED' ? 'rgba(16,185,129,0.1)' : c.verificationStatus === 'REJECTED' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                    color:       c.verificationStatus === 'VERIFIED' ? '#10b981' : c.verificationStatus === 'REJECTED' ? '#ef4444' : '#f59e0b',
                  }}>
                    {c.verificationStatus}
                  </span>
                </div>

                {/* Capability tags */}
                {c.identifiedCapabilities?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {c.identifiedCapabilities.map((cap, i) => (
                      <span key={i} className="badge badge-blue" style={{ fontSize: '0.72rem', gap: 5 }}>
                        <Zap size={10} /> {cap}
                      </span>
                    ))}
                  </div>
                )}

                {/* AI Reasoning */}
                <div style={{
                  background: 'var(--bg)', borderRadius: 8, padding: '10px 14px',
                  fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6,
                  borderLeft: '3px solid var(--primary-border)', marginBottom: 14,
                }}>
                  {c.aiReasoning?.replace(/\*\*/g, '')}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: '0.83rem', padding: '8px 16px', gap: 6 }}
                    onClick={() => openProfile(c.studentId, c)}
                  >
                    <FileText size={14} /> View Full Profile
                  </button>
                  {c.verificationStatus === 'PENDING' && (
                    <>
                      <button
                        className="btn"
                        style={{ fontSize: '0.83rem', padding: '8px 16px', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', gap: 6 }}
                        onClick={() => verifyCandidate(c.studentId, 'VERIFIED')}
                      >
                        <CheckCircle size={14} /> Verify
                      </button>
                      <button
                        className="btn"
                        style={{ fontSize: '0.83rem', padding: '8px 16px', background: 'rgba(239,68,68,0.05)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', gap: 6 }}
                        onClick={() => verifyCandidate(c.studentId, 'REJECTED')}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Modal */}
      {selectedStudentId && (
        <StudentProfileModal 
          studentId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
          onVerify={verifyCandidate}
        />
      )}

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default CandidateMatching;
