'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';

const Navbar = ({ theme = 'light' }) => {
  const pathname = usePathname();
  const isDark = theme === 'dark';

  const navLinks = [
    { href: '/',                   label: 'Home' },
    { href: '/student',            label: 'Student Hub' },
    { href: '/employee',           label: 'Candidates' },
    { href: '/company/dashboard',  label: 'Company' },
  ];

  return (
    <nav className={`top-nav ${isDark ? 'dark-bg' : 'light-bg'}`}>
      {/* Brand */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: isDark ? 'rgba(255,255,255,0.15)' : 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Search size={18} color="white" />
        </div>
        <span style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '1.1rem', fontWeight: 800,
          color: isDark ? '#fff' : 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}>
          AI<span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'var(--primary)' }}>Recruitment</span>
        </span>
      </Link>

      {/* Links */}
      <div className="nav-links">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={pathname === href ? 'active' : ''}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        
      </div>
    </nav>
  );
};

export default Navbar;
