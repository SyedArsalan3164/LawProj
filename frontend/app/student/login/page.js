'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
            const res = await fetch(`${API_URL}/api/candidates/student/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            if (res.ok) {
                const student = await res.json();
                // Save ID to localStorage for the dashboard to use
                localStorage.setItem('studentId', student.id);
                router.push('/student');
            } else {
                const errorData = await res.json();
                alert(errorData.error || 'Invalid email or password.');
            }
        } catch (error) {
            console.error('Login failed', error);
            alert('Failed to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '32px' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '8px' }}>Student Login</h1>
                    <p className="text-muted">Welcome back! Please enter your details.</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label className="section-label" style={{ marginBottom: '6px', display: 'block' }}>Email</label>
                        <input 
                            type="email" 
                            className="input" 
                            placeholder="Enter your email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                    <div>
                        <label className="section-label" style={{ marginBottom: '6px', display: 'block' }}>Password</label>
                        <input 
                            type="password" 
                            className="input" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '12px' }} disabled={loading}>
                        {loading ? 'Logging in...' : 'Log in'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem' }}>
                    <span className="text-muted">Don't have an account? </span>
                    <Link href="/student/signup" style={{ color: 'var(--primary)', fontWeight: '600' }}>
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}
