import { useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShield, FiAlertTriangle, FiCheckCircle, FiLoader,
  FiUpload, FiImage, FiX, FiCpu, FiDatabase, FiEye,
} from 'react-icons/fi';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const DEVICES = [
  { value: 'DEV-ALPHA001', label: 'Canon EOS R5' },
  { value: 'DEV-BETA002',  label: 'iPhone 15 Pro' },
  { value: 'DEV-GAMMA003', label: 'Sony A7 IV' },
  { value: 'DEV-DELTA004', label: 'Samsung S24 Ultra' },
  { value: 'DEV-UNKNOWN',  label: 'Unknown Device' },
];

function VerdictBadge({ verdict, score }) {
  const map = {
    AUTHENTIC: { color: 'var(--green)', bg: 'rgba(0,255,148,0.1)', border: 'rgba(0,255,148,0.3)' },
    'LIKELY AUTHENTIC': { color: 'var(--cyan)', bg: 'rgba(0,229,255,0.1)', border: 'rgba(0,229,255,0.3)' },
    SUSPICIOUS: { color: 'var(--amber)', bg: 'rgba(255,184,0,0.1)', border: 'rgba(255,184,0,0.3)' },
    'SYNTHETIC / MANIPULATED': { color: 'var(--red)', bg: 'rgba(255,61,107,0.1)', border: 'rgba(255,61,107,0.3)' },
  };
  const s = map[verdict] || map['SUSPICIOUS'];
  return (
    <span style={{
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 4, padding: '3px 10px',
      fontSize: 10, fontFamily: 'var(--font-data)',
      letterSpacing: '0.1em', textTransform: 'uppercase',
      color: s.color, fontWeight: 700,
    }}>
      {verdict}
    </span>
  );
}

function ProgressBar({ value, color }) {
  return (
    <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ height: '100%', borderRadius: 3, background: color }}
      />
    </div>
  );
}

export default function AnalysisPage() {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [deviceId, setDeviceId] = useState('DEV-ALPHA001');
  const [analyzing, setAnalyzing] = useState(false);
  const [textResult, setTextResult] = useState(null);
  const [mediaResult, setMediaResult] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) { setFile(f); setMediaResult(null); }
  };

  const handleAnalyze = async () => {
    if (!message.trim() && !file) {
      setError('Paste a message or attach a file to analyze.');
      return;
    }
    setError(''); setAnalyzing(true);
    setTextResult(null); setMediaResult(null);

    try {
      const tasks = [];

      if (message.trim()) {
        tasks.push(
          axios.post(`${API}/predict`, { message })
            .then(r => {
              setTextResult(r.data);
              const hist = JSON.parse(localStorage.getItem('fg_history') || '[]');
              hist.unshift({
                id: Date.now(), message: message,
                is_fraud: r.data.is_fraud,
                confidence: r.data.confidence_score,
                timestamp: new Date().toISOString(),
                type: 'text',
              });
              localStorage.setItem('fg_history', JSON.stringify(hist.slice(0, 100)));
            })
        );
      }

      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('device_id', deviceId);
        tasks.push(
          axios.post(`${API}/api/media/analyze`, fd)
            .then(r => {
              setMediaResult(r.data);
              const hist = JSON.parse(localStorage.getItem('fg_history') || '[]');
              hist.unshift({
                id: Date.now(), message: file.name,
                is_fraud: r.data.verification.verdict.includes('SYNTHETIC') || r.data.verification.verdict === 'SUSPICIOUS',
                confidence: Math.round(r.data.verification.ensemble_confidence * 100),
                timestamp: new Date().toISOString(),
                type: 'media',
                verdict: r.data.verification.verdict,
              });
              localStorage.setItem('fg_history', JSON.stringify(hist.slice(0, 100)));
            })
        );
      }

      await Promise.all(tasks);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Analysis failed. Ensure backend is running.');
    } finally {
      setAnalyzing(false);
    }
  };

  const textConf = Math.min(100, Math.max(0, Number(textResult?.confidence_score || 0)));

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px 80px' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--font-data)', marginBottom: 10 }}>
          Multimodal Analysis Engine
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, color: '#fff', marginBottom: 8 }}>
          Threat Analysis
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', fontFamily: 'var(--font-data)' }}>
          Analyze text messages, emails, images, videos, and audio files for fraud, manipulation, and synthetic content.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}
        className="analysis-grid">

        {/* Main Analyzer Panel */}
        <div className="panel" style={{ padding: 24 }}>
          {/* Controls row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-data)' }}>
              Input
            </span>
            <select
              value={deviceId}
              onChange={e => setDeviceId(e.target.value)}
              style={{
                background: 'var(--panel2)', border: '1px solid var(--border)',
                borderRadius: 6, color: 'var(--text2)', fontFamily: 'var(--font-data)',
                fontSize: 11, padding: '5px 10px', outline: 'none', cursor: 'pointer',
              }}
            >
              {DEVICES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>

          {/* Drop zone + textarea */}
          <div
            style={{
              border: `2px dashed ${file ? 'var(--violet)' : 'var(--border)'}`,
              borderRadius: 10, background: file ? 'rgba(139,92,246,0.05)' : 'var(--bg2)',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
          >
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Paste suspicious message, email, or URL here...&#10;Or drop a media file (image, video, audio) below ↓"
              style={{
                width: '100%', minHeight: 160, resize: 'vertical',
                background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text)', fontFamily: 'var(--font-data)',
                fontSize: 13, lineHeight: 1.8, padding: '16px',
                caretColor: 'var(--violet)',
              }}
            />

            {/* Toolbar */}
            <div style={{
              borderTop: '1px solid var(--border)', padding: '10px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="file" ref={fileRef} style={{ display: 'none' }}
                  accept="image/*,video/*,audio/*"
                  onChange={e => { if (e.target.files[0]) { setFile(e.target.files[0]); setMediaResult(null); } }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="btn-cyber btn-cyan"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px' }}
                >
                  <FiUpload /> Attach Media
                </button>
                {file && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)',
                    borderRadius: 6, padding: '5px 10px',
                    fontSize: 11, color: 'var(--violet)', fontFamily: 'var(--font-data)',
                  }}>
                    <FiImage />
                    <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </span>
                    <button onClick={() => setFile(null)}
                      style={{ background: 'none', border: 'none', color: 'var(--violet)', cursor: 'pointer', padding: 0, fontSize: 14 }}>
                      <FiX />
                    </button>
                  </div>
                )}
              </div>
              <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-data)' }}>
                {message.length} chars
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginTop: 12, background: 'rgba(255,61,107,0.08)',
              border: '1px solid rgba(255,61,107,0.25)', borderRadius: 8,
              padding: '10px 14px', fontSize: 12, color: 'var(--red)', fontFamily: 'var(--font-data)',
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            style={{
              marginTop: 16, width: '100%',
              background: analyzing ? 'rgba(139,92,246,0.3)' : 'var(--violet)',
              border: `1px solid ${analyzing ? 'rgba(139,92,246,0.3)' : 'var(--violet)'}`,
              borderRadius: 8, padding: '14px',
              color: '#fff', fontFamily: 'var(--font-mono)',
              fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase',
              fontWeight: 700, cursor: analyzing ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s',
              boxShadow: analyzing ? 'none' : 'var(--glow-violet)',
            }}
          >
            {analyzing
              ? <><FiLoader style={{ animation: 'spin 1s linear infinite' }} /> SCANNING...</>
              : <><FiShield /> ANALYZE THREAT</>
            }
          </button>

          {/* Results */}
          <AnimatePresence>
            {textResult && (
              <motion.div
                key="text-result"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  marginTop: 20,
                  background: textResult.is_fraud ? 'rgba(255,61,107,0.05)' : 'rgba(0,255,148,0.05)',
                  border: `1px solid ${textResult.is_fraud ? 'rgba(255,61,107,0.2)' : 'rgba(0,255,148,0.2)'}`,
                  borderRadius: 10, padding: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {textResult.is_fraud
                      ? <FiAlertTriangle style={{ color: 'var(--red)', fontSize: 16 }} />
                      : <FiCheckCircle style={{ color: 'var(--green)', fontSize: 16 }} />
                    }
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text2)' }}>
                      Text Analysis
                    </span>
                  </div>
                  <span style={{
                    fontSize: 11, fontFamily: 'var(--font-data)', fontWeight: 700,
                    color: textResult.is_fraud ? 'var(--red)' : 'var(--green)',
                    background: textResult.is_fraud ? 'rgba(255,61,107,0.1)' : 'rgba(0,255,148,0.1)',
                    border: `1px solid ${textResult.is_fraud ? 'rgba(255,61,107,0.3)' : 'rgba(0,255,148,0.3)'}`,
                    padding: '3px 10px', borderRadius: 4,
                  }}>
                    {textResult.is_fraud ? 'FRAUD DETECTED' : 'SAFE'} · {textConf}%
                  </span>
                </div>
                <ProgressBar value={textConf} color={textResult.is_fraud ? 'var(--red)' : 'var(--green)'} />
                <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text2)', lineHeight: 1.7, fontFamily: 'var(--font-data)' }}>
                  {textResult.explanation}
                </p>
              </motion.div>
            )}

            {mediaResult && (
              <motion.div
                key="media-result"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  marginTop: 20,
                  background: 'var(--panel2)',
                  border: '1px solid var(--border2)',
                  borderRadius: 10, padding: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text2)' }}>
                    Media Analysis
                  </span>
                  <VerdictBadge verdict={mediaResult.verification.verdict} />
                </div>

                {/* Model scores */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  {[
                    { label: 'Xception CNN', key: 'xception_cnn', color: 'var(--violet)' },
                    { label: 'Vision Transformer', key: 'vision_transformer', color: 'var(--cyan)' },
                    { label: 'rPPG Analyzer', key: 'rppg_analyzer', color: 'var(--green)' },
                    { label: 'Noise Pattern', key: 'noise_pattern_cnn', color: 'var(--amber)' },
                  ].map(m => (
                    <div key={m.key} style={{
                      background: 'var(--panel)', border: '1px solid var(--border)',
                      borderRadius: 8, padding: '12px 14px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 10, color: 'var(--text2)', fontFamily: 'var(--font-data)' }}>{m.label}</span>
                        <span style={{ fontSize: 11, color: m.color, fontFamily: 'var(--font-data)', fontWeight: 700 }}>
                          {(mediaResult.verification.models[m.key] * 100).toFixed(1)}%
                        </span>
                      </div>
                      <ProgressBar value={mediaResult.verification.models[m.key] * 100} color={m.color} />
                    </div>
                  ))}
                </div>

                {/* Layer info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                    <p style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-data)', marginBottom: 8 }}>
                      Layer 1 · Capture
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'var(--font-data)', marginBottom: 4 }}>
                      {mediaResult.capture.device_make} {mediaResult.capture.device_model}
                    </p>
                    <span style={{
                      fontSize: 10, fontFamily: 'var(--font-data)', fontWeight: 700,
                      color: mediaResult.capture.pki_verified ? 'var(--green)' : 'var(--red)',
                    }}>
                      PKI {mediaResult.capture.pki_verified ? '✓ Verified' : '✗ Unverified'}
                    </span>
                  </div>
                  <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                    <p style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-data)', marginBottom: 8 }}>
                      Layer 3 · Ledger
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'var(--font-data)', marginBottom: 4 }}>
                      Block #{mediaResult.ledger.block_index}
                    </p>
                    <span style={{
                      fontSize: 10, fontFamily: 'var(--font-data)', fontWeight: 700,
                      color: mediaResult.ledger.chain_valid ? 'var(--green)' : 'var(--red)',
                    }}>
                      Chain {mediaResult.ledger.chain_valid ? '✓ Valid' : '✗ Invalid'}
                    </span>
                  </div>
                </div>

                {/* Risk factors */}
                {mediaResult.verification.risk_factors.length > 0 && (
                  <div style={{
                    background: 'rgba(255,61,107,0.05)', border: '1px solid rgba(255,61,107,0.2)',
                    borderRadius: 8, padding: '12px 14px',
                  }}>
                    <p style={{ fontSize: 9, color: 'var(--red)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-data)', marginBottom: 8 }}>
                      Risk Factors Identified
                    </p>
                    {mediaResult.verification.risk_factors.map((r, i) => (
                      <p key={i} style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--font-data)', marginBottom: 4, paddingLeft: 12, borderLeft: '2px solid rgba(255,61,107,0.4)' }}>
                        {r}
                      </p>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-data)' }}>
                    Ensemble Confidence: {(mediaResult.verification.ensemble_confidence * 100).toFixed(1)}%
                  </span>
                  <span style={{
                    fontSize: 10, fontFamily: 'var(--font-data)', fontWeight: 700, letterSpacing: '0.1em',
                    color: mediaResult.distribution.trust_score >= 2 ? 'var(--cyan)' : 'var(--amber)',
                    background: mediaResult.distribution.trust_score >= 2 ? 'rgba(0,229,255,0.08)' : 'rgba(255,184,0,0.08)',
                    border: `1px solid ${mediaResult.distribution.trust_score >= 2 ? 'rgba(0,229,255,0.2)' : 'rgba(255,184,0,0.2)'}`,
                    padding: '3px 10px', borderRadius: 4, textTransform: 'uppercase',
                  }}>
                    Trust: {mediaResult.distribution.trust_level}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Side Panel — Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Supported types */}
          <div className="panel" style={{ padding: '18px 20px' }}>
            <p style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-data)', marginBottom: 14 }}>
              Supported Input Types
            </p>
            {[
              { icon: '💬', label: 'Text & Email', desc: 'SMS, WhatsApp, phishing emails' },
              { icon: '🖼️', label: 'Images', desc: 'JPG, PNG, WebP' },
              { icon: '🎥', label: 'Video', desc: 'MP4, MOV, AVI, WebM' },
              { icon: '🎵', label: 'Audio', desc: 'MP3, WAV, OGG' },
            ].map(t => (
              <div key={t.label} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{t.icon}</span>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'var(--font-data)', fontWeight: 600, marginBottom: 1 }}>{t.label}</p>
                  <p style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-data)' }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="panel" style={{ padding: '18px 20px' }}>
            <p style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-data)', marginBottom: 14 }}>
              Detection Pipeline
            </p>
            {[
              { icon: <FiEye />, color: 'var(--cyan)', label: 'Input Capture', desc: 'Hash + device attestation' },
              { icon: <FiCpu />, color: 'var(--violet)', label: 'AI Analysis', desc: 'ML + Llama-3 fusion' },
              { icon: <FiDatabase />, color: 'var(--green)', label: 'Blockchain Ledger', desc: 'Immutable record anchored' },
              { icon: <FiShield />, color: 'var(--amber)', label: 'Verdict', desc: 'Trust score + badge' },
            ].map((step, i) => (
              <div key={step.label} style={{ display: 'flex', gap: 10, marginBottom: i < 3 ? 12 : 0, alignItems: 'flex-start' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6, flexShrink: 0, marginTop: 1,
                  background: `${step.color}15`, border: `1px solid ${step.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: step.color, fontSize: 13,
                }}>
                  {step.icon}
                </div>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'var(--font-data)', fontWeight: 600, marginBottom: 1 }}>{step.label}</p>
                  <p style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-data)' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media(max-width: 768px) { .analysis-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
