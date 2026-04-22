'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function StudentSignup() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        githubUrl: '',
        skills: '',
        projects: ''
    });

    // AI Parsing State
    const [resumeFile, setResumeFile] = useState(null);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [createdStudentId, setCreatedStudentId] = useState(null);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Step 1: Create basic profile
    const handleBasicInfoSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // In a real app, you'd have a specific signup endpoint
            const res = await fetch(`${API_URL}/api/candidates/student/seed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    githubUrl: formData.githubUrl,
                    skills: [],
                    projects: []
                })
            });
            const data = await res.json();
            setCreatedStudentId(data.id);
            setStep(2);
        } catch (error) {
            console.error('Failed to create account', error);
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Upload Resume for AI Parsing
    const handleResumeUpload = async (e) => {
        e.preventDefault();
        if (!resumeFile || !createdStudentId) return;
        
        setLoading(true);
        const fileData = new FormData();
        fileData.append('file', resumeFile);

        try {
            const res = await fetch(`${API_URL}/api/candidates/student/upload-resume/${createdStudentId}`, {
                method: 'POST',
                body: fileData
            });
            
            const data = await res.json();
            if (res.ok) {
                setAiAnalysis(data);
                setStep(3);
            } else {
                alert(data.error || 'Failed to parse resume');
            }
        } catch (error) {
            console.error('Failed to upload resume', error);
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Finalize Skills & Projects
    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Parse comma separated skills
        const skillsList = formData.skills.split(',').map(s => s.trim()).filter(s => s);
        // Simple project map (assuming CSV of URLs for mockup)
        const projectsList = formData.projects.split(',').map(p => ({
            title: "Project",
            description: "Portfolio Project",
            githubUrl: p.trim()
        })).filter(p => p.githubUrl);

        try {
            await fetch(`${API_URL}/api/candidates/student/update/${createdStudentId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    githubUrl: formData.githubUrl,
                    skills: skillsList,
                    projects: projectsList
                })
            });
            
            // Save ID to localStorage
            localStorage.setItem('studentId', createdStudentId);
            
            // Redirect to dashboard
            router.push('/student');
        } catch (error) {
            console.error('Failed to update profile', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper" style={{ padding: '64px 24px', display: 'flex', justifyContent: 'center' }}>
            <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '40px' }}>
                
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '8px' }}>Create Student Profile</h1>
                    <p className="text-muted">Step {step} of 3</p>
                    
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
                        <div style={{ height: '4px', width: '40px', background: step >= 1 ? 'var(--primary)' : 'var(--border)', borderRadius: '2px' }} />
                        <div style={{ height: '4px', width: '40px', background: step >= 2 ? 'var(--primary)' : 'var(--border)', borderRadius: '2px' }} />
                        <div style={{ height: '4px', width: '40px', background: step >= 3 ? 'var(--primary)' : 'var(--border)', borderRadius: '2px' }} />
                    </div>
                </div>

                {/* STEP 1: BASIC INFO */}
                {step === 1 && (
                    <form onSubmit={handleBasicInfoSubmit} className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label className="section-label" style={{ marginBottom: '6px', display: 'block' }}>Full Name</label>
                                <input type="text" name="name" className="input" placeholder="Jane Doe" value={formData.name} onChange={handleInputChange} required />
                            </div>
                            <div>
                                <label className="section-label" style={{ marginBottom: '6px', display: 'block' }}>Email</label>
                                <input type="email" name="email" className="input" placeholder="jane@example.com" value={formData.email} onChange={handleInputChange} required />
                            </div>
                        </div>
                        <div>
                            <label className="section-label" style={{ marginBottom: '6px', display: 'block' }}>Password</label>
                            <input type="password" name="password" className="input" placeholder="••••••••" value={formData.password} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <label className="section-label" style={{ marginBottom: '6px', display: 'block' }}>GitHub URL</label>
                            <input type="url" name="githubUrl" className="input" placeholder="https://github.com/janedoe" value={formData.githubUrl} onChange={handleInputChange} />
                        </div>
                        
                        <button type="submit" className="btn btn-primary" style={{ padding: '12px', marginTop: '12px' }} disabled={loading}>
                            {loading ? 'Creating...' : 'Continue to Resume Upload'}
                        </button>
                    </form>
                )}

                {/* STEP 2: RESUME UPLOAD */}
                {step === 2 && (
                    <form onSubmit={handleResumeUpload} className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ padding: '24px', border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', textAlign: 'center', background: 'var(--bg)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📄</div>
                            <h3 style={{ marginBottom: '8px', fontWeight: '600' }}>Upload your Resume (PDF)</h3>
                            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '16px' }}>Our AI engine will parse your resume to automatically extract your skills and capabilities.</p>
                            
                            <input 
                                type="file" 
                                accept=".pdf"
                                onChange={(e) => setResumeFile(e.target.files[0])}
                                style={{ margin: '0 auto', display: 'block' }}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStep(3)}>Skip</button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading || !resumeFile}>
                                {loading ? 'AI Parsing in progress...' : 'Upload & Parse Resume'}
                            </button>
                        </div>
                    </form>
                )}

                {/* STEP 3: SKILLS & PROJECTS (AI RESULTS) */}
                {step === 3 && (
                    <form onSubmit={handleFinalSubmit} className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        {aiAnalysis && (
                            <div style={{ background: 'var(--success-light)', border: '1px solid var(--success)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--success)', fontWeight: '700' }}>
                                    ✨ AI Parsing Complete
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Identified Capabilities: <strong>{aiAnalysis.capabilities || 'General Professional'}</strong><br/>
                                    Found <strong>{aiAnalysis.wordCount}</strong> words. Review and complete your profile below.
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="section-label" style={{ marginBottom: '6px', display: 'block' }}>Skills (Comma Separated)</label>
                            <textarea 
                                name="skills" 
                                className="input" 
                                placeholder="Java, Python, React, Leadership..." 
                                value={formData.skills} 
                                onChange={handleInputChange} 
                                rows="3"
                            />
                        </div>

                        <div>
                            <label className="section-label" style={{ marginBottom: '6px', display: 'block' }}>Projects (Comma Separated URLs)</label>
                            <textarea 
                                name="projects" 
                                className="input" 
                                placeholder="https://github.com/project1, https://github.com/project2..." 
                                value={formData.projects} 
                                onChange={handleInputChange} 
                                rows="3"
                            />
                        </div>
                        
                        <button type="submit" className="btn btn-primary" style={{ padding: '12px', marginTop: '12px' }} disabled={loading}>
                            {loading ? 'Finalizing...' : 'Complete Profile & Go to Dashboard'}
                        </button>
                    </form>
                )}

                {step === 1 && (
                    <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.9rem' }}>
                        <span className="text-muted">Already have an account? </span>
                        <Link href="/student/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
                            Log in
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
