import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiShield, FiCpu, FiDatabase, FiEye, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

const layers = [
  {
    id: '01',
    icon: FiEye,
    title: 'Capture Layer',
    subtitle: 'First Mile of Trust',
    desc: 'Cryptographic hash + device manifest generated at source. Only verified devices produce trusted content.',
    color: 'var(--cyan)',
    glow: 'rgba(0,229,255,0.15)',
  },
  {
    id: '02',
    icon: FiCpu,
    title: 'Verification Layer',
    subtitle: 'AI Forensic Lab',
    desc: 'Ensemble of Xception CNN, Vision Transformers, rPPG analysis and noise-pattern detection. Probabilistic confidence score.',
    color: 'var(--violet)',
    glow: 'rgba(139,92,246,0.15)',
  },
  {
    id: '03',
    icon: FiDatabase,
    title: 'Ledger Layer',
    subtitle: 'Immutable Record',
    desc: 'Content hash, device ID and AI confidence score anchored via Merkle trees to a simulated Polygon L2 blockchain.',
    color: 'var(--green)',
    glow: 'rgba(0,255,148,0.15)',
  },
  {
    id: '04',
    icon: FiShield,
    title: 'Distribution Layer',
    subtitle: 'Truth UI',
    desc: 'Three-way match: content hash, AI confidence and device origin. C2PA-compatible verification badge.',
    color: 'var(--amber)',
    glow: 'rgba(255,184,0,0.15)',
  },
];

const stats = [
  { label: 'Detection Accuracy', value: '96%', color: 'var(--violet)' },
  { label: 'False Positive Drop', value: '35%', color: 'var(--cyan)' },
  { label: 'Messages Reviewed', value: '5K+', color: 'var(--green)' },
  { label: 'Response Time', value: '<120ms', color: 'var(--amber)' },
];

const features = [
  'Hybrid ML + Llama-3 Intelligence Fusion',
  'Real-time Text, Image, Video & Audio Analysis',
  'Immutable Blockchain Audit Trail',
  'Explainable AI — plain language risk reasoning',
  'Device Attestation & PKI Verification',
  'C2PA-Compatible Content Provenance',
];

export default function HomePage({ onSignup }) {
  return (
    <div>
      {/* Hero */}
      <section style={{ padding: '70px 40px 50px', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.2)',
            borderRadius: 4, padding: '5px 14px', marginBottom: 20,
            fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'var(--cyan2)', fontFamily: 'var(--font-data)',
          }}>
            <span className="animate-blink" style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--green)', display: 'inline-block',
              boxShadow: '0 0 8px var(--green)',
            }} />
            AI Truth Protocol — Active
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(34px, 6vw, 60px)', lineHeight: 1.05,
            letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 18,
          }}>
            The Universal Notary{' '}
            <span style={{ color: 'var(--cyan)' }}>for Reality</span>
            <br />
            <span style={{ color: 'var(--text3)' }}>in the Age of AI</span>
          </h1>

          <p style={{
            fontSize: 15, color: 'var(--text2)', maxWidth: 580, margin: '0 auto 36px',
            lineHeight: 1.8, fontFamily: 'var(--font-data)',
          }}>
            Detect fraudulent messages, verify media authenticity, and anchor truth to an immutable ledger — all in one professional platform.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/analysis" className="btn-cyber btn-solid-violet" style={{
              padding: '12px 28px', fontSize: 12, fontWeight: 700, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              Start Analyzing <FiArrowRight />
            </Link>
            <button onClick={onSignup} className="btn-cyber btn-cyan" style={{
              padding: '12px 28px', fontSize: 12,
            }}>
              Create Free Account
            </button>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {stats.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="panel" style={{ padding: '20px 24px', textAlign: 'center' }}
            >
              <p style={{
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36,
                color: s.color, marginBottom: 6,
              }}>{s.value}</p>
              <p style={{ fontSize: 10, color: 'var(--text2)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-data)' }}>
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4-Layer Architecture */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <p style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--font-data)', marginBottom: 10 }}>
            Architecture
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--text)' }}>
            4-Layer Trust Architecture
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {layers.map((layer, i) => {
            const Icon = layer.icon;
            return (
              <motion.div key={layer.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                style={{
                  background: `linear-gradient(135deg, ${layer.glow} 0%, var(--panel) 60%)`,
                  border: `1px solid ${layer.color}30`,
                  borderRadius: 12, padding: '24px 22px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'default',
                }}
                whileHover={{ y: -4 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    border: `1px solid ${layer.color}50`,
                    background: `${layer.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon style={{ color: layer.color, fontSize: 17 }} />
                  </div>
                  <span style={{
                    fontSize: 22, fontFamily: 'var(--font-display)',
                    fontWeight: 800, color: `${layer.color}60`,
                  }}>{layer.id}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>
                  {layer.title}
                </h3>
                <p style={{ fontSize: 10, color: layer.color, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-data)', marginBottom: 10 }}>
                  {layer.subtitle}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7, fontFamily: 'var(--font-data)' }}>
                  {layer.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px 60px' }}>
        <div style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 16, padding: '40px 40px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40,
        }}
          className="features-grid"
        >
          <div>
            <p style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--font-data)', marginBottom: 12 }}>
              Capabilities
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--text)', marginBottom: 16, lineHeight: 1.2 }}>
              Everything you need to<br />
              <span style={{ color: 'var(--violet)' }}>fight digital fraud</span>
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, fontFamily: 'var(--font-data)' }}>
              FraudGuard AI merges message fraud detection with full media provenance — giving you a complete forensic toolkit for the age of synthetic media.
            </p>
            <Link to="/analysis" className="btn-cyber btn-violet" style={{
              marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 22px', textDecoration: 'none', fontSize: 11,
            }}>
              Try the Analyzer <FiArrowRight />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {features.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FiCheckCircle style={{ color: 'var(--green)', fontSize: 14, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--text)', fontFamily: 'var(--font-data)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px 80px', textAlign: 'center' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(0,229,255,0.08) 100%)',
          border: '1px solid rgba(139,92,246,0.25)',
          borderRadius: 16, padding: '50px 32px',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, color: 'var(--text)', marginBottom: 14 }}>
            Ready to secure your <span style={{ color: 'var(--cyan)' }}>digital reality</span>?
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text2)', fontFamily: 'var(--font-data)', marginBottom: 28 }}>
            Start for free. No credit card required.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onSignup} className="btn-cyber btn-solid-violet" style={{ padding: '12px 30px', fontSize: 12, fontWeight: 700 }}>
              Get Started Free
            </button>
            <Link to="/about" className="btn-cyber btn-cyan" style={{ padding: '12px 30px', textDecoration: 'none', fontSize: 12 }}>
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @media(max-width: 640px) {
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
