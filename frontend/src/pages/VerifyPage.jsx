import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiRefreshCw, FiDatabase, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function VerifyPage() {
  const [chain, setChain] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chainValid, setChainValid] = useState(true);
  const [hashInput, setHashInput] = useState('');
  const [hashResult, setHashResult] = useState(null);
  const [hashLoading, setHashLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [chainRes, statsRes] = await Promise.all([
        axios.get(`${API}/api/media/blockchain`),
        axios.get(`${API}/api/media/stats`),
      ]);
      setChain(chainRes.data.chain.filter(b => b.index > 0).reverse());
      setChainValid(chainRes.data.valid);
      setStats(statsRes.data);
    } catch {
      // Backend offline – show empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleHashLookup = async () => {
    if (!hashInput.trim()) return;
    setHashLoading(true);
    setHashResult(null);
    try {
      const res = await axios.get(`${API}/api/media/verify?hash=${hashInput.trim()}`);
      setHashResult(res.data);
    } catch {
      setHashResult({ found: false, message: 'Lookup failed. Backend may be offline.' });
    } finally {
      setHashLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px 80px' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--font-data)', marginBottom: 10 }}>
          Ledger Layer · Layer 3
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, color: 'var(--text)', marginBottom: 8 }}>
              Verification Ledger
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text2)', fontFamily: 'var(--font-data)' }}>
              Immutable blockchain records of every media analysis performed.
            </p>
          </div>
          <button onClick={fetchData} className="btn-cyber btn-cyan"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}>
            <FiRefreshCw style={{ animation: loading ? 'spin 0.6s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Total Analyzed', value: stats.total_analyzed, color: 'var(--violet)' },
            { label: 'Verified', value: stats.verified, color: 'var(--green)' },
            { label: 'Suspicious', value: stats.suspicious, color: 'var(--red)' },
            { label: 'Chain Length', value: stats.chain_length, color: 'var(--cyan)' },
          ].map(s => (
            <div key={s.label} className="panel" style={{ padding: '16px 18px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: s.color, marginBottom: 4 }}>{s.value}</p>
              <p style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-data)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Hash Lookup */}
      <div className="panel" style={{ padding: '20px 24px', marginBottom: 24 }}>
        <p style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-data)', marginBottom: 12 }}>
          Hash Lookup
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={hashInput}
            onChange={e => setHashInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleHashLookup()}
            placeholder="Enter SHA-256 hash or prefix..."
            className="cyber-input"
            style={{ flex: 1 }}
          />
          <button onClick={handleHashLookup} className="btn-cyber btn-violet"
            style={{ padding: '10px 18px', whiteSpace: 'nowrap' }}>
            {hashLoading ? 'Searching...' : 'Lookup'}
          </button>
        </div>
        {hashResult && (
          <div style={{
            marginTop: 12,
            background: hashResult.found ? 'rgba(0,255,148,0.05)' : 'rgba(255,61,107,0.05)',
            border: `1px solid ${hashResult.found ? 'rgba(0,255,148,0.2)' : 'rgba(255,61,107,0.2)'}`,
            borderRadius: 8, padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: hashResult.found ? 10 : 0 }}>
              {hashResult.found
                ? <FiCheckCircle style={{ color: 'var(--green)' }} />
                : <FiAlertCircle style={{ color: 'var(--red)' }} />
              }
              <span style={{ fontSize: 12, fontFamily: 'var(--font-data)', color: hashResult.found ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>
                {hashResult.found ? 'Record Found in Ledger' : hashResult.message || 'Not found'}
              </span>
            </div>
            {hashResult.found && hashResult.record && (
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', fontSize: 11, fontFamily: 'var(--font-data)' }}>
                <span style={{ color: 'var(--text3)' }}>File:</span>
                <span style={{ color: 'var(--text)' }}>{hashResult.record.filename}</span>
                <span style={{ color: 'var(--text3)' }}>Verdict:</span>
                <span style={{ color: 'var(--text)' }}>{hashResult.record.verification?.verdict}</span>
                <span style={{ color: 'var(--text3)' }}>Trust:</span>
                <span style={{ color: 'var(--text)' }}>{hashResult.record.distribution?.trust_level}</span>
                <span style={{ color: 'var(--text3)' }}>Time:</span>
                <span style={{ color: 'var(--text)' }}>{new Date(hashResult.record.timestamp).toLocaleString()}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chain Validity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <FiDatabase style={{ color: 'var(--text3)', fontSize: 14 }} />
        <span style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
          BLOCKCHAIN STATUS
        </span>
        <span style={{
          fontSize: 10, fontFamily: 'var(--font-data)', fontWeight: 700,
          color: chainValid ? 'var(--green)' : 'var(--red)',
          background: chainValid ? 'rgba(0,255,148,0.08)' : 'rgba(255,61,107,0.08)',
          border: `1px solid ${chainValid ? 'rgba(0,255,148,0.2)' : 'rgba(255,61,107,0.2)'}`,
          padding: '2px 8px', borderRadius: 3,
        }}>
          {chainValid ? '● VALID' : '● COMPROMISED'}
        </span>
      </div>

      {/* Blocks */}
      {chain.length === 0 ? (
        <div className="panel" style={{ padding: '60px 32px', textAlign: 'center' }}>
          <FiDatabase style={{ fontSize: 36, color: 'var(--text3)', marginBottom: 14 }} />
          <p style={{ fontSize: 14, color: 'var(--text2)', fontFamily: 'var(--font-data)', marginBottom: 6 }}>No media verifications recorded yet.</p>
          <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-data)' }}>Analyze a media file in the Analysis page to create ledger entries.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {chain.map((block, i) => (
            <motion.div
              key={block.hash}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                borderLeft: '3px solid var(--violet)',
                borderRadius: 10, padding: '16px 20px',
                fontFamily: 'var(--font-data)', fontSize: 11,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ color: 'var(--violet)', fontWeight: 700, fontSize: 12 }}>
                  Block #{block.index}
                </span>
                <span style={{ color: 'var(--text3)', fontSize: 10 }}>
                  {new Date(block.timestamp).toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '5px 16px', color: 'var(--text2)' }}>
                <span style={{ color: 'var(--text3)' }}>Content Hash</span>
                <span style={{ color: 'var(--cyan)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  title={block.data?.content_hash}>{block.data?.content_hash || '—'}</span>
                <span style={{ color: 'var(--text3)' }}>Verdict</span>
                <span style={{ color: 'var(--text)', fontWeight: 700 }}>{block.data?.verdict || '—'}</span>
                <span style={{ color: 'var(--text3)' }}>AI Confidence</span>
                <span style={{ color: 'var(--green)' }}>
                  {block.data?.ai_confidence ? (block.data.ai_confidence * 100).toFixed(1) + '%' : '—'}
                </span>
                <span style={{ color: 'var(--text3)' }}>Block Hash</span>
                <span style={{ color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 10 }}
                  title={block.hash}>{block.hash}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
