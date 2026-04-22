'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, MessageSquare, Star, Send, UserCheck, ChevronRight } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Navbar from '@/components/Navbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/* ─── Employee page ─────────────────────────────────────────── */
const EmployeePage = () => {
  const [students, setStudents]               = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [chatHistory, setChatHistory]         = useState([]);
  const [newMessage, setNewMessage]           = useState('');
  const [feedback, setFeedback]               = useState('');
  const [stompClient, setStompClient]         = useState(null);
  const selectedStudentIdRef                  = useRef(null);
  const chatEndRef                            = useRef(null);

  useEffect(() => { selectedStudentIdRef.current = selectedStudent?.id; }, [selectedStudent]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  useEffect(() => {
    fetch(`${API_URL}/api/candidates/students`)
      .then(r => r.json())
      .then(setStudents)
      .catch(console.error);

    const socket = new SockJS(`${API_URL}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe('/topic/messages/EMPLOYEE_1', message => {
          const msg = JSON.parse(message.body);
          const peerId = `STUDENT_${selectedStudentIdRef.current}`;
          if (msg.senderId === peerId || msg.receiverId === peerId) {
            setChatHistory(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
          }
        });
      },
    });
    client.activate();
    setStompClient(client);
    return () => client.deactivate();
  }, []);

  const fetchChat = async (studentId) => {
    const res  = await fetch(`${API_URL}/api/chat/history?id1=EMPLOYEE_1&id2=STUDENT_${studentId}`);
    const data = await res.json();
    setChatHistory(data);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedStudent || !stompClient) return;
    stompClient.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({
        senderId:   'EMPLOYEE_1',
        receiverId: `STUDENT_${selectedStudent.id}`,
        content:    newMessage.trim(),
        companyId:  'comp-1',
      }),
    });
    setNewMessage('');
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const submitFeedback = async () => {
    if (!selectedStudent || !feedback.trim()) return;
    await fetch(`${API_URL}/api/analytics/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId:   'EMPLOYEE_1',
        receiverId: `STUDENT_${selectedStudent.id}`,
        companyId:  'comp-1',
        type:       'FEEDBACK',
        content:    feedback.trim(),
      }),
    });
    setFeedback('');
    alert('Recommendation sent to Recruiter!');
  };

  return (
    <div className="page-wrapper">
      {/* Gradient header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 240,
        background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
        clipPath: 'polygon(0 0, 100% 0, 100% 78%, 0 100%)',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar theme="dark" />

        <div className="page-body animate-in" style={{ paddingTop: 24 }}>
          <div className="page-header">
            <h1>Candidates</h1>
            <p>Review talent and submit professional assessments to the AI ranking engine.</p>
          </div>

          <div className="two-col-layout">
            {/* ── Sidebar: Candidate List ─────────────────────── */}
            <div>
              <div className="card" style={{ padding: 20 }}>
                {/* Search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg)', borderRadius: 8, padding: '8px 14px', marginBottom: 16 }}>
                  <Search size={16} color="var(--text-muted)" />
                  <input
                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: 'var(--text-primary)' }}
                    placeholder="Search candidates…"
                  />
                </div>

                <p className="section-label">All Candidates ({students.length})</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {students.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedStudent(s); fetchChat(s.id); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px', borderRadius: 10, border: 'none',
                        background: selectedStudent?.id === s.id ? 'var(--primary-light)' : 'transparent',
                        cursor: 'pointer', textAlign: 'left', width: '100%',
                        transition: 'background 0.15s',
                        outline: selectedStudent?.id === s.id ? '1px solid var(--primary-border)' : 'none',
                      }}
                    >
                      <div className="avatar-md">{s.name[0]}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Student Candidate</div>
                      </div>
                      {selectedStudent?.id === s.id && <ChevronRight size={16} color="var(--primary)" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Main: Interaction Hub ──────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {selectedStudent ? (
                <>
                  {/* Chat Panel */}
                  <div className="card" style={{ padding: 28 }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div className="avatar-lg">{selectedStudent.name[0]}</div>
                        <div>
                          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '1.05rem' }}>{selectedStudent.name}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Interaction Record</div>
                        </div>
                      </div>
                      <span className="badge badge-green">● Online</span>
                    </div>

                    <div className="divider" />

                    {/* Messages */}
                    <div className="chat-area" style={{ marginTop: 16 }}>
                      {chatHistory.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
                          <MessageSquare size={32} style={{ marginBottom: 10, opacity: 0.35 }} />
                          <p style={{ fontSize: '0.875rem' }}>No messages yet. Start the conversation.</p>
                        </div>
                      ) : chatHistory.map((msg, i) => (
                        <div key={i} className={msg.senderId === 'EMPLOYEE_1' ? 'msg-sent' : 'msg-received'}>
                          {msg.content}
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                      <input
                        className="input"
                        placeholder="Type a message…"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={handleKey}
                      />
                      <button
                        className="btn btn-primary"
                        style={{ padding: '10px 18px', flexShrink: 0 }}
                        onClick={sendMessage}
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Assessment Panel */}
                  <div className="card" style={{ padding: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <Star size={18} color="var(--warning)" fill="var(--warning)" />
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}>Interaction Assessment</span>
                      <span className="badge badge-blue" style={{ marginLeft: 'auto' }}>Feeds AI Engine</span>
                    </div>
                    <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                      Your qualitative assessment will be factored into the AI ranking for this candidate.
                    </p>
                    <textarea
                      className="input"
                      rows={4}
                      placeholder="e.g. Demonstrates strong leadership, highly inquisitive, communicated clearly…"
                      value={feedback}
                      onChange={e => setFeedback(e.target.value)}
                      style={{ resize: 'vertical', lineHeight: 1.6 }}
                    />
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: 12, gap: 8 }}
                      onClick={submitFeedback}
                    >
                      <UserCheck size={16} /> Submit to AI Analysis
                    </button>
                  </div>
                </>
              ) : (
                <div className="card" style={{ padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center' }}>
                  <MessageSquare size={40} style={{ marginBottom: 14, opacity: 0.25 }} />
                  <p style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Select a Candidate</p>
                  <p style={{ fontSize: '0.875rem' }}>Choose a candidate from the list to begin the interaction.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePage;
