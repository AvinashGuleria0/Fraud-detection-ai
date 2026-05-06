import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiLoader,
  FiLogOut,
  FiLogIn,
  FiUserPlus,
  FiClock,
  FiLock,
  FiBarChart2,
  FiGlobe,
  FiUpload,
  FiImage,
  FiX,
  FiDatabase
} from 'react-icons/fi';
import { supabase } from './supabaseClient';
import MediaVerifier from './components/MediaVerifier';

const partners = ['Razorpay', 'Twilio', 'Stripe', 'PayPal', 'Visa', 'Mastercard'];

const workflow = [
  {
    id: '01',
    title: 'Paste Suspicious Message',
    detail: 'Drop any SMS, WhatsApp text, or email snippet into the analyzer panel.',
    tone: 'bg-emerald-100/70 border-emerald-200',
  },
  {
    id: '02',
    title: 'Run Hybrid Detection',
    detail: 'Custom ML score and Llama explanation run together to classify threat intent.',
    tone: 'bg-violet-100/70 border-violet-200',
  },
  {
    id: '03',
    title: 'Act With Confidence',
    detail: 'View risk score, why it was flagged, and persist audit history to Supabase.',
    tone: 'bg-amber-100/70 border-amber-200',
  },
];

const features = [
  {
    icon: FiBarChart2,
    title: 'Live Risk Visibility',
    text: 'Confidence-based fraud score from your in-house custom ML pipeline.',
  },
  {
    icon: FiClock,
    title: 'Instant Response',
    text: 'Near real-time analysis suited for support desks and fintech ops teams.',
  },
  {
    icon: FiLock,
    title: 'Secure Event Logging',
    text: 'Per-user message history persisted through Supabase auth and row policies.',
  },
  {
    icon: FiGlobe,
    title: 'Explainable AI Layer',
    text: 'Groq-hosted Llama response explains risk in plain language for quick action.',
  },
];

const trustCards = [
  {
    quote: 'Stopped a fake KYC request before it reached our call center queue.',
    author: 'Priya S, Fraud Analyst',
    tone: 'bg-violet-100/80 border-violet-200',
  },
  {
    quote: 'The explanation text helped non-technical agents understand alert quality.',
    author: 'Rahul M, Operations Lead',
    tone: 'bg-pink-100/80 border-pink-200',
  },
  {
    quote: 'We now triage suspicious messages in seconds instead of manual review.',
    author: 'Amit K, Security Team',
    tone: 'bg-emerald-100/80 border-emerald-200',
  },
  {
    quote: 'Useful confidence + explanation combo for customer escalations and reports.',
    author: 'Nisha P, Compliance',
    tone: 'bg-amber-100/80 border-amber-200',
  },
];

function App() {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [deviceId, setDeviceId] = useState('DEV-ALPHA001');
  const [analyzing, setAnalyzing] = useState(false);
  const [textResult, setTextResult] = useState(null);
  const [mediaResult, setMediaResult] = useState(null);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [ledgerData, setLedgerData] = useState([]);
  
  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');

  const fileInputRef = useRef(null);

  const fetchLedger = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const resp = await fetch(`${apiUrl}/api/media/blockchain`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.chain) {
          setLedgerData(data.chain.filter(b => b.index > 0).reverse());
        }
      }
    } catch (err) {
      console.error('Failed to fetch ledger:', err);
    }
  };

  useEffect(() => {
    fetchLedger();
    
    // Check for local session
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMediaResult(null);
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setMediaResult(null);
      setError('');
    }
  };

  const handleAnalyze = async () => {
    console.log('🚀 handleAnalyze called');
    
    if (!message.trim() && !file) {
      console.log('❌ Message and file are empty, showing error');
      setError('Please paste a message or attach a file to analyze.');
      return;
    }

    setError('');
    setAnalyzing(true);
    setTextResult(null);
    setMediaResult(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const promises = [];

      if (message.trim()) {
        const textPromise = axios.post(`${apiUrl}/predict`, { message })
          .then(async (response) => {
            const data = response.data;
            setTextResult(data);

            if (user && supabase) {
              const insertPayload = {
                user_id: user.id,
                original_sms_text: message,
                ml_confidence_score: data.confidence_score,
                is_fraud: data.is_fraud,
                llm_explanation: data.explanation,
              };
              const { error: insertError } = await supabase.from('messages').insert([insertPayload]);
              if (insertError) console.log('⚠️ Supabase insert error:', insertError);
            }
          });
        promises.push(textPromise);
      }

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('device_id', deviceId);

        const mediaPromise = axios.post(`${apiUrl}/api/media/analyze`, formData)
          .then(response => {
            setMediaResult(response.data);
            fetchLedger();
          });
        promises.push(mediaPromise);
      }

      await Promise.all(promises);

    } catch (err) {
      console.error('❌ Error in handleAnalyze:', err);
      setError(err.response?.data?.detail || err.message || 'Analysis failed. Ensure backend is running.');
    } finally {
      console.log('🏁 Analysis complete, setting analyzing to false');
      setAnalyzing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    setUserData(null);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    // Simple LocalStorage-only Auth Logic
    if (authMode === 'login') {
      const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const user = storedUsers.find(u => u.email === authEmail && u.password === authPassword);
      
      if (user) {
        const userObj = { email: user.email, name: user.name };
        localStorage.setItem('userData', JSON.stringify(userObj));
        setUserData(userObj);
        setShowAuthModal(false);
        setAuthEmail('');
        setAuthPassword('');
      } else {
        setAuthError('Invalid email or password.');
      }
    } else {
      if (authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }
    
    const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    if (storedUsers.some(u => u.email === authEmail)) {
      setAuthError('Email already registered. Try logging in.');
      return;
    }

    const newUser = { email: authEmail, password: authPassword, name: authName };
    storedUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(storedUsers));
    
    const userObj = { email: authEmail, name: authName };
    localStorage.setItem('userData', JSON.stringify(userObj));
    setUserData(userObj);
    setShowAuthModal(false);
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
  }
};

  const confidence = Math.max(0, Math.min(100, Number(textResult?.confidence_score || 0)));

  return (
    <div className="min-h-screen text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-violet-600/10 p-2 text-violet-700">
              <FiShield className="text-xl" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 md:text-2xl">FraudGuard AI</h1>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Smart Message Defense</p>
            </div>
          </div>

          {userData ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-700 font-bold text-xs shadow-sm">
                  {userData.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="text-sm font-semibold text-slate-700">Hi, {userData.name || "User"}</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <FiLogOut /> Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <FiLogIn /> Log in
              </button>
              <button
                onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500"
              >
                <FiUserPlus /> Sign up
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 md:px-6 md:pt-12">
        <section className="grid items-start gap-8 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <p className="inline-flex items-center rounded-full border border-violet-200 bg-violet-100/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-violet-700">
              Hybrid AI Engine Active
            </p>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl">
              Analyze every suspicious text
              <span className="block text-violet-600">and media file instantly.</span>
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
              Control your fraud workflow from a single dashboard. Paste unknown messages, drop media files, detect risk instantly, and store explainable decisions for audit trails.
            </p>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Trusted integrations</p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center sm:grid-cols-6">
                {partners.map((name) => (
                  <div key={name} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-semibold text-slate-500">
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.06 }}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.3)]"
          >
            <div className="mb-3 flex items-end justify-between">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">Multimodal Analyzer</p>
              <div className="flex gap-2 text-xs font-medium text-slate-500">
                <span className="rounded-md bg-slate-100 px-2 py-1">{message.length} chars</span>
                <select 
                  value={deviceId} 
                  onChange={e => setDeviceId(e.target.value)}
                  className="rounded-md bg-slate-100 outline-none border border-transparent focus:border-violet-300 py-1"
                >
                  <option value="DEV-ALPHA001">Device: Canon EOS R5</option>
                  <option value="DEV-BETA002">Device: iPhone 15 Pro</option>
                  <option value="DEV-UNKNOWN">Device: Unknown</option>
                </select>
              </div>
            </div>

            <div 
              className={`relative rounded-2xl border-2 border-dashed ${file ? 'border-violet-400 bg-violet-50/30' : 'border-slate-200 bg-slate-50'} transition-colors focus-within:border-violet-400`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Paste suspicious text here, or drop a media file..."
                className="min-h-[160px] w-full resize-y bg-transparent p-4 text-base leading-relaxed text-slate-700 outline-none"
              />
              
              <div className="flex items-center justify-between border-t border-slate-200/60 bg-white/50 p-3">
                <div className="flex items-center gap-3">
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                     <FiUpload /> Attach Media
                  </button>
                  {file && (
                    <div className="flex items-center gap-2 rounded-lg bg-violet-100 px-3 py-1.5 text-sm font-semibold text-violet-700">
                      <FiImage />
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="hover:text-violet-900 ml-1">
                        <FiX />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600">{error}</p> : null}
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-base font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {analyzing ? (
                  <>
                    <FiLoader className="animate-spin" /> Scanning Message...
                  </>
                ) : (
                  <>
                    Analyze Threat <FiShield />
                  </>
                )}
              </button>
            </div>

            <AnimatePresence>
              {textResult ? (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-slate-500">
                      {textResult.is_fraud ? <FiAlertTriangle className="text-rose-500" /> : <FiCheckCircle className="text-emerald-500" />}
                      {textResult.is_fraud ? 'Text Fraud Detected' : 'Text Looks Safe'}
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${textResult.is_fraud ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {confidence}% Confidence
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${textResult.is_fraud ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${confidence}%` }}
                    />
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{textResult.explanation}</p>
                </motion.div>
              ) : null}

              {mediaResult ? (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  {/* Detailed Media Analysis Result Header */}
                  <div className="flex flex-col gap-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-slate-500">
                        {mediaResult.distribution.trust_score < 2 ? <FiAlertTriangle className="text-amber-500" /> : <FiCheckCircle className="text-emerald-500" />}
                        Media Verdict
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                          mediaResult.distribution.trust_score < 2
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {mediaResult.distribution.badge}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold uppercase tracking-[0.15em] text-slate-500">
                        AI Confidence
                      </div>
                      <span className="text-sm font-black text-slate-900">
                        {(mediaResult.verification.ensemble_confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Layer 1: Capture Details */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                      <p className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-2.5">
                        Layer 1: Capture
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Device:</span>
                          <span className="font-semibold text-slate-700 truncate max-w-[120px]" title={`${mediaResult.capture.device_make} ${mediaResult.capture.device_model}`}>
                            {mediaResult.capture.device_make} {mediaResult.capture.device_model}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">PKI:</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              mediaResult.capture.pki_verified
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-rose-50 text-rose-600 border border-rose-100"
                            }`}
                          >
                            {mediaResult.capture.pki_verified ? "Verified" : "Unverified"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Layer 2: AI Verify Details */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                      <p className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-2.5">
                        Layer 2: AI Verify
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Spatial:</span>
                          <span className="font-semibold text-slate-700">
                            {(mediaResult.verification.models.xception_cnn * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Noise:</span>
                          <span className="font-semibold text-slate-700">
                            {(mediaResult.verification.models.noise_pattern_cnn * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {mediaResult.verification.risk_factors.length > 0 && (
                    <div className="mt-4 bg-rose-50/70 p-3.5 rounded-xl border border-rose-100">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-rose-800 mb-2">
                        Risk Factors Identified
                      </p>
                      <ul className="text-xs text-rose-600 space-y-1.5 list-none">
                        {mediaResult.verification.risk_factors.map((r, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1 h-1 w-1 rounded-full bg-rose-400 flex-shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </section>

        <section className="mt-14">
          <div className="mb-6 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Workflow</p>
            <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Smarter fraud checks in 3 steps</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {workflow.map((step, index) => (
              <motion.article
                key={step.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                className={`rounded-2xl border p-5 ${step.tone}`}
              >
                <p className="text-2xl font-black text-slate-500">{step.id}</p>
                <h4 className="mt-2 text-lg font-extrabold text-slate-900">{step.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.detail}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Capabilities</p>
            <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Key features that power your detection</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {features.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-violet-100 p-2 text-violet-700">
                      <Icon />
                    </span>
                    <h4 className="text-lg font-extrabold text-slate-900">{item.title}</h4>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Detection Accuracy', value: '96%' },
            { label: 'False Positive Drop', value: '35%' },
            { label: 'Messages Reviewed', value: '5K+' },
            { label: 'Response Time', value: '< 120ms' },
          ].map((stat) => (
            <article key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
              <p className="text-3xl font-extrabold text-violet-600">{stat.value}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{stat.label}</p>
            </article>
          ))}
        </section>

        <section className="mt-14">
          <div className="mb-6 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">User feedback</p>
            <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Trusted by fraud response teams</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {trustCards.map((card) => (
              <article key={card.author} className={`rounded-2xl border p-5 ${card.tone}`}>
                <p className="text-sm leading-relaxed text-slate-700">{card.quote}</p>
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{card.author}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Compliance ready</p>
            <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Certified and globally aligned</h3>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {['ISO 9001', 'ISO 27001', 'SOC 2 Style', 'GDPR Aware'].map((cert) => (
              <div key={cert} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                <div className="mx-auto mb-3 h-14 w-14 rounded-full border-4 border-violet-200 bg-violet-50" />
                <p className="text-sm font-extrabold text-slate-800">{cert}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
          <div className="text-center flex justify-center items-center gap-3">
            <FiDatabase className="text-xl text-slate-500" />
            <h3 className="text-3xl font-extrabold tracking-tight text-slate-900">Immutable Media Ledger</h3>
          </div>
          <div className="mt-6 font-mono text-xs">
            {ledgerData.length === 0 ? (
              <div className="text-center text-slate-500 py-10 bg-slate-50 rounded-xl border border-slate-100">No media verifications recorded.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {ledgerData.map((block) => (
                  <div key={block.hash} className="p-4 bg-slate-900 text-slate-300 rounded-xl flex flex-col gap-1 overflow-x-auto shadow-inner">
                    <div className="flex justify-between items-center text-emerald-400 mb-2 border-b border-slate-700 pb-2">
                      <span>Block #{block.index}</span>
                      <span>{new Date(block.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-[100px_1fr] gap-2">
                      <span className="text-slate-500">Hash:</span> <span className="truncate" title={block.data.content_hash}>{block.data.content_hash}</span>
                      <span className="text-slate-500">Verdict:</span> <span className="text-white">{block.data.verdict}</span>
                      <span className="text-slate-500">AI Conf:</span> <span className="text-white">{(block.data.ai_confidence * 100).toFixed(1)}%</span>
                      <span className="text-slate-500">Block Hash:</span> <span className="text-slate-400 truncate text-[10px]">{block.hash}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Auth Modal Overlay */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <FiX className="text-xl" />
              </button>
              
              <div className="p-6 md:p-8">
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <FiShield className="text-2xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {authMode === 'login' ? 'Welcome back' : 'Create an account'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {authMode === 'login' 
                      ? 'Enter your details to access your dashboard' 
                      : 'Join FraudGuard AI to start protecting your users'
                    }
                  </p>
                </div>

                <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
                  {authError && (
                    <div className="rounded-lg bg-rose-50 p-3 text-sm font-medium text-rose-600 border border-rose-200">
                      {authError}
                    </div>
                  )}

                  {authMode === 'signup' && (
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">Full Name</label>
                      <input
                        type="text"
                        required={authMode === 'signup'}
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                        placeholder="John Doe"
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      placeholder="name@company.com"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-2 w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-500"
                  >
                    {authMode === 'login' ? 'Sign in to account' : 'Create account'}
                  </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                  {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={() => {
                      setAuthMode(authMode === 'login' ? 'signup' : 'login');
                      setAuthError('');
                    }}
                    className="font-bold text-violet-600 hover:text-violet-700 hover:underline"
                  >
                    {authMode === 'login' ? 'Sign up' : 'Log in'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
