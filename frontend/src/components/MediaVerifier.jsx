import React, { useState, useRef, useEffect } from 'react';
import './MediaVerifier.css';

export default function MediaVerifier() {
  const [file, setFile] = useState(null);
  const [deviceId, setDeviceId] = useState('DEV-ALPHA001');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('VERIFY'); // VERIFY or LEDGER
  const [ledgerData, setLedgerData] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleVerify = async () => {
    if (!file) return;

    setIsVerifying(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('device_id', deviceId);

    try {
      const response = await fetch('http://localhost:8000/api/media/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      fetchLedger();
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  const fetchLedger = async () => {
    try {
      const resp = await fetch('http://localhost:8000/api/media/blockchain');
      if (resp.ok) {
        const data = await resp.json();
        if (data.chain) {
          // Exclude genesis block, just show records
          setLedgerData(data.chain.filter(b => b.index > 0).reverse());
        }
      }
    } catch (err) {
      console.error('Failed to fetch ledger:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'LEDGER') {
      fetchLedger();
    }
  }, [activeTab]);

  return (
    <div className="mv-container">
      <header className="mv-header">
        <div className="mv-logo">
          <div className="mv-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <div className="mv-logo-text">AI Truth <span>Protocol</span></div>
        </div>
        <div className="mv-tabs">
          <button className={`mv-tab ${activeTab === 'VERIFY' ? 'active' : ''}`} onClick={() => setActiveTab('VERIFY')}>Verify Media</button>
          <button className={`mv-tab ${activeTab === 'LEDGER' ? 'active' : ''}`} onClick={() => setActiveTab('LEDGER')}>Ledger</button>
        </div>
      </header>

      {activeTab === 'VERIFY' && (
        <div className="mv-main">
          <div className="mv-upload-section">
            <h2>Verify Digital Media</h2>
            <p className="mv-subtext">4-Layer Hash, Entropy & Origin Check</p>
            
            <div className="mv-controls">
              <label>Simulate Origin Device:</label>
              <select value={deviceId} onChange={e => setDeviceId(e.target.value)}>
                <option value="DEV-ALPHA001">Canon EOS R5 (Certified)</option>
                <option value="DEV-BETA002">Apple iPhone 15 Pro (Certified)</option>
                <option value="DEV-UNKNOWN">Unknown Device (Unverified)</option>
              </select>
            </div>

            <div 
              className={`mv-dropzone ${file ? 'has-file' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? (
                <div className="mv-file-selected">
                  <div className="mv-file-icon">📄</div>
                  <div className="mv-file-name">{file.name}</div>
                  <div className="mv-file-size">{(file.size / 1024).toFixed(2)} KB</div>
                </div>
              ) : (
                <div className="mv-drop-content">
                  <div>Drop media file here or click to browse</div>
                  <div className="mv-small">Supports: JPG, PNG, MP4, MP3</div>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
            
            <button className="mv-verify-btn" onClick={handleVerify} disabled={!file || isVerifying}>
              {isVerifying ? 'Analyzing Metadata...' : 'Run Pipeline'}
            </button>

            {error && <div className="mv-error">{error}</div>}
          </div>

          {result && (
            <div className="mv-result-section">
              <div className={`mv-verdict-box ${result.distribution.trust_score >= 2 ? 'authentic' : result.distribution.trust_score === 1 ? 'suspicious' : 'fake'}`}>
                <h3>{result.distribution.badge}</h3>
                <div className="mv-confidence">AI Confidence: {(result.verification.ensemble_confidence * 100).toFixed(1)}%</div>
              </div>

              <div className="mv-grid">
                <div className="mv-card">
                  <h4>Layer 1: Capture</h4>
                  <div className="mv-row"><span>Device:</span> <span>{result.capture.device_make} {result.capture.device_model}</span></div>
                  <div className="mv-row"><span>Hash:</span> <span className="mv-mono" title={result.capture.content_hash}>{result.capture.content_hash.substring(0, 16)}...</span></div>
                  <div className="mv-row"><span>PKI Verified:</span> <span className={result.capture.pki_verified ? 'text-green' : 'text-red'}>{result.capture.pki_verified ? 'Yes' : 'No'}</span></div>
                </div>
                
                <div className="mv-card">
                  <h4>Layer 2: AI Verification</h4>
                  <div className="mv-row"><span>Spatial Artifacts:</span> <span className="mv-mono">{(result.verification.models.xception_cnn * 100).toFixed(1)}%</span></div>
                  <div className="mv-row"><span>Semantic Consist:</span> <span className="mv-mono">{(result.verification.models.vision_transformer * 100).toFixed(1)}%</span></div>
                  <div className="mv-row"><span>Noise Pattern:</span> <span className="mv-mono">{(result.verification.models.noise_pattern_cnn * 100).toFixed(1)}%</span></div>
                </div>
              </div>

              <div className="mv-card full-width mt-4">
                <h4>Risk Factors</h4>
                {result.verification.risk_factors.length > 0 ? (
                  <ul className="mv-risks">
                    {result.verification.risk_factors.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                ) : (
                  <div className="text-green">No significant risk factors detected in AI analysis.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'LEDGER' && (
        <div className="mv-ledger-main">
          <h2>Immutable Ledger (Simulated)</h2>
          {ledgerData.length === 0 ? (
             <div className="mv-empty-state">No verification records found yet.</div>
          ) : (
            <div className="mv-ledger-list">
              {ledgerData.map((block) => (
                <div key={block.hash} className="mv-ledger-card">
                  <div className="mv-ledger-header">
                    <span className="mv-block-idx">Block #{block.index}</span>
                    <span className="mv-block-time">{new Date(block.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="mv-row"><span>File Hash:</span> <span className="mv-mono">{block.data.content_hash}</span></div>
                  <div className="mv-row"><span>Verdict:</span> <span>{block.data.verdict}</span></div>
                  <div className="mv-row"><span>AI Conf:</span> <span>{(block.data.ai_confidence * 100).toFixed(1)}%</span></div>
                  <div className="mv-row"><span>Block Hash:</span> <span className="mv-mono">{block.hash.substring(0, 20)}...</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}