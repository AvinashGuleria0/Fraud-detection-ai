import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

import HomePage from './pages/HomePage';
import AnalysisPage from './pages/AnalysisPage';
import VerifyPage from './pages/VerifyPage';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  const [userData, setUserData] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [theme, setTheme] = useState(localStorage.getItem('fg_theme') || 'dark');

  useEffect(() => {
    const stored = localStorage.getItem('fg_user');
    if (stored) setUserData(JSON.parse(stored));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fg_theme', theme);
  }, [theme]);

  const openLogin  = () => { setAuthMode('login');  setShowAuth(true); };
  const openSignup = () => { setAuthMode('signup'); setShowAuth(true); };
  const handleLogout = () => {
    localStorage.removeItem('fg_user');
    setUserData(null);
  };

  return (
    <div>
      <Navbar
        userData={userData}
        onLogin={openLogin}
        onSignup={openSignup}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />

      <Routes>
        <Route path="/"         element={<HomePage  onSignup={openSignup} />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/verify"   element={<VerifyPage />} />
        <Route path="/history"  element={<HistoryPage />} />
        <Route path="/about"    element={<AboutPage />} />
      </Routes>

      <Footer />

      <AnimatePresence>
        {showAuth && (
          <AuthModal
            mode={authMode}
            onClose={() => setShowAuth(false)}
            onSuccess={(user) => {
              setUserData(user);
              setShowAuth(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
