import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShield, FiMenu, FiX, FiLogIn, FiUserPlus, FiLogOut, FiSun, FiMoon, FiUser } from 'react-icons/fi';
import ProfileModal from './ProfileModal';

const navLinks = [
  { label: 'Home',     path: '/' },
  { label: 'Analysis', path: '/analysis' },
  { label: 'Verify',   path: '/verify' },
  { label: 'History',  path: '/history' },
  { label: 'About Us', path: '/about' },
];

export default function Navbar({ userData, onLogin, onSignup, onLogout, theme, toggleTheme }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      borderBottom: '1px solid var(--border)',
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 32px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="animate-pulse-violet" style={{
            width: 38, height: 38, border: '1.5px solid var(--violet)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <FiShield style={{ color: 'var(--violet)', fontSize: 18 }} />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18,
              color: 'var(--text)', letterSpacing: '0.02em',
            }}>
              Fraud<span style={{ color: 'var(--cyan)' }}>Guard</span>
              <span style={{ color: 'var(--violet)', marginLeft: 4 }}>AI</span>
            </div>
            <div style={{
              fontSize: 9, color: 'var(--text3)',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              fontFamily: 'var(--font-data)',
            }}>
              Universal Truth Protocol
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="hidden-mobile">
          {navLinks.map(link => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '7px 14px',
                  borderRadius: 6,
                  border: `1px solid ${active ? 'rgba(139,92,246,0.35)' : 'transparent'}`,
                  background: active ? 'rgba(139,92,246,0.08)' : 'transparent',
                  color: active ? 'var(--violet)' : 'var(--text2)',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.target.style.color = 'var(--text)';
                    e.target.style.borderColor = 'var(--border2)';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.target.style.color = 'var(--text2)';
                    e.target.style.borderColor = 'transparent';
                  }
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="hidden-mobile">
          
          <button
            onClick={toggleTheme}
            className="btn-cyber btn-violet"
            style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 12 }}
          >
            {theme === 'dark' ? <FiSun /> : <FiMoon />} {theme === 'dark' ? 'Light' : 'Dark'}
          </button>

          {userData ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`} 
                  style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid var(--violet)', background: 'var(--panel2)' }}
                  alt="Profile"
                />
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{
                      position: 'absolute', top: 46, right: 0, width: 160,
                      background: 'var(--panel)', border: '1px solid var(--border2)',
                      borderRadius: 8, padding: 8, boxShadow: 'var(--card-shadow)',
                      display: 'flex', flexDirection: 'column', gap: 4, zIndex: 200,
                    }}
                  >
                    <button className="btn-cyber" onClick={() => { setEditProfileOpen(true); setProfileDropdownOpen(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', color: 'var(--text)', textAlign: 'left', border: 'none' }}>
                      <FiUser /> Edit Profile
                    </button>
                    <button className="btn-cyber" onClick={() => { onLogout(); setProfileDropdownOpen(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', color: 'var(--red)', textAlign: 'left', border: 'none' }}>
                      <FiLogOut /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {editProfileOpen && (
                  <ProfileModal 
                    userData={userData} 
                    onClose={() => setEditProfileOpen(false)} 
                    onSuccess={() => setEditProfileOpen(false)} 
                  />
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <button className="btn-cyber btn-cyan" onClick={onLogin}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiLogIn /> Log In
              </button>
              <button className="btn-cyber btn-solid-violet" onClick={onSignup}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiUserPlus /> Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: 22 }}
          className="show-mobile"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              borderTop: '1px solid var(--border)',
              background: 'rgba(5,8,16,0.98)',
              padding: '16px 24px 20px',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}
          >
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                style={{
                  padding: '10px 14px', borderRadius: 6, textDecoration: 'none',
                  color: location.pathname === link.path ? 'var(--violet)' : 'var(--text2)',
                  background: location.pathname === link.path ? 'rgba(139,92,246,0.08)' : 'transparent',
                  fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em',
                  textTransform: 'uppercase', border: '1px solid var(--border)',
                }}
              >
                {link.label}
              </Link>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              
          <button
            onClick={toggleTheme}
            className="btn-cyber btn-violet"
            style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 12 }}
          >
            {theme === 'dark' ? <FiSun /> : <FiMoon />} {theme === 'dark' ? 'Light' : 'Dark'}
          </button>

          {userData ? (
                <button className="btn-cyber btn-cyan" onClick={() => { onLogout(); setMenuOpen(false); }}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <FiLogOut /> Logout
                </button>
              ) : (
                <>
                  <button className="btn-cyber btn-cyan" onClick={() => { onLogin(); setMenuOpen(false); }}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <FiLogIn /> Log In
                  </button>
                  <button className="btn-cyber btn-solid-violet" onClick={() => { onSignup(); setMenuOpen(false); }}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <FiUserPlus /> Sign Up
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media(max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
      `}</style>
    </header>
  );
}
