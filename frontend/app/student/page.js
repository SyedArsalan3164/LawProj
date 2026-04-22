'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Briefcase, Send, MessageSquare, Brain, CheckCircle, FileText, AlertCircle, Loader } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Navbar from '@/components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/* ─── Student page ──────────────────────────────────────────── */
const StudentPage = () => {
  const router = useRouter();
  const [studentId, setStudentId]         = useState(null);
  const [student, setStudent]             = useState(null);
  const [loading, setLoading]             = useState(true);
  const [mentors, setMentors]             = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [chatHistory, setChatHistory]     = useState([]);
  const [newMessage, setNewMessage]       = useState('');
  const [stompClient, setStompClient]     = useState(null);

  // Resume upload state
  const [resumeFile, setResumeFile]       = useState(null);
  const [uploading, setUploading]         = useState(false);
  const [uploadResult, setUploadResult]   = useState(null); // {matchPercentage, capabilities, reasoning, wordCount}
  const [dragOver, setDragOver]           = useState(false);

  // AI rank state
  const [aiResult, setAiResult]           = useState(null);
  const [ranking, setRanking]             = useState(false);

  const selectedMentorIdRef = useRef(null);
  const chatEndRef          = useRef(null);
  const fileInputRef        = useRef(null);

  useEffect(() => { selectedMentorIdRef.current = selectedMentor?.id; }, [selectedMentor]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  useEffect(() => {
    const storedId = localStorage.getItem('studentId');
    if (!storedId) {
      router.push('/student/login');
      return;
    }
    setStudentId(storedId);

    fetch(`${API}/api/candidates/student/${storedId}`)
      .then(r => r.json())
      .then(d => { setStudent(d); setLoading(false); })
      .catch(e => {
        console.error(e);
        router.push('/student/login');
      });

    fetch(`${API}/api/employees`)
      .then(r => r.json())
      .then(setMentors);

    const socket = new SockJS(`${API}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe(`/topic/messages/STUDENT_${storedId}`, message => {
          const msg    = JSON.parse(message.body);
          const peerId = `EMPLOYEE_${selectedMentorIdRef.current}`;
          if (msg.senderId === peerId || msg.receiverId === peerId) {
            setChatHistory(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
          }
        });
      },
    });
    client.activate();
    setStompClient(client);
    return () => client.deactivate();
  }, [router]);

  const fetchChat = async (mentorId) => {
    if (!studentId) return;
    const res  = await fetch(`${API}/api/chat/history?id1=STUDENT_${studentId}&id2=EMPLOYEE_${mentorId}`);
    const data = await res.json();
    setChatHistory(data);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedMentor || !stompClient || !studentId) return;
    stompClient.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({
        senderId:   `STUDENT_${studentId}`,
        receiverId: `EMPLOYEE_${selectedMentor.id}`,
        content:    newMessage.trim(),
        companyId:  selectedMentor.companyId,
      }),
    });
    setNewMessage('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  /* ── Resume Upload ─────────────────────────────────────────── */
  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a PDF file.');
      return;
    }
    setResumeFile(file);
  }, []);

  const uploadResume = async () => {
    if (!resumeFile) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const form = new FormData();
      form.append('file', resumeFile);
      const res  = await fetch(`${API}/api/candidates/student/upload-resume/${studentId}`, { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok) {
        setUploadResult(data);
        setAiResult(null); // clear old rank, the new one is embedded in upload result
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (e) {
      alert('Upload failed: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  /* ── Manual AI Rank ────────────────────────────────────────── */
  const runAiRank = async () => {
    if (!studentId) return;
    setRanking(true);
    setAiResult(null);
    try {
      const res  = await fetch(`${API}/api/candidates/ai-rank/${studentId}`);
      const data = await res.json();
      setAiResult(data);
    } catch (e) {
      alert('AI ranking failed: ' + e.message);
    } finally {
      setRanking(false);
    }
  };

  /* ── Score colour helper ─────────────────────────────────────── */
  const scoreColor = (pct) => {
    if (pct >= 75) return '#10b981';
    if (pct >= 50) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-muted)' }}>
        Loading student portal…
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('studentId');
    router.push('/student/login');
  };

  const activeResult = uploadResult || aiResult;

  return (
    <div className="page-wrapper">
      {/* Gradient header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 240,
        background: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 100%)',
        clipPath: 'polygon(0 0, 100% 0, 100% 78%, 0 100%)',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar theme="dark" />

        <div className="page-body animate-in" style={{ paddingTop: 24 }}>
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1>Student Hub</h1>
              <p>Upload your resume, chat with mentors, and get AI-ranked for open roles.</p>
            </div>
            <button className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }} onClick={handleLogout}>
              Log Out
            </button>
          </div>

          <div className="two-col-layout">
            {/* ── LEFT SIDEBAR ────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Profile card */}
              <div className="card" style={{ padding: 24 }}>
                <div style={{ textAlign: 'center', paddingBottom: 20, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
                  <div className="avatar-lg" style={{ margin: '0 auto 14px', width: 72, height: 72, fontSize: '1.75rem' }}>
                    {student?.name?.[0]}
                  </div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: '1.05rem', marginBottom: 6 }}>{student?.name}</div>
                  <span className="badge badge-green">{student?.verificationStatus || 'Verified'}</span>
                </div>

                {/* ── PDF Upload ──────────────────── */}
                <p className="section-label">Resume (PDF)</p>

                {/* Drop zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                  style={{
                    border: `2px dashed ${dragOver ? 'var(--primary)' : resumeFile ? '#10b981' : 'var(--border-strong)'}`,
                    borderRadius: 10, padding: '20px 16px', textAlign: 'center',
                    background: dragOver ? 'var(--primary-light)' : resumeFile ? 'rgba(16,185,129,0.05)' : 'var(--bg)',
                    cursor: 'pointer', transition: 'all 0.15s', marginBottom: 10,
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    style={{ display: 'none' }}
                    onChange={e => handleFile(e.target.files[0])}
                  />
                  {resumeFile ? (
                    <>
                      <FileText size={22} color="#10b981" style={{ marginBottom: 6 }} />
                      <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#10b981' }}>{resumeFile.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to replace</p>
                    </>
                  ) : (
                    <>
                      <Upload size={22} style={{ marginBottom: 6, color: 'var(--text-muted)' }} />
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Drag & drop or <span style={{ color: 'var(--primary)', fontWeight: 600 }}>browse</span>
                      </p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>PDF files only</p>
                    </>
                  )}
                </div>

                {resumeFile && (
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginBottom: 10 }}
                    onClick={uploadResume}
                    disabled={uploading}
                  >
                    {uploading ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Analysing…</> : <><Brain size={15} /> Upload & Analyse Resume</>}
                  </button>
                )}

                {/* ── Run AI Rank button ──── */}
                <button
                  className="btn"
                  style={{ width: '100%', background: '#0f172a', color: '#fff', gap: 8, marginTop: 4 }}
                  onClick={runAiRank}
                  disabled={ranking}
                >
                  {ranking ? <><Loader size={15} /> Computing…</> : <><Brain size={15} /> Run AI Match Score</>}
                </button>
              </div>

              {/* ── AI Result panel ──────── */}
              {activeResult && (
                <div className="card" style={{ padding: 22 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <Brain size={18} color="var(--primary)" />
                    <span style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: '0.95rem' }}>AI Match Result</span>
                  </div>

                  {/* Score ring */}
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <div style={{
                      width: 90, height: 90, borderRadius: '50%', margin: '0 auto 10px',
                      background: `conic-gradient(${scoreColor(activeResult.matchPercentage)} ${activeResult.matchPercentage * 3.6}deg, #e2e8f0 0deg)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: '1.2rem', color: scoreColor(activeResult.matchPercentage) }}>
                          {Math.round(activeResult.matchPercentage)}%
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {activeResult.matchPercentage >= 75 ? '🟢 Excellent match' : activeResult.matchPercentage >= 50 ? '🟡 Good match' : '🔴 Needs improvement'}
                    </p>
                  </div>

                  {/* Capabilities */}
                  {(activeResult.capabilities || activeResult.identifiedCapabilities)?.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <p className="section-label">Identified Strengths</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {(activeResult.capabilities || activeResult.identifiedCapabilities).map((c, i) => (
                          <span key={i} className="badge badge-blue" style={{ fontSize: '0.72rem' }}>{c}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reasoning */}
                  <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 12, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {(activeResult.reasoning || activeResult.aiReasoning || '').replace(/\*\*/g, '')}
                  </div>

                  {activeResult.wordCount && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 10 }}>
                      <FileText size={12} style={{ marginRight: 4 }} />
                      Resume: {activeResult.wordCount} words parsed
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ── RIGHT: MENTORS + CHAT ────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Mentor grid */}
              <div className="card" style={{ padding: 28 }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: '1rem' }}>Industry Mentors</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{mentors.length} available — click to open a chat</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                  {mentors.map(m => (
                    <button
                      key={m.id}
                      onClick={() => { setSelectedMentor(m); fetchChat(m.id); }}
                      style={{
                        display: 'flex', flexDirection: 'column', gap: 10,
                        padding: 16, borderRadius: 12, border: '1px solid',
                        borderColor: selectedMentor?.id === m.id ? 'var(--primary)' : 'var(--border)',
                        background:  selectedMentor?.id === m.id ? 'var(--primary-light)' : 'var(--bg)',
                        cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                      }}
                    >
                      <div className="avatar-md">{m.name[0]}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 2 }}>{m.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {m.jobTitle}<br />@ {m.companyName}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat panel */}
              <div className="card" style={{ padding: 28 }}>
                {selectedMentor ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                      <div className="avatar-md">{selectedMentor.name[0]}</div>
                      <div>
                        <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700 }}>{selectedMentor.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedMentor.jobTitle} @ {selectedMentor.companyName}</div>
                      </div>
                      <span className="badge badge-green" style={{ marginLeft: 'auto' }}>● Live</span>
                    </div>

                    <div className="chat-area">
                      {chatHistory.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0', flex: 1 }}>
                          <MessageSquare size={28} style={{ marginBottom: 8, opacity: 0.3 }} />
                          <p style={{ fontSize: '0.85rem' }}>Start a conversation — your chats feed into the AI ranking engine.</p>
                        </div>
                      ) : chatHistory.map((msg, i) => (
                        <div key={i} className={msg.senderId === `STUDENT_${studentId}` ? 'msg-sent' : 'msg-received'}>
                          {msg.content}
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                      <input
                        className="input"
                        placeholder="Type a message… (Enter to send)"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={handleKey}
                      />
                      <button className="btn btn-primary" style={{ padding: '10px 18px', flexShrink: 0 }} onClick={sendMessage}>
                        <Send size={16} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '48px 0' }}>
                    <MessageSquare size={36} style={{ marginBottom: 12, opacity: 0.25 }} />
                    <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>No mentor selected</p>
                    <p style={{ fontSize: '0.85rem' }}>Pick a mentor above to start chatting. Richer chats → higher AI score.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default StudentPage;
