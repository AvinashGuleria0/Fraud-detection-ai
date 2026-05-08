import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiX, FiFileText, FiImage, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const h = JSON.parse(localStorage.getItem('fg_history') || '[]');
    setHistory(h);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('fg_history');
    setHistory([]);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px 80px' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--font-data)', marginBottom: 10 }}>
          Audit Trail
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, color: 'var(--text)', marginBottom: 8 }}>
              Analysis History
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text2)', fontFamily: 'var(--font-data)' }}>
              Local audit log of all fraud and media checks performed in this session.
            </p>
          </div>
          {history.length > 0 && (
            <button onClick={clearHistory} className="btn-cyber"
              style={{
                background: 'rgba(255,61,107,0.08)', border: '1px solid rgba(255,61,107,0.25)',
                color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px',
              }}>
              <FiX /> Clear History
            </button>
          )}
        </div>
      </motion.div>

      {history.length === 0 ? (
        <div className="panel" style={{ padding: '70px 32px', textAlign: 'center' }}>
          <FiClock style={{ fontSize: 40, color: 'var(--text3)', marginBottom: 16 }} />
          <p style={{ fontSize: 15, color: 'var(--text2)', fontFamily: 'var(--font-data)', marginBottom: 6 }}>No activity yet</p>
          <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-data)' }}>
            Run an analysis to build your local audit trail here.
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Checks', value: history.length, color: 'var(--violet)' },
              { label: 'Fraud / Suspicious', value: history.filter(h => h.is_fraud).length, color: 'var(--red)' },
              { label: 'Safe / Authentic', value: history.filter(h => !h.is_fraud).length, color: 'var(--green)' },
            ].map(s => (
              <div key={s.label} className="panel" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: s.color }}>{s.value}</span>
                <span style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-data)' }}>{s.label}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {history.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.025 }}
                style={{
                  background: 'var(--panel)',
                  border: `1px solid ${item.is_fraud ? 'rgba(255,61,107,0.2)' : 'var(--border)'}`,
                  borderLeft: `3px solid ${item.is_fraud ? 'var(--red)' : 'var(--green)'}`,
                  borderRadius: 10, padding: '14px 18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 12, flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 7, flexShrink: 0,
                    background: item.is_fraud ? 'rgba(255,61,107,0.1)' : 'rgba(0,255,148,0.1)',
                    border: `1px solid ${item.is_fraud ? 'rgba(255,61,107,0.3)' : 'rgba(0,255,148,0.3)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: item.is_fraud ? 'var(--red)' : 'var(--green)', fontSize: 14,
                  }}>
                    {item.type === 'media' ? <FiImage /> : <FiFileText />}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{
                      fontSize: 12, color: 'var(--text)', fontFamily: 'var(--font-data)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      marginBottom: 3,
                    }}
                      title={item.message}>{item.message}</p>
                    <p style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-data)' }}>
                      {new Date(item.timestamp).toLocaleString()} · {item.type === 'media' ? 'Media' : 'Text'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 11, fontFamily: 'var(--font-data)', fontWeight: 700,
                    color: item.is_fraud ? 'var(--red)' : 'var(--green)',
                    background: item.is_fraud ? 'rgba(255,61,107,0.08)' : 'rgba(0,255,148,0.08)',
                    border: `1px solid ${item.is_fraud ? 'rgba(255,61,107,0.25)' : 'rgba(0,255,148,0.25)'}`,
                    padding: '4px 10px', borderRadius: 5,
                  }}>
                    {item.is_fraud ? <FiAlertTriangle /> : <FiCheckCircle />}
                    {item.is_fraud ? (item.type === 'media' ? 'SUSPICIOUS' : 'FRAUD') : 'SAFE'}
                  </div>
                  <div style={{
                    fontSize: 11, fontFamily: 'var(--font-data)',
                    color: 'var(--text2)',
                    background: 'var(--panel2)', border: '1px solid var(--border)',
                    padding: '4px 10px', borderRadius: 5,
                  }}>
                    {item.confidence}%
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
