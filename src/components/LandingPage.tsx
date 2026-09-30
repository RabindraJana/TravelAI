/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthUser } from '../types';
import {
  ADMIN_EMAIL,
  ADMIN_USER,
  DEFAULT_TRAVELER_USER,
  isAdminEmail,
  loginWithGmail,
  loginWithPassword,
  registerUserWithPassword,
  resetPassword,
  setUserLoggedIn,
} from '../utils/authStorage';

interface LandingPageProps {
  onLoginSuccess: (user: AuthUser) => void;
  onExploreAsGuest: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginSuccess,
  onExploreAsGuest,
  onShowToast,
}) => {
  const [viewMode, setViewMode] = useState<'landing' | 'login'>('landing');
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign up form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupHomeCity, setSignupHomeCity] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [signupAgreeTerms, setSignupAgreeTerms] = useState(true);

  // Status & feedback
  const [formError, setFormError] = useState<string | null>(null);
  const [formNotice, setFormNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password drawer / modal
  const [showForgotBox, setShowForgotBox] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPass, setResetNewPass] = useState('');
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  const [activeCorridorTab, setActiveCorridorTab] = useState<'jharkhand' | 'bengal'>('jharkhand');

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: 'Empty', score: 0, color: 'bg-gray-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { label: 'Weak (min 6 characters)', score: 25, color: 'bg-rose-500' };
    if (score === 2) return { label: 'Fair', score: 50, color: 'bg-amber-500' };
    if (score === 3) return { label: 'Good', score: 75, color: 'bg-emerald-500' };
    return { label: 'Strong', score: 100, color: 'bg-[#00685f]' };
  };

  const handlePerformGmailLogin = (email: string, name?: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      const normalized = (email || '').trim().toLowerCase();
      const isAdmin = isAdminEmail(normalized);

      const result = loginWithGmail({
        email: normalized,
        name: name || (isAdmin ? 'Rabindra Jana' : 'Explorer Traveler'),
        avatar: isAdmin ? ADMIN_USER.avatar : DEFAULT_TRAVELER_USER.avatar,
      });

      setUserLoggedIn(true);
      onShowToast(
        isAdmin ? 'Admin & Host Access Granted 🌟' : 'Welcome to Travel AI! 🎒',
        isAdmin
          ? `Logged in as Founder Rabindra Jana (${ADMIN_EMAIL}). Verification Desk & Full App unlocked.`
          : `Logged in as ${result.user.name}. Full access to trip planner, journal, and community unlocked!`,
        'success'
      );
      setIsSubmitting(false);
      onLoginSuccess(result.user);
    }, 450);
  };

  const handlePasswordLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormNotice(null);

    const email = loginEmail.trim();
    if (!email) {
      setFormError('Please enter your email address.');
      return;
    }
    if (!loginPassword) {
      setFormError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = loginWithPassword(email, loginPassword);
      if (result.success && result.user) {
        setUserLoggedIn(true);
        onShowToast(
          result.user.isAdmin ? 'Admin & Host Access Granted 🌟' : 'Welcome Back! 🎒',
          result.message || `Logged in as ${result.user.name}. Full access unlocked!`,
          'success'
        );
        setIsSubmitting(false);
        onLoginSuccess(result.user);
      } else {
        setIsSubmitting(false);
        setFormError(result.message || 'Login failed. Please verify your credentials.');
        onShowToast('Login Failed', result.message, 'warning');
      }
    }, 350);
  };

  const handlePasswordSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormNotice(null);

    const name = signupName.trim();
    const email = signupEmail.trim();
    if (!name) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!email) {
      setFormError('Please enter your email address.');
      return;
    }
    if (!signupPassword) {
      setFormError('Please enter a secure password.');
      return;
    }
    if (signupPassword.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setFormError('Passwords do not match. Please re-enter.');
      return;
    }
    if (!signupAgreeTerms) {
      setFormError('Please agree to the community peer mediation code of conduct.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = registerUserWithPassword({
        name,
        email,
        password: signupPassword,
        homeCity: signupHomeCity,
      });

      if (result.success && result.user) {
        setUserLoggedIn(true);
        onShowToast(
          'Account Created! 🎉',
          result.message || `Welcome ${result.user.name}! Your account is now active.`,
          'success'
        );
        setIsSubmitting(false);
        onLoginSuccess(result.user);
      } else {
        setIsSubmitting(false);
        setFormError(result.message || 'Sign up failed. Please try again.');
        onShowToast('Sign Up Failed', result.message, 'warning');
      }
    }, 400);
  };

  const handleFillDemo = (email: string, pass: string) => {
    setAuthTab('login');
    setLoginEmail(email);
    setLoginPassword(pass);
    setFormError(null);
    setFormNotice(`Credentials autofilled: ${email}. Click "Log In with Password" below.`);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetMsg('Please enter your registered email.');
      return;
    }
    if (!resetNewPass || resetNewPass.length < 6) {
      setResetMsg('New password must be at least 6 characters.');
      return;
    }
    const res = resetPassword(resetEmail, resetNewPass);
    setResetMsg(res.message);
    if (res.success) {
      setLoginEmail(resetEmail.trim());
      setLoginPassword(resetNewPass);
      setFormNotice('Password updated! You can now log in.');
      setTimeout(() => setShowForgotBox(false), 1400);
    }
  };

  const scrollToSection = (sectionId: string) => {
    if (viewMode === 'login') {
      setViewMode('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --------------------------------------------------------------------------
  // SHARED REUSABLE AUTH BOX (Log In / Sign Up with Passwords)
  // --------------------------------------------------------------------------
  const renderAuthBox = (isStandalone: boolean) => {
    const strength = getPasswordStrength(signupPassword);
    const passwordsMatch =
      signupPassword && signupConfirmPassword && signupPassword === signupConfirmPassword;

    return (
      <div
        className={`bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#eaedff] space-y-5 ${
          isStandalone ? 'max-w-md w-full' : ''
        }`}
      >
        {/* Card Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#00685f] text-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[26px]">
              {authTab === 'login' ? 'lock_open' : 'person_add'}
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#131b2e] tracking-tight">
            {authTab === 'login' ? 'Sign In to Travel AI' : 'Create Traveler Account'}
          </h2>
          <p className="text-xs text-[#5f6368] leading-relaxed">
            {authTab === 'login'
              ? 'Enter your registered email and password to access the application.'
              : 'Sign up to connect with verified travelers across Indian Railways.'}
          </p>
        </div>

        {/* Tab Switcher: Log In vs Sign Up */}
        <div className="flex rounded-2xl bg-[#faf8ff] p-1 border border-[#eaedff]">
          <button
            type="button"
            onClick={() => {
              setAuthTab('login');
              setFormError(null);
              setFormNotice(null);
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authTab === 'login'
                ? 'bg-white text-[#00685f] shadow-xs border border-[#eaedff]'
                : 'text-gray-500 hover:text-[#131b2e]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">login</span>
            <span>Log In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthTab('signup');
              setFormError(null);
              setFormNotice(null);
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authTab === 'signup'
                ? 'bg-white text-[#00685f] shadow-xs border border-[#eaedff]'
                : 'text-gray-500 hover:text-[#131b2e]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">person_add</span>
            <span>Sign Up</span>
          </button>
        </div>

        {/* Dynamic Alerts */}
        {formError && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <span className="material-symbols-outlined text-rose-600 text-[18px] shrink-0 mt-0.5">
              error
            </span>
            <div className="flex-1 font-medium">{formError}</div>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="text-rose-400 hover:text-rose-700 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {formNotice && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">
              check_circle
            </span>
            <div className="flex-1 font-medium">{formNotice}</div>
            <button
              type="button"
              onClick={() => setFormNotice(null)}
              className="text-emerald-400 hover:text-emerald-700 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* ---------------- LOGIN TAB CONTENT ---------------- */}
        {authTab === 'login' && (
          <div className="space-y-4">
            {/* Quick Demo Accounts Chips */}
            <div className="p-2.5 rounded-2xl bg-[#faf8ff] border border-[#eaedff] space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
                <span>Demo Accounts (Click to autofill):</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo(ADMIN_EMAIL, 'password123')}
                  className="p-2 rounded-xl bg-white hover:bg-[#00685f]/5 border border-[#eaedff] text-left transition-all cursor-pointer flex items-center gap-2"
                >
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                    alt="Rabindra"
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-[#00685f]/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-[#131b2e] truncate">Admin (Rabindra)</div>
                    <div className="text-[10px] text-[#00685f] font-mono truncate">pass: password123</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo('priya.traveler@gmail.com', 'password123')}
                  className="p-2 rounded-xl bg-white hover:bg-[#00685f]/5 border border-[#eaedff] text-left transition-all cursor-pointer flex items-center gap-2"
                >
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
                    alt="Priya"
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-[#eaedff] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-[#131b2e] truncate">Traveler (Priya)</div>
                    <div className="text-[10px] text-gray-500 font-mono truncate">pass: password123</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handlePasswordLoginSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#131b2e] block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. askrabindrajana@gmail.com"
                    className="w-full h-11 pl-10 pr-3.5 bg-[#faf8ff] rounded-xl text-xs sm:text-sm text-[#131b2e] outline-none border border-[#eaedff] focus:border-[#00685f] transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#131b2e]">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotBox(!showForgotBox)}
                    className="text-[11px] font-semibold text-[#00685f] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
                    lock
                  </span>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-11 pl-10 pr-11 bg-[#faf8ff] rounded-xl text-xs sm:text-sm text-[#131b2e] outline-none border border-[#eaedff] focus:border-[#00685f] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      {showLoginPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Forgot Password Helper Box */}
              {showForgotBox && (
                <div className="p-3.5 rounded-2xl bg-[#faf8ff] border border-[#eaedff] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#131b2e]">Reset Password Helper</span>
                    <button
                      type="button"
                      onClick={() => setShowForgotBox(false)}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-[#5f6368] leading-relaxed">
                    Default demo password is <code className="font-bold text-[#00685f]">password123</code> (Admin Rabindra also accepts <code className="font-bold text-[#00685f]">jana2026</code>). Enter your email and new password below to reset:
                  </p>
                  <div className="space-y-2 pt-1">
                    <input
                      type="email"
                      placeholder="Your registered email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full h-9 px-3 bg-white rounded-lg text-xs border border-[#eaedff] outline-none focus:border-[#00685f]"
                    />
                    <input
                      type="password"
                      placeholder="New password (min 6 characters)"
                      value={resetNewPass}
                      onChange={(e) => setResetNewPass(e.target.value)}
                      className="w-full h-9 px-3 bg-white rounded-lg text-xs border border-[#eaedff] outline-none focus:border-[#00685f]"
                    />
                    <button
                      type="button"
                      onClick={handleResetPasswordSubmit}
                      className="w-full py-2 bg-[#00685f] hover:bg-[#00534c] text-white rounded-lg text-xs font-bold cursor-pointer transition-all"
                    >
                      Update Password
                    </button>
                    {resetMsg && (
                      <div className="text-[11px] font-medium text-[#00685f]">{resetMsg}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[#3d4947]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#00685f] accent-[#00685f]"
                  />
                  <span>Remember my session</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#00685f] hover:bg-[#00534c] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[19px]">login</span>
                <span>{isSubmitting ? 'Verifying Credentials...' : 'Log In with Password'}</span>
              </button>
            </form>
          </div>
        )}

        {/* ---------------- SIGN UP TAB CONTENT ---------------- */}
        {authTab === 'signup' && (
          <form onSubmit={handlePasswordSignUpSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-[#131b2e] block mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
                  person
                </span>
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full h-11 pl-10 pr-3.5 bg-[#faf8ff] rounded-xl text-xs sm:text-sm text-[#131b2e] outline-none border border-[#eaedff] focus:border-[#00685f] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#131b2e] block mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
                  mail
                </span>
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full h-11 pl-10 pr-3.5 bg-[#faf8ff] rounded-xl text-xs sm:text-sm text-[#131b2e] outline-none border border-[#eaedff] focus:border-[#00685f] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#131b2e] block mb-1">
                Home City &amp; State <span className="text-gray-400 text-[10px] font-normal">(optional)</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
                  location_on
                </span>
                <input
                  type="text"
                  value={signupHomeCity}
                  onChange={(e) => setSignupHomeCity(e.target.value)}
                  placeholder="e.g. Medinipur, West Bengal or Ranchi, Jharkhand"
                  className="w-full h-11 pl-10 pr-3.5 bg-[#faf8ff] rounded-xl text-xs sm:text-sm text-[#131b2e] outline-none border border-[#eaedff] focus:border-[#00685f] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#131b2e] block mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
                  lock
                </span>
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full h-11 pl-10 pr-11 bg-[#faf8ff] rounded-xl text-xs sm:text-sm text-[#131b2e] outline-none border border-[#eaedff] focus:border-[#00685f] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  <span className="material-symbols-outlined text-[19px]">
                    {showSignupPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {/* Password Strength Indicator */}
              {signupPassword && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="text-gray-500">Strength:</span>
                    <span className="font-bold text-[#131b2e]">{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-[#131b2e] block mb-1">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
                  lock_reset
                </span>
                <input
                  type={showSignupConfirmPassword ? 'text' : 'password'}
                  required
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full h-11 pl-10 pr-11 bg-[#faf8ff] rounded-xl text-xs sm:text-sm text-[#131b2e] outline-none border border-[#eaedff] focus:border-[#00685f] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                  aria-label="Toggle confirm password visibility"
                >
                  <span className="material-symbols-outlined text-[19px]">
                    {showSignupConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {signupConfirmPassword && (
                <div className="mt-1 flex items-center gap-1 text-[11px]">
                  {passwordsMatch ? (
                    <span className="text-[#006947] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check</span> Passwords match
                    </span>
                  ) : (
                    <span className="text-rose-500 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">close</span> Passwords do not match
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Peer Code Agreement */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 text-xs cursor-pointer select-none text-[#3d4947]">
                <input
                  type="checkbox"
                  required
                  checked={signupAgreeTerms}
                  onChange={(e) => setSignupAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#00685f] accent-[#00685f] shrink-0"
                />
                <span className="leading-snug text-[11.5px]">
                  I agree to the <strong>Travelers Helping Travelers</strong> peer code: zero commercial agency spam, mutual respect, and optional Government ID verification for trust.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#00685f] hover:bg-[#00534c] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[19px]">person_add</span>
              <span>{isSubmitting ? 'Creating Your Account...' : 'Create Account & Start Exploring'}</span>
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative flex items-center justify-center pt-1">
          <div className="border-t border-[#eaedff] w-full" />
          <span className="bg-white px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider absolute">
            or 1-click continue
          </span>
        </div>

        {/* Google 1-Click Option */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handlePerformGmailLogin('priya.traveler@gmail.com', 'Priya Sharma')}
          className="w-full py-3 px-4 rounded-xl bg-white border border-[#eaedff] hover:border-[#00685f] text-[#131b2e] font-bold text-xs sm:text-sm shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google / Gmail</span>
        </button>

        {/* Switch mode footer link */}
        <div className="text-center pt-1 text-xs">
          {authTab === 'login' ? (
            <span className="text-[#5f6368]">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthTab('signup');
                  setFormError(null);
                  setFormNotice(null);
                }}
                className="font-bold text-[#00685f] hover:underline cursor-pointer"
              >
                Sign Up free →
              </button>
            </span>
          ) : (
            <span className="text-[#5f6368]">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthTab('login');
                  setFormError(null);
                  setFormNotice(null);
                }}
                className="font-bold text-[#00685f] hover:underline cursor-pointer"
              >
                Log In with password →
              </button>
            </span>
          )}
        </div>

        {/* Standalone View Link & Guest Preview */}
        <div className="flex items-center justify-between pt-2 border-t border-[#eaedff] text-xs">
          {!isStandalone ? (
            <button
              type="button"
              onClick={() => setViewMode('login')}
              className="text-[#00685f] hover:underline font-semibold cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">open_in_full</span>
              <span>Open Dedicated Page</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setViewMode('landing')}
              className="text-[#00685f] hover:underline font-semibold cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              <span>Back to Landing Page</span>
            </button>
          )}

          <button
            type="button"
            onClick={onExploreAsGuest}
            className="text-[#717b79] hover:text-[#131b2e] font-semibold cursor-pointer"
          >
            Preview as Guest →
          </button>
        </div>
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // STANDALONE DEDICATED LOGIN VIEW ("and then a login page")
  // --------------------------------------------------------------------------
  if (viewMode === 'login') {
    return (
      <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex flex-col justify-between">
        {/* Simple Top Bar */}
        <header className="h-16 px-6 border-b border-[#eaedff] bg-white/90 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00685f] text-white flex items-center justify-center font-black shadow-xs">
              <span className="material-symbols-outlined text-[19px]">explore</span>
            </div>
            <div>
              <span className="font-extrabold text-base text-[#00685f] tracking-tight block">Travel AI</span>
              <span className="text-[10px] text-[#717b79] block -mt-1 font-medium">Bharat Heritage &amp; Express Corridors</span>
            </div>
          </div>

          <button
            onClick={() => setViewMode('landing')}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#00685f] hover:text-[#00524a] bg-[#00685f]/8 hover:bg-[#00685f]/15 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Landing Page</span>
          </button>
        </header>

        {/* Central Auth Card */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          {renderAuthBox(true)}
        </main>

        {/* Minimal Footer */}
        <footer className="py-4 text-center text-xs text-[#717b79] border-t border-[#eaedff] bg-white">
          Travel AI Bharat · Governed by Rabindra Jana ({ADMIN_EMAIL}) · Travelers Helping Travelers
        </footer>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // FULL RICH LANDING PAGE (First Page, Second Page, Footer, Login Section)
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] selection:bg-[#00685f]/20">
      {/* STICKY TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-[#eaedff] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#00685f] text-white flex items-center justify-center font-black shadow-sm">
              <span className="material-symbols-outlined text-[22px]">explore</span>
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl text-[#00685f] tracking-tight block">Travel AI</span>
              <span className="text-[10px] sm:text-[11px] text-[#717b79] block -mt-1 font-medium">
                Bharat Heritage &amp; Express Corridors
              </span>
            </div>
          </div>

          {/* Desktop Nav Anchor Links */}
          <nav className="hidden md:flex items-center gap-6 text-[13px] font-semibold text-[#3d4947]">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-[#00685f] transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('mediation-model')}
              className="hover:text-[#00685f] transition-colors cursor-pointer"
            >
              Peer Mediation
            </button>
            <button
              onClick={() => scrollToSection('corridors')}
              className="hover:text-[#00685f] transition-colors cursor-pointer"
            >
              Jharkhand &amp; Bengal
            </button>
            <button
              onClick={() => scrollToSection('trust-badges')}
              className="hover:text-[#00685f] transition-colors cursor-pointer"
            >
              Govt ID Trust
            </button>
            <button
              onClick={() => scrollToSection('reviews')}
              className="hover:text-[#00685f] transition-colors cursor-pointer"
            >
              Community
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={onExploreAsGuest}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-[#3d4947] hover:bg-[#f2f3ff] transition-all cursor-pointer"
              title="Preview internal dashboard"
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>Guest Preview</span>
            </button>

            <button
              onClick={() => {
                setAuthTab('login');
                scrollToSection('login-section');
              }}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-white border border-[#eaedff] hover:border-[#00685f] text-[#00685f] text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">login</span>
              <span>Log In</span>
            </button>

            <button
              onClick={() => {
                setAuthTab('signup');
                scrollToSection('login-section');
              }}
              className="px-4 sm:px-4.5 py-2 rounded-xl bg-[#00685f] hover:bg-[#00534c] text-white text-xs sm:text-sm font-bold transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              <span>Sign Up</span>
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* FIRST PAGE: HERO SECTION (FIRST FOLD)                                */}
      {/* ==================================================================== */}
      <section id="hero" className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 border-b border-[#eaedff]">
        {/* Subtle Decorative Background gradients */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-[#00685f]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-[#ffdbca]/20 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Ethos, Headline & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              {/* Quiet Ethos Kicker (Zero-pill discipline) */}
              <div className="flex items-center gap-2 text-xs font-bold text-[#00685f] tracking-wide uppercase">
                <span className="material-symbols-outlined text-[18px]">handshake</span>
                <span>Our Motto · Travelers Helping Travelers</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black tracking-tight text-[#131b2e] leading-[1.12]">
                Explore India With Mutual Trust,{' '}
                <span className="text-[#00685f]">Mediated by Travel AI.</span>
              </h1>

              {/* Punchy Subtitle */}
              <p className="text-base sm:text-lg text-[#3d4947] leading-relaxed max-w-2xl">
                No commercial tour agents or inflated package markups. One unified account for every explorer.
                Log in via password or Gmail, upgrade with your Government ID for mutual trust, and exchange verified
                day-by-day transit charts, railway timings, and secret food spots across Jharkhand, West Bengal,
                and every express corridor.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setAuthTab('login');
                    scrollToSection('login-section');
                  }}
                  className="px-5 py-3.5 rounded-2xl bg-[#00685f] hover:bg-[#00534c] text-white text-sm sm:text-base font-bold transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[19px]">login</span>
                  <span>Log In with Password</span>
                </button>

                <button
                  onClick={() => {
                    setAuthTab('signup');
                    scrollToSection('login-section');
                  }}
                  className="px-5 py-3.5 rounded-2xl bg-[#006947] hover:bg-[#005237] text-white text-sm sm:text-base font-bold transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[19px]">person_add</span>
                  <span>Sign Up Free</span>
                </button>

                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="px-4 py-3.5 rounded-2xl bg-white hover:bg-[#f2f3ff] text-[#131b2e] text-xs sm:text-sm font-bold border border-[#eaedff] transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[17px] text-[#00685f]">arrow_downward</span>
                  <span>How It Works</span>
                </button>

                <button
                  onClick={onExploreAsGuest}
                  className="px-4 py-3.5 rounded-2xl bg-white/60 hover:bg-white text-[#717b79] hover:text-[#131b2e] text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[17px]">rocket_launch</span>
                  <span>Explore as Guest</span>
                </button>
              </div>

              {/* Quiet Trust Separator Strip */}
              <div className="pt-4 border-t border-[#eaedff] flex items-center gap-4 sm:gap-6 flex-wrap text-xs text-[#5f6368] font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#006947]">shield</span>
                  <span>Govt ID Verified Badges</span>
                </div>
                <span className="text-gray-300">·</span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#00685f]">train</span>
                  <span>Indian Railways Express Hub</span>
                </div>
                <span className="text-gray-300">·</span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#fd761a]">admin_panel_settings</span>
                  <span>Admin Desk: Rabindra Jana</span>
                </div>
              </div>
            </div>

            {/* Right Column: High-Fidelity Interactive Planning Card Preview */}
            <div className="lg:col-span-5">
              <div className="relative">
                {/* Background Shadow Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00685f]/20 to-[#a4f2cb]/20 rounded-3xl transform rotate-1 scale-102 filter blur-sm" />

                <div className="relative bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-[#eaedff] space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
                    <div className="flex items-center gap-2.5">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                        alt="Rabindra"
                        className="w-10 h-10 rounded-2xl object-cover ring-2 ring-[#00685f]/30"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-[#131b2e]">Rabindra Jana</h4>
                          <span className="material-symbols-outlined text-[16px] text-[#006947]">verified</span>
                        </div>
                        <span className="text-[11px] text-[#717b79] block">
                          Medinipur · Govt ID Verified Traveler &amp; Admin
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-[#006947] bg-[#e2fced] px-2.5 py-1 rounded-xl">
                      100% Trust Rating
                    </span>
                  </div>

                  {/* Planning Card Route Title */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-[#00685f] uppercase tracking-wider">
                      Shared Verified Journey
                    </div>
                    <h3 className="font-extrabold text-base text-[#131b2e]">
                      Bengal-Jharkhand Express &amp; Sal Forest Corridor
                    </h3>
                    <p className="text-xs text-[#3d4947]">
                      Howrah ➔ Kharagpur ➔ Medinipur ➔ Ranchi ➔ Netarhat
                    </p>
                  </div>

                  {/* Day-by-Day Transit Schedule */}
                  <div className="space-y-2.5 pt-1 text-xs">
                    <div className="p-3 rounded-2xl bg-[#faf8ff] border border-[#eaedff] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-[#00685f]">train</span>
                        <div>
                          <div className="font-bold text-[#131b2e]">Rupashi Bangla Express (12883)</div>
                          <div className="text-[11px] text-[#717b79]">Howrah (06:25 AM) to Kharagpur (08:28 AM)</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#00685f]">Platform 7</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#faf8ff] border border-[#eaedff] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-[#fd761a]">restaurant</span>
                        <div>
                          <div className="font-bold text-[#131b2e]">Medinipur Chhana-boda &amp; Kangsabati River</div>
                          <div className="text-[11px] text-[#717b79]">Authentic local sweet &amp; historic twin town walk</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#fd761a]">Local Gem</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#faf8ff] border border-[#eaedff] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-[#006947]">forest</span>
                        <div>
                          <div className="font-bold text-[#131b2e]">Netarhat Magnolia Sunset &amp; Koel River</div>
                          <div className="text-[11px] text-[#717b79]">Latehar Forest Rest House with friend advice</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#006947]">Protected Sal</span>
                    </div>
                  </div>

                  {/* Friend Insider Advice Preview */}
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-[#e2fced]/40 to-[#f2f3ff] border border-[#a4f2cb]/60 text-[11.5px] text-[#3d4947]">
                    <strong className="text-[#006947] block mb-0.5">🔒 Verified Friend Tip (Unlocked):</strong>
                    "Catch the Koel View Point dawn before 5:15 AM. Order hot Dhuska and Aloo Chana at Upper Bazar Ranchi before heading uphill."
                  </div>

                  {/* Micro CTA */}
                  <button
                    onClick={() => scrollToSection('login-section')}
                    className="w-full py-2.5 rounded-xl bg-[#00685f]/10 hover:bg-[#00685f] text-[#00685f] hover:text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Log In to Exchange Planning Cards</span>
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* SECOND PAGE: HOW IT WORKS & CORE ARCHITECTURE (SECOND FOLD)         */}
      {/* ==================================================================== */}
      <section id="how-it-works" className="py-16 sm:py-24 border-b border-[#eaedff] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Section Header */}
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold text-[#00685f] tracking-wider uppercase">
              The Peer Travel Revolution
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#131b2e] tracking-tight">
              How Travel AI Works: The 4 Steps to Mutual Trust
            </h2>
            <p className="text-sm sm:text-base text-[#3d4947] leading-relaxed">
              We eliminated commercial tourist traps, inflated tour packages, and middlemen. Here is how travelers help travelers safely across Indian Railways.
            </p>
          </div>

          {/* 4 Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Sign In via Gmail',
                desc: 'One single traveler account for everyone. No confusing guide accounts or commercial profiles.',
                icon: 'mail',
                color: 'text-[#00685f]',
                bg: 'bg-[#00685f]/10',
              },
              {
                step: '02',
                title: 'Submit Government ID',
                desc: 'Upload an Aadhaar Card, Passport, Voter ID, or Driving License with strict privacy masking.',
                icon: 'badge',
                color: 'text-[#006947]',
                bg: 'bg-[#006947]/10',
              },
              {
                step: '03',
                title: 'Admin Desk Verification',
                desc: 'Admin Rabindra Jana (askrabindrajana@gmail.com) reviews credentials to award the Verified Badge.',
                icon: 'admin_panel_settings',
                color: 'text-[#fd761a]',
                bg: 'bg-[#fd761a]/10',
              },
              {
                step: '04',
                title: 'Exchange Planning Cards',
                desc: 'Share verified route cards, railway platform tips, and secret food spots with fellow travelers.',
                icon: 'share_location',
                color: 'text-[#00685f]',
                bg: 'bg-[#00685f]/10',
              },
            ].map((s, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#faf8ff] border border-[#eaedff] hover:border-[#00685f]/40 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`w-10 h-10 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center font-bold`}>
                      <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                    </span>
                    <span className="text-xl font-black text-gray-300">{s.step}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#131b2e]">{s.title}</h3>
                  <p className="text-xs text-[#5f6368] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Core Ethos: The "One Account" Philosophy */}
          <div id="mediation-model" className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-[#00685f]/10 via-[#00685f]/5 to-[#f2f3ff] border border-[#00685f]/25 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <span className="w-12 h-12 rounded-2xl bg-[#00685f] text-white flex items-center justify-center shrink-0 shadow-md">
                  <span className="material-symbols-outlined text-[24px]">handshake</span>
                </span>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#131b2e]">
                    Why Travel AI Uses "One Account Only"
                  </h3>
                  <p className="text-xs sm:text-sm text-[#3d4947] mt-0.5">
                    No commercial tour operators or separate guide tiers. Here is our founding commitment:
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold bg-[#00685f] text-white px-3.5 py-1.5 rounded-xl shrink-0 self-start sm:self-auto">
                Peer Mediation Ethos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs text-[#3d4947]">
              <div className="p-4 rounded-2xl bg-white/80 border border-[#eaedff] space-y-1">
                <strong className="text-[#131b2e] block font-bold">1. Mutual Respect as Equals</strong>
                <p>A traveler visiting Ranchi or Netarhat gets tips from a traveler living in Jharkhand without transactional sales pressure.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/80 border border-[#eaedff] space-y-1">
                <strong className="text-[#131b2e] block font-bold">2. Verified Genuine Identity</strong>
                <p>Government ID checks ensure every member is a verified real individual. No fake accounts or bot spam.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/80 border border-[#eaedff] space-y-1">
                <strong className="text-[#131b2e] block font-bold">3. Admin Oversight by Rabindra</strong>
                <p>Our founder and admin personally audits verification queues and resolves disputes to maintain highest community trust.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* FEATURED CORRIDORS: JHARKHAND & WEST BENGAL SPOTLIGHT               */}
      {/* ==================================================================== */}
      <section id="corridors" className="py-16 sm:py-24 border-b border-[#eaedff] bg-[#faf8ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#00685f] tracking-wider uppercase">
                Scenic Express Corridors
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#131b2e] tracking-tight">
                Jharkhand Wilderness &amp; Bengal Rail Corridors
              </h2>
              <p className="text-xs sm:text-sm text-[#3d4947]">
                Experience authentic regional journeys carefully mapped with express trains and local friends.
              </p>
            </div>

            {/* Segmented Filter Control */}
            <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#eaedff] shadow-xs shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setActiveCorridorTab('jharkhand')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCorridorTab === 'jharkhand'
                    ? 'bg-[#00685f] text-white shadow-xs'
                    : 'text-[#3d4947] hover:bg-[#f2f3ff]'
                }`}
              >
                Jharkhand Trails
              </button>
              <button
                onClick={() => setActiveCorridorTab('bengal')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCorridorTab === 'bengal'
                    ? 'bg-[#00685f] text-white shadow-xs'
                    : 'text-[#3d4947] hover:bg-[#f2f3ff]'
                }`}
              >
                Bengal Rail Corridors
              </button>
            </div>
          </div>

          {/* Corridor Cards Grid */}
          {activeCorridorTab === 'jharkhand' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Netarhat & Koel River Sunrise',
                  subtitle: 'Queen of Chotanagpur Plateau',
                  image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
                  train: 'Vande Bharat / Ranchi Intercity',
                  highlights: ['Magnolia Sunset Point', 'Koel River dawn mist', 'Lodh Waterfalls (Jharkhand highest)'],
                  friendTip: 'Book the Forest Rest House directly at Latehar DFO. Sunrise at Koel View Point is best at 5:15 AM.',
                },
                {
                  title: 'Betla National Park Safari',
                  subtitle: 'Ancient Chero Forts & Sal Canopy',
                  image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&auto=format&fit=crop&q=80',
                  train: 'Shaktipunj Express to Daltonganj',
                  highlights: ['Wild elephant herds', '16th Century Chero Forts', 'Deep sal tree jungle safari'],
                  friendTip: 'Hire a gypsy from Betla gate by 6:00 AM for bird sightings and deer herds along Kamaldah lake.',
                },
                {
                  title: 'Ranchi Waterfall Circuit & Dhuska',
                  subtitle: 'Capital City & Chotanagpur Valleys',
                  image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
                  train: 'Ranchi Express / Rajdhani',
                  highlights: ['Hundru, Jonha & Dassam Falls', 'Tagore Hill panoramic view', 'Authentic Dhuska breakfast'],
                  friendTip: 'Best crispy Dhuska is near Upper Bazar daily 7:00-10:00 AM with spicy aloo-chana gravy.',
                },
              ].map((c, i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden border border-[#eaedff] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="relative h-48 overflow-hidden">
                      <img src={c.image} alt={c.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-xl">
                        {c.train}
                      </span>
                    </div>
                    <div className="p-5 space-y-3">
                      <div>
                        <span className="text-[10.5px] font-bold text-[#00685f] uppercase tracking-wider">{c.subtitle}</span>
                        <h3 className="text-base font-bold text-[#131b2e] mt-0.5">{c.title}</h3>
                      </div>
                      <div className="space-y-1">
                        {c.highlights.map((h, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-[#3d4947]">
                            <span className="material-symbols-outlined text-[14px] text-[#006947]">check</span>
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 rounded-xl bg-[#faf8ff] border border-[#eaedff] text-[11.5px] text-[#5f6368]">
                        <strong className="text-[#00685f]">Friend Tip:</strong> {c.friendTip}
                      </div>
                    </div>
                  </div>
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => scrollToSection('login-section')}
                      className="w-full py-2.5 rounded-xl bg-[#00685f]/10 hover:bg-[#00685f] text-[#00685f] hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>Plan Trip with Travelers</span>
                      <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Kharagpur Railway Junction Heritage',
                  subtitle: 'Iconic Platform & South Eastern Hub',
                  image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&auto=format&fit=crop&q=80',
                  train: 'Rupashi Bangla / Steel Express',
                  highlights: ['Platform 7 world record legacy', 'Kharagpur Railway Museum', 'IIT Kharagpur Nehru Hall archive'],
                  friendTip: 'Platform 7 has antique steam locomotive exhibits and fresh station filter coffee at South Indian canteen.',
                },
                {
                  title: 'Medinipur Twin Town & Kangsabati',
                  subtitle: 'Chhana-boda & Historic Ghats',
                  image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80',
                  train: 'Howrah-Medinipur EMU Local',
                  highlights: ['Kangsabati river sunset', 'Famous Medinipur Chhana-boda', 'Gopegarh Eco-Park canopy walks'],
                  friendTip: 'Rabindra Jana homestay is situated 10 mins from station with authentic home-cooked Bengali meals.',
                },
                {
                  title: 'Karnagarh Terracotta & Chuar Shrines',
                  subtitle: '18th Century Temple Architecture',
                  image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&auto=format&fit=crop&q=80',
                  train: 'Toto Rickshaw from Medinipur Battala',
                  highlights: ['Mahamaya Temple complex', 'Chuar rebellion fort ruins', 'Terracotta carved lintels'],
                  friendTip: 'Mention Rabindra Jana at Mahamaya temple for access to the antique brass bell archives.',
                },
              ].map((c, i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden border border-[#eaedff] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="relative h-48 overflow-hidden">
                      <img src={c.image} alt={c.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-xl">
                        {c.train}
                      </span>
                    </div>
                    <div className="p-5 space-y-3">
                      <div>
                        <span className="text-[10.5px] font-bold text-[#00685f] uppercase tracking-wider">{c.subtitle}</span>
                        <h3 className="text-base font-bold text-[#131b2e] mt-0.5">{c.title}</h3>
                      </div>
                      <div className="space-y-1">
                        {c.highlights.map((h, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-[#3d4947]">
                            <span className="material-symbols-outlined text-[14px] text-[#006947]">check</span>
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 rounded-xl bg-[#faf8ff] border border-[#eaedff] text-[11.5px] text-[#5f6368]">
                        <strong className="text-[#00685f]">Friend Tip:</strong> {c.friendTip}
                      </div>
                    </div>
                  </div>
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => scrollToSection('login-section')}
                      className="w-full py-2.5 rounded-xl bg-[#00685f]/10 hover:bg-[#00685f] text-[#00685f] hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>Plan Trip with Travelers</span>
                      <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* TRUST & VERIFICATION SYSTEM SECTION                                 */}
      {/* ==================================================================== */}
      <section id="trust-badges" className="py-16 sm:py-24 border-b border-[#eaedff] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold text-[#006947] tracking-wider uppercase">
              Trust &amp; Identity System
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#131b2e] tracking-tight">
              Government ID Verification: The Anchor of Mutual Trust
            </h2>
            <p className="text-sm sm:text-base text-[#3d4947] leading-relaxed">
              When meeting fellow travelers or trading station advice, safety comes first. Any user can upgrade their account by uploading an official Indian Government ID.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                title: 'Aadhaar Card',
                authority: 'UIDAI Masked',
                desc: 'Upload photo with first 8 digits masked for complete privacy.',
                icon: 'fingerprint',
              },
              {
                title: 'Indian Passport',
                authority: 'Min. External Affairs',
                desc: 'Photo page with clear traveler name and issue authority seal.',
                icon: 'menu_book',
              },
              {
                title: 'Voter ID Card',
                authority: 'Election Commission',
                desc: 'Permanent EPIC number with district and state verification.',
                icon: 'how_to_vote',
              },
              {
                title: 'Driving License',
                authority: 'State Transport Auth',
                desc: 'Official motor vehicle license issued by any Indian state.',
                icon: 'directions_car',
              },
            ].map((idDoc, idx) => (
              <div key={idx} className="p-5 rounded-3xl bg-[#faf8ff] border border-[#eaedff] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-[24px] text-[#00685f]">{idDoc.icon}</span>
                  <span className="text-[10px] font-bold bg-[#00685f]/10 text-[#00685f] px-2 py-0.5 rounded-md">
                    {idDoc.authority}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-[#131b2e]">{idDoc.title}</h4>
                <p className="text-xs text-[#5f6368] leading-relaxed">{idDoc.desc}</p>
              </div>
            ))}
          </div>

          {/* Admin Verification Desk Callout */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#faf8ff] border border-[#eaedff] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="w-12 h-12 rounded-2xl bg-[#fd761a] text-white flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-[24px]">verified_user</span>
              </span>
              <div>
                <h3 className="font-bold text-base text-[#131b2e]">Admin Oversight &amp; Data Security Guarantee</h3>
                <p className="text-xs text-[#3d4947] mt-0.5">
                  All documents are securely encrypted on your browser and reviewed manually by Rabindra Jana ({ADMIN_EMAIL}). No third-party data broker access.
                </p>
              </div>
            </div>

            <button
              onClick={() => scrollToSection('login-section')}
              className="px-5 py-2.5 rounded-xl bg-[#00685f] hover:bg-[#00534c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
            >
              Sign In to Apply for Badge
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* COMMUNITY TESTIMONIALS & STATS                                       */}
      {/* ==================================================================== */}
      <section id="reviews" className="py-16 sm:py-24 border-b border-[#eaedff] bg-[#faf8ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#00685f] tracking-wider uppercase">
              Community Voices
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#131b2e] tracking-tight">
              Loved by Real Explorers Across India
            </h2>
            <p className="text-xs sm:text-sm text-[#3d4947]">
              Read how fellow travelers exchanged routes, avoided commercial scams, and made journeys happen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Priya Sharma',
                city: 'New Delhi',
                role: 'Solo Explorer',
                quote:
                  'Travel AI changed how I travel on Indian Railways. Exchanging a planning card with a local friend in Ranchi meant I had the exact toto contact and knew where to eat authentic Dhuska at 7 AM.',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                badge: 'Govt ID Verified Traveler',
              },
              {
                name: 'Birsa Soren',
                city: 'Netarhat, Jharkhand',
                role: 'Forest Explorer',
                quote:
                  'I live near Betla forest. On Travel AI, I help travelers with real morning timings for Koel View Point and tribal folklore. No agency cuts, just genuine traveler brotherhood.',
                avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
                badge: 'Govt ID Verified Traveler',
              },
              {
                name: 'Subhashish Roy',
                city: 'Kharagpur, West Bengal',
                role: 'Railway Heritage Explorer',
                quote:
                  'Documenting the heritage of Kharagpur platform and Medinipur terracotta temples. The shared planning card feature is brilliant for rail buffs traveling along the Kangsabati corridor.',
                avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
                badge: 'Govt ID Verified Traveler',
              },
            ].map((t, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-white border border-[#eaedff] shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-[#ff9900]">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-[16px]">star</span>
                    ))}
                  </div>
                  <p className="text-xs text-[#3d4947] leading-relaxed italic">"{t.quote}"</p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-[#eaedff]">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-2xl object-cover ring-1 ring-[#eaedff]" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-[#131b2e] truncate">{t.name}</h4>
                    <span className="text-[10px] text-[#006947] font-semibold block">{t.badge}</span>
                    <span className="text-[10px] text-gray-400 block">{t.city}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-white border border-[#eaedff]">
              <div className="text-2xl font-black text-[#00685f]">100%</div>
              <div className="text-xs text-[#717b79] font-medium mt-0.5">Govt ID Vetted Admins</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#eaedff]">
              <div className="text-2xl font-black text-[#006947]">98%</div>
              <div className="text-xs text-[#717b79] font-medium mt-0.5">Community Trust Score</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#eaedff]">
              <div className="text-2xl font-black text-[#fd761a]">50+</div>
              <div className="text-xs text-[#717b79] font-medium mt-0.5">Scenic Corridors Mapped</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#eaedff]">
              <div className="text-2xl font-black text-[#00685f]">₹0</div>
              <div className="text-xs text-[#717b79] font-medium mt-0.5">Commercial Agency Cuts</div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* DEDICATED LOGIN SECTION / PAGE ("and then a login page")             */}
      {/* ==================================================================== */}
      <section id="login-section" className="py-16 sm:py-24 border-b border-[#eaedff] bg-gradient-to-b from-white to-[#faf8ff]">
        <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#00685f] tracking-wider uppercase">
              Unified Traveler Authentication
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#131b2e] tracking-tight">
              Sign In or Register with Password
            </h2>
            <p className="text-xs sm:text-sm text-[#5f6368] leading-relaxed">
              Once you log in with your account credentials, you unlock full access to the AI Trip Planner, Express Corridors, Living Journal, Interactive Map, and Community.
            </p>
          </div>

          {renderAuthBox(false)}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* COMPREHENSIVE FOOTER                                                 */}
      {/* ==================================================================== */}
      <footer className="bg-white border-t border-[#eaedff] pt-12 pb-8 text-[#3d4947]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Brand & Ethos */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#00685f] text-white flex items-center justify-center font-black shadow-xs">
                  <span className="material-symbols-outlined text-[19px]">explore</span>
                </div>
                <span className="font-extrabold text-base text-[#00685f] tracking-tight">Travel AI</span>
              </div>
              <p className="text-xs text-[#717b79] leading-relaxed">
                Travelers Helping Travelers — Mediated by Travel AI. A peer community with zero commercial tour operators.
              </p>
              <div className="text-xs text-[#006947] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                <span>Govt ID Trust Network</span>
              </div>
            </div>

            {/* Column 2: Corridors */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#131b2e] uppercase tracking-wider">Corridors</h4>
              <ul className="space-y-1.5 text-xs text-[#717b79]">
                <li><button onClick={() => { setActiveCorridorTab('jharkhand'); scrollToSection('corridors'); }} className="hover:text-[#00685f] cursor-pointer">Netarhat &amp; Koel Sunrise</button></li>
                <li><button onClick={() => { setActiveCorridorTab('jharkhand'); scrollToSection('corridors'); }} className="hover:text-[#00685f] cursor-pointer">Betla National Park Safari</button></li>
                <li><button onClick={() => { setActiveCorridorTab('jharkhand'); scrollToSection('corridors'); }} className="hover:text-[#00685f] cursor-pointer">Ranchi Waterfalls &amp; Dhuska</button></li>
                <li><button onClick={() => { setActiveCorridorTab('bengal'); scrollToSection('corridors'); }} className="hover:text-[#00685f] cursor-pointer">Kharagpur Railway Junction</button></li>
                <li><button onClick={() => { setActiveCorridorTab('bengal'); scrollToSection('corridors'); }} className="hover:text-[#00685f] cursor-pointer">Medinipur Twin Town &amp; Kasai</button></li>
              </ul>
            </div>

            {/* Column 3: Platform & Trust */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#131b2e] uppercase tracking-wider">Trust &amp; Privacy</h4>
              <ul className="space-y-1.5 text-xs text-[#717b79]">
                <li><button onClick={() => scrollToSection('trust-badges')} className="hover:text-[#00685f] cursor-pointer">Government ID Verification</button></li>
                <li><button onClick={() => scrollToSection('mediation-model')} className="hover:text-[#00685f] cursor-pointer">Peer Mediation Philosophy</button></li>
                <li><span className="text-[#3d4947]">UIDAI Masking &amp; Data Privacy</span></li>
                <li><span className="text-[#3d4947]">Admin Verification Desk</span></li>
              </ul>
            </div>

            {/* Column 4: Contact & Founder */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#131b2e] uppercase tracking-wider">Founder &amp; Administrator</h4>
              <p className="text-xs text-[#717b79] leading-relaxed">
                Platform governed by <strong className="text-[#131b2e]">Rabindra Jana</strong> from Medinipur, West Bengal.
              </p>
              <div className="text-xs font-mono text-[#00685f] bg-[#00685f]/8 p-2 rounded-xl border border-[#00685f]/20 truncate">
                {ADMIN_EMAIL}
              </div>
              <button
                onClick={() => scrollToSection('login-section')}
                className="text-xs font-bold text-[#00685f] hover:underline block pt-1 cursor-pointer"
              >
                Admin &amp; Host Sign In →
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-[#eaedff] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#717b79]">
            <div>
              © 2026 Travel AI Bharat. All rights reserved. Made for authentic Indian journeys.
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-[#00685f] transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Back to Top</span>
                <span className="material-symbols-outlined text-[15px]">arrow_upward</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
