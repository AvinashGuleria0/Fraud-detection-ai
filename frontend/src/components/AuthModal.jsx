import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShield, FiMail, FiLock, FiUser } from 'react-icons/fi';
import { supabase } from '../supabaseClient';

export default function AuthModal({ mode: initialMode, onClose, onSuccess }) {
  const [mode, setMode] = useState(initialMode || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); return; }
      onSuccess(data.user);
    } else {
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { name } }
      });
      if (error) { setError(error.message); return; }
      onSuccess(data.user);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999,
      display: 'grid',
      placeItems: 'center',
      background: 'rgba(5,8,16,0.9)',
      backdropFilter: 'blur(12px)',
      padding: '20px',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        style={{
          width: '100%', maxWidth: 440,
          background: 'var(--panel)',
          border: '1px solid var(--border2)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, var(--violet), var(--cyan))' }} />

        <div style={{ padding: '28px 32px 32px' }}>
          {/* Close */}
          <button onClick={onClose} style={{
            position: 'absolute', top: 20, right: 20,
            background: 'none', border: 'none', color: 'var(--text3)',
            cursor: 'pointer', fontSize: 18, padding: 4,
            borderRadius: 6, transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.target.style.color = 'var(--text)'}
            onMouseLeave={e => e.target.style.color = 'var(--text3)'}
          >
            <FiX />
          </button>

          {/* Icon + title */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div className="animate-pulse-violet" style={{
              width: 48, height: 48, margin: '0 auto 14px',
              border: '1.5px solid var(--violet)', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiShield style={{ color: 'var(--violet)', fontSize: 22 }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--text)', marginBottom: 6 }}>
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--font-data)' }}>
              {mode === 'login'
                ? 'Access your FraudGuard AI dashboard'
                : 'Join the Universal Truth Protocol'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && (
              <div style={{
                background: 'rgba(255,61,107,0.1)', border: '1px solid rgba(255,61,107,0.3)',
                borderRadius: 8, padding: '10px 14px',
                fontSize: 12, color: 'var(--red)', fontFamily: 'var(--font-data)',
              }}>
                {error}
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6, fontFamily: 'var(--font-data)' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <FiUser style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 14 }} />
                  <input type="text" required value={name} onChange={e => setName(e.target.value)}
                    className="cyber-input" style={{ paddingLeft: 36 }} placeholder="John Doe" />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6, fontFamily: 'var(--font-data)' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <FiMail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 14 }} />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="cyber-input" style={{ paddingLeft: 36 }} placeholder="name@company.com" />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6, fontFamily: 'var(--font-data)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <FiLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 14 }} />
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="cyber-input" style={{ paddingLeft: 36 }} placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" className="btn-cyber btn-solid-violet" style={{
              marginTop: 6, padding: '12px', fontSize: 12,
              fontWeight: 700, letterSpacing: '0.1em',
            }}>
              {mode === 'login' ? 'LOG IN TO DASHBOARD' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--font-data)' }}>
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--violet)', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-data)' }}>
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
