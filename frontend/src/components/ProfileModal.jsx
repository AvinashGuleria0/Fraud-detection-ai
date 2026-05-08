import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiUser, FiMail, FiLock } from 'react-icons/fi';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';

export default function ProfileModal({ userData, onClose, onSuccess }) {
  const [name, setName] = useState(userData?.user_metadata?.name || userData?.name || '');
  const [email, setEmail] = useState(userData?.email || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const updates = { data: { name } };
      if (email !== userData?.email) {
        updates.email = email;
      }
      
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      
      toast.success('Profile updated successfully!');
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
          width: '100%', maxWidth: 400,
          background: 'var(--panel)',
          border: '1px solid var(--border2)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ height: 3, background: 'linear-gradient(90deg, var(--cyan), var(--violet))' }} />

        <div style={{ padding: '24px 28px' }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none', color: 'var(--text3)',
            cursor: 'pointer', fontSize: 18, transition: 'color 0.2s',
          }}>
            <FiX />
          </button>

          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.email}`} 
              style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 12px', border: '2px solid var(--violet)', background: 'var(--panel2)' }}
              alt="Avatar"
            />
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--text)', marginBottom: 4 }}>
              Edit Profile
            </h2>
          </div>

          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && (
              <div style={{
                background: 'rgba(255,61,107,0.1)', border: '1px solid rgba(255,61,107,0.3)',
                borderRadius: 8, padding: '10px 14px',
                fontSize: 12, color: 'var(--red)', fontFamily: 'var(--font-data)',
              }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6, fontFamily: 'var(--font-data)' }}>Name</label>
              <div style={{ position: 'relative' }}>
                <FiUser style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 14 }} />
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="cyber-input" style={{ paddingLeft: 36 }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6, fontFamily: 'var(--font-data)' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <FiMail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 14 }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="cyber-input" style={{ paddingLeft: 36 }} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-cyber btn-solid-violet" style={{
              marginTop: 6, padding: '12px', fontSize: 12,
              fontWeight: 700, letterSpacing: '0.1em',
            }}>
              {loading ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
