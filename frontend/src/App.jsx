import { useState, useEffect } from 'react';
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
} from 'react-icons/fi';
import { supabase } from './supabaseClient';

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
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('🔐 Auth useEffect running');
    
    if (!supabase) {
      console.log('❌ Supabase not configured');
      return;
    }

    console.log('🔍 Checking current session...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📊 Current session:', session ? `User: ${session.user.email}` : 'No session');
      setUser(session?.user ?? null);
    });

    console.log('👁️ Setting up auth state change listener');
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔄 Auth state changed, event:', _event);
      console.log('👤 New user:', session?.user?.email || 'No user');
      setUser(session?.user ?? null);
    });

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const handleAnalyze = async () => {
    console.log('🚀 handleAnalyze called');
    
    if (!message.trim()) {
      console.log('❌ Message is empty, showing error');
      setError('Please paste a message to analyze.');
      return;
    }

    console.log('📝 Message to analyze:', message);
    setError('');
    setAnalyzing(true);
    setResult(null);

    try {
      console.log('🌐 Sending POST request to http://127.0.0.1:8000/predict');
      console.log('📦 Payload:', { message });
      
      const response = await axios.post('http://127.0.0.1:8000/predict', { message });
      
      console.log('✅ Received response from backend:', response.status);
      console.log('📊 Response data:', response.data);
      
      const data = response.data;
      
      console.log('🎯 Setting result with confidence_score:', data.confidence_score);
      console.log('🚨 is_fraud:', data.is_fraud);
      console.log('💬 explanation:', data.explanation);
      
      setResult(data);

      if (user && supabase) {
        console.log('💾 User is authenticated, saving to Supabase');
        console.log('👤 User ID:', user.id);
        
        const insertPayload = {
          user_id: user.id,
          original_sms_text: message,
          ml_confidence_score: data.confidence_score,
          is_fraud: data.is_fraud,
          llm_explanation: data.explanation,
        };
        
        console.log('📤 Supabase insert payload:', insertPayload);
        
        const { error: insertError } = await supabase.from('messages').insert([insertPayload]);
        
        if (insertError) {
          console.log('⚠️ Supabase insert error (table might not exist):', insertError);
        } else {
          console.log('✅ Successfully saved message to Supabase');
        }
      } else {
        console.log('ℹ️ User not authenticated or Supabase not configured, skipping save');
      }
    } catch (err) {
      console.error('❌ Error in handleAnalyze:', err);
      console.error('📋 Full error object:', err);
      
      if (err.response) {
        console.error('🔴 Backend returned error status:', err.response.status);
        console.error('📄 Error response data:', err.response.data);
      } else if (err.request) {
        console.error('🔴 Request made but no response received:', err.request);
      } else {
        console.error('🔴 Error setting up request:', err.message);
      }
      
      setError(err.response?.data?.detail || 'Failed to analyze message. Ensure backend is running.');
    } finally {
      console.log('🏁 Analysis complete, setting analyzing to false');
      setAnalyzing(false);
    }
  };

  const handleAuth = async (isLogin) => {
    console.log(`🔑 handleAuth called with isLogin=${isLogin}`);
    
    if (!supabase) {
      console.log('❌ Supabase not configured');
      alert('Supabase credentials missing in frontend/.env');
      return;
    }

    const email = prompt('Enter Email:');
    if (!email) {
      console.log('ℹ️ Email prompt cancelled');
      return;
    }
    
    console.log('📧 Email entered:', email);

    const password = prompt('Enter Password:');
    if (!password) {
      console.log('ℹ️ Password prompt cancelled');
      return;
    }
    
    console.log('🔒 Password entered (length:', password.length, ')');

    if (isLogin) {
      console.log('🔓 Attempting login...');
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (loginError) {
        console.error('❌ Login error:', loginError.message);
        alert(loginError.message);
      } else {
        console.log('✅ Login successful for:', email);
      }
    } else {
      console.log('📝 Attempting signup...');
      const { error: signupError } = await supabase.auth.signUp({ email, password });
      
      if (signupError) {
        console.error('❌ Signup error:', signupError.message);
        alert(signupError.message);
      } else {
        console.log('✅ Signup successful for:', email);
        alert('Check your email for a confirmation link!');
      }
    }
  };

  const confidence = Math.max(0, Math.min(100, Number(result?.confidence_score || 0)));

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

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm font-medium text-slate-500 md:inline">{user.email}</span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <FiLogOut /> Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAuth(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <FiLogIn /> Log in
              </button>
              <button
                onClick={() => handleAuth(false)}
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
              <span className="block text-violet-600">before it becomes loss.</span>
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
              Control your fraud workflow from a single dashboard. Paste unknown messages, detect risk instantly, and store explainable decisions for audit trails.
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
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">Message Analyzer</p>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">{message.length} chars</span>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Example: URGENT! Your KYC expired. Click this link to avoid account block..."
              className="min-h-[180px] w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base leading-relaxed text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />

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
              {result ? (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-slate-500">
                      {result.is_fraud ? <FiAlertTriangle className="text-rose-500" /> : <FiCheckCircle className="text-emerald-500" />}
                      {result.is_fraud ? 'Fraud Signal Detected' : 'Message Looks Safe'}
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${result.is_fraud ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {confidence}% Confidence
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${result.is_fraud ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${confidence}%` }}
                    />
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{result.explanation}</p>
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
      </main>
    </div>
  );
}

export default App;
