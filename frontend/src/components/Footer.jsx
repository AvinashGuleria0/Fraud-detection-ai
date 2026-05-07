import { Link } from 'react-router-dom';
import { FiShield } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--bg2)',
      padding: '40px 32px',
      marginTop: 40,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '32px 64px', alignItems: 'start', flexWrap: 'wrap' }}
          className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, border: '1px solid var(--violet)',
                borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FiShield style={{ color: 'var(--violet)', fontSize: 15 }} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: '#fff' }}>
                Fraud<span style={{ color: 'var(--cyan)' }}>Guard</span><span style={{ color: 'var(--violet)', marginLeft: 3 }}>AI</span>
              </span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-data)', lineHeight: 1.7, maxWidth: 260 }}>
              Universal Truth Protocol for digital media provenance and fraud detection.
            </p>
          </div>

          <div>
            <p style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-data)', marginBottom: 12 }}>Platform</p>
            {['Analysis', 'Verify', 'History'].map(l => (
              <Link key={l} to={`/${l.toLowerCase()}`} style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'var(--text2)', textDecoration: 'none', fontFamily: 'var(--font-data)' }}
                onMouseEnter={e => e.target.style.color = 'var(--violet)'}
                onMouseLeave={e => e.target.style.color = 'var(--text2)'}
              >{l}</Link>
            ))}
          </div>

          <div>
            <p style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-data)', marginBottom: 12 }}>Company</p>
            {['About Us', 'Home'].map(l => (
              <Link key={l} to={l === 'Home' ? '/' : '/about'} style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'var(--text2)', textDecoration: 'none', fontFamily: 'var(--font-data)' }}
                onMouseEnter={e => e.target.style.color = 'var(--violet)'}
                onMouseLeave={e => e.target.style.color = 'var(--text2)'}
              >{l}</Link>
            ))}
          </div>

          <div>
            <p style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-data)', marginBottom: 12 }}>Standards</p>
            {['C2PA Compatible', 'ISO 27001 Aware', 'GDPR Aware'].map(l => (
              <p key={l} style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-data)' }}>{l}</p>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-data)' }}>
            © {new Date().getFullYear()} FraudGuard AI. Universal Truth Protocol v2.0. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Privacy', 'Terms', 'Security'].map(l => (
              <span key={l} style={{
                fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-data)',
                background: 'var(--panel)', border: '1px solid var(--border)',
                padding: '3px 9px', borderRadius: 4, cursor: 'pointer',
              }}>{l}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width: 640px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
