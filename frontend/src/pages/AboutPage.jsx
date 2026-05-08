import { motion } from 'framer-motion';
import { FiShield, FiCpu, FiDatabase, FiGlobe, FiEye, FiLock } from 'react-icons/fi';

const team = [
  { name: 'AI Detection Engine', role: 'Hybrid ML + Llama-3 Intelligence', icon: FiCpu, color: 'var(--violet)' },
  { name: 'Blockchain Ledger', role: 'Immutable Provenance Layer', icon: FiDatabase, color: 'var(--cyan)' },
  { name: 'Capture Layer', role: 'Device Attestation & PKI', icon: FiEye, color: 'var(--green)' },
  { name: 'Truth Protocol', role: 'C2PA Distribution & UI', icon: FiGlobe, color: 'var(--amber)' },
];

const phases = [
  {
    phase: 'Phase 1',
    title: 'Prototype',
    status: 'complete',
    items: ['Capture & Verification layers', 'Blockchain proof-of-concept', 'Basic analysis UI'],
  },
  {
    phase: 'Phase 2',
    title: 'Scaling',
    status: 'active',
    items: ['Real-time streaming analysis', 'Layer-2 Merkle optimizations', 'TEE-backed device signing'],
  },
  {
    phase: 'Phase 3',
    title: 'Global Adoption',
    status: 'planned',
    items: ['Journalism & legal partnerships', 'Social media API integrations', 'C2PA full compliance'],
  },
];

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px 80px' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 48, maxWidth: 700 }}>
        <p style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--font-data)', marginBottom: 12 }}>
          Our Mission
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 34, color: 'var(--text)', lineHeight: 1.1, marginBottom: 18 }}>
          Building the Universal Notary<br />
          <span style={{ color: 'var(--cyan)' }}>for Reality</span>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.8, fontFamily: 'var(--font-data)' }}>
          In a world where AI can generate synthetic media indistinguishable from reality, FraudGuard AI establishes a robust, multi-layer system that guarantees the integrity of digital media — from capture to distribution.
        </p>
      </motion.div>

      {/* Mission statement */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,229,255,0.06), rgba(139,92,246,0.08))',
        border: '1px solid rgba(0,229,255,0.15)', borderRadius: 14,
        padding: '32px 36px', marginBottom: 48,
      }}>
        <FiShield style={{ color: 'var(--cyan)', fontSize: 28, marginBottom: 14 }} />
        <p style={{ fontSize: 16, color: 'var(--text)', lineHeight: 1.8, fontFamily: 'var(--font-data)', fontStyle: 'italic' }}>
          "We treat AI detection results as <strong style={{ color: 'var(--violet)' }}>probabilistic evidence</strong> — not absolute truth. Our multi-layer approach combines cryptographic provenance, ensemble AI models, and blockchain immutability to provide verifiable confidence that empowers decision-making."
        </p>
      </div>

      {/* Core Components */}
      <section style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--font-data)', marginBottom: 20 }}>
          Core Components
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {team.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div key={t.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="panel" style={{ padding: '20px 22px' }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10, marginBottom: 14,
                  background: `${t.color}15`, border: `1px solid ${t.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: t.color, fontSize: 18,
                }}>
                  <Icon />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 5 }}>{t.name}</h3>
                <p style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-data)', letterSpacing: '0.06em' }}>{t.role}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Roadmap */}
      <section style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--font-data)', marginBottom: 20 }}>
          Implementation Roadmap
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {phases.map((p, i) => (
            <div key={p.phase} className="panel" style={{
              padding: '20px 22px',
              borderLeft: `3px solid ${p.status === 'complete' ? 'var(--green)' : p.status === 'active' ? 'var(--violet)' : 'var(--border2)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-data)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{p.phase}</span>
                <span style={{
                  fontSize: 9, fontFamily: 'var(--font-data)', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: p.status === 'complete' ? 'var(--green)' : p.status === 'active' ? 'var(--violet)' : 'var(--text3)',
                  background: p.status === 'complete' ? 'rgba(0,255,148,0.1)' : p.status === 'active' ? 'rgba(139,92,246,0.1)' : 'var(--panel2)',
                  padding: '2px 8px', borderRadius: 3,
                }}>
                  {p.status}
                </span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--text)', marginBottom: 12 }}>{p.title}</h3>
              {p.items.map(item => (
                <p key={item} style={{
                  fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--font-data)',
                  marginBottom: 6, paddingLeft: 12,
                  borderLeft: '2px solid var(--border)',
                }}>{item}</p>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Trust principles */}
      <section>
        <p style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--font-data)', marginBottom: 20 }}>
          Design Principles
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {[
            { icon: FiShield, color: 'var(--violet)', title: 'Probabilistic, Not Absolute', desc: 'AI results are treated as evidence, not verdicts. Multi-model ensembles increase robustness against evolving synthetic media.' },
            { icon: FiDatabase, color: 'var(--cyan)', title: 'Tamper-Proof Records', desc: 'Blockchain stores a cryptographic record. It prevents retroactive manipulation but does not guarantee real-time authenticity.' },
            { icon: FiLock, color: 'var(--green)', title: 'Backward Compatible', desc: 'Designed for C2PA integration and compatibility with existing media standards — extending platforms, not replacing them.' },
          ].map(p => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="panel" style={{ padding: '22px 24px' }}>
                <Icon style={{ color: p.color, fontSize: 20, marginBottom: 12 }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 8 }}>{p.title}</h3>
                <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7, fontFamily: 'var(--font-data)' }}>{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
