/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthUser } from '../types';
import {
  ADMIN_EMAIL,
  loginWithGmail,
  loginWithPassword,
  registerUserWithPassword,
  resetPassword,
  DEFAULT_TRAVELER_USER,
  ADMIN_USER,
  isAdminEmail,
  getStoredAuthUser,
  setUserLoggedIn,
} from '../utils/authStorage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: AuthUser;
  onAuthSuccess?: (user: AuthUser) => void;
  onLoginSuccess?: (user: AuthUser) => void;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
  initialTab?: 'user' | 'guider' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onLoginSuccess,
  onShowToast,
}) => {
  const activeUser = currentUser || getStoredAuthUser();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState(activeUser.email || '');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign up form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupCity, setSignupCity] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPass, setSignupConfirmPass] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);

  // Feedback and UI state
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password drawer
  const [showForgotDrawer, setShowForgotDrawer] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPass, setResetNewPass] = useState('');
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const notifyToast = (title: string, message?: string, type?: 'success' | 'info' | 'warning') => {
    if (onShowToast) onShowToast(title, message, type);
  };

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

  const handle1ClickGmail = (email: string, name?: string) => {
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
      if (onAuthSuccess) onAuthSuccess(result.user);
      if (onLoginSuccess) onLoginSuccess(result.user);

      notifyToast(
        isAdmin ? 'Admin Host Verified ✨' : 'Welcome to Travel AI! 🎒',
        result.message,
        'success'
      );

      setIsSubmitting(false);
      onClose();
    }, 350);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    setSuccessNotice(null);

    const email = loginEmail.trim();
    if (!email) {
      setErrorNotice('Please enter your email address.');
      return;
    }
    if (!loginPassword) {
      setErrorNotice('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = loginWithPassword(email, loginPassword);
      if (result.success && result.user) {
        setUserLoggedIn(true);
        if (onAuthSuccess) onAuthSuccess(result.user);
        if (onLoginSuccess) onLoginSuccess(result.user);

        notifyToast(
          result.user.isAdmin ? 'Admin Host Verified ✨' : 'Welcome Back! 🎒',
          result.message || `Logged in as ${result.user.name}.`,
          'success'
        );
        setIsSubmitting(false);
        onClose();
      } else {
        setIsSubmitting(false);
        setErrorNotice(result.message || 'Incorrect email or password.');
        notifyToast('Login Failed', result.message, 'warning');
      }
    }, 350);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    setSuccessNotice(null);

    const name = signupName.trim();
    const email = signupEmail.trim();

    if (!name) {
      setErrorNotice('Please enter your full name.');
      return;
    }
    if (!email) {
      setErrorNotice('Please enter your email address.');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setErrorNotice('Password must be at least 6 characters long.');
      return;
    }
    if (signupPassword !== signupConfirmPass) {
      setErrorNotice('Passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = registerUserWithPassword({
        name,
        email,
        password: signupPassword,
        homeCity: signupCity,
      });

      if (result.success && result.user) {
        setUserLoggedIn(true);
        if (onAuthSuccess) onAuthSuccess(result.user);
        if (onLoginSuccess) onLoginSuccess(result.user);

        notifyToast(
          'Account Created! 🎉',
          result.message || `Welcome ${result.user.name}! Your account is now active.`,
          'success'
        );
        setIsSubmitting(false);
        onClose();
      } else {
        setIsSubmitting(false);
        setErrorNotice(result.message || 'Could not register account.');
        notifyToast('Sign Up Failed', result.message, 'warning');
      }
    }, 400);
  };

  const fillDemoCredentials = (email: string, pass: string) => {
    setAuthMode('login');
    setLoginEmail(email);
    setLoginPassword(pass);
    setErrorNotice(null);
    setSuccessNotice(`Autofilled credentials for ${email}. Click "Log In with Password".`);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetNewPass || resetNewPass.length < 6) {
      setResetFeedback('Please provide valid email and new password (min 6 characters).');
      return;
    }
    const res = resetPassword(resetEmail, resetNewPass);
    setResetFeedback(res.message);
    if (res.success) {
      setLoginEmail(resetEmail.trim());
      setLoginPassword(resetNewPass);
      setSuccessNotice('Password reset successful! You can now log in.');
      setTimeout(() => setShowForgotDrawer(false), 1400);
    }
  };

  const strength = getPasswordStrength(signupPassword);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#eaedff] space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#eaedff]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#00685f] text-white flex items-center justify-center text-sm font-black shadow-xs">
                <span className="material-symbols-outlined text-[19px]">backpack</span>
              </span>
              <h2 className="text-xl font-extrabold text-[#131b2e] tracking-tight">
                Traveler Account Access
              </h2>
            </div>
            <p className="text-xs text-[#5f6368]">
              One unified account for all travelers · Travelers Helping Travelers
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Switcher: Log In vs Sign Up */}
        <div className="flex rounded-2xl bg-[#faf8ff] p-1 border border-[#eaedff]">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorNotice(null);
              setSuccessNotice(null);
            }}
            className={`flex-1 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-white text-[#00685f] shadow-xs border border-[#eaedff]'
                : 'text-gray-500 hover:text-[#131b2e]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">login</span>
            <span>Log In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setErrorNotice(null);
              setSuccessNotice(null);
            }}
            className={`flex-1 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'signup'
                ? 'bg-white text-[#00685f] shadow-xs border border-[#eaedff]'
                : 'text-gray-500 hover:text-[#131b2e]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>Sign Up</span>
          </button>
        </div>

        {/* Feedback notices */}
        {errorNotice && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <span className="material-symbols-outlined text-rose-600 text-[18px] shrink-0 mt-0.5">
              error
            </span>
            <div className="flex-1 font-medium">{errorNotice}</div>
            <button
              type="button"
              onClick={() => setErrorNotice(null)}
              className="text-rose-400 hover:text-rose-700 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {successNotice && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">
              check_circle
            </span>
            <div className="flex-1 font-medium">{successNotice}</div>
            <button
              type="button"
              onClick={() => setSuccessNotice(null)}
              className="text-emerald-400 hover:text-emerald-700 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* ---------------- LOGIN TAB ---------------- */}
        {authMode === 'login' && (
          <div className="space-y-3.5">
            {/* Demo Accounts Quick Chips */}
            <div className="p-2.5 rounded-2xl bg-[#faf8ff] border border-[#eaedff] space-y-1.5">
              <span className="text-[11px] font-bold text-gray-500 block">
                Quick Demo Accounts (Autofill Credentials):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoCredentials(ADMIN_EMAIL, 'password123')}
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
                  onClick={() => fillDemoCredentials('priya.traveler@gmail.com', 'password123')}
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
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#131b2e] block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full h-10 pl-9 pr-3 bg-[#faf8ff] rounded-xl text-xs sm:text-sm text-[#131b2e] outline-none border border-[#eaedff] focus:border-[#00685f]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#131b2e]">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotDrawer(!showForgotDrawer)}
                    className="text-[11px] font-semibold text-[#00685f] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
                    lock
                  </span>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full h-10 pl-9 pr-10 bg-[#faf8ff] rounded-xl text-xs sm:text-sm text-[#131b2e] outline-none border border-[#eaedff] focus:border-[#00685f]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showLoginPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Forgot password drawer inside modal */}
              {showForgotDrawer && (
                <div className="p-3 rounded-2xl bg-[#faf8ff] border border-[#eaedff] space-y-2">
                  <div className="text-xs font-bold text-[#131b2e]">Reset Password</div>
                  <p className="text-[11px] text-[#5f6368]">
                    Default password is <code className="font-bold text-[#00685f]">password123</code>. Reset here:
                  </p>
                  <input
                    type="email"
                    placeholder="Registered email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full h-8 px-2.5 bg-white rounded-lg text-xs border border-[#eaedff]"
                  />
                  <input
                    type="password"
                    placeholder="New password (min 6 chars)"
                    value={resetNewPass}
                    onChange={(e) => setResetNewPass(e.target.value)}
                    className="w-full h-8 px-2.5 bg-white rounded-lg text-xs border border-[#eaedff]"
                  />
                  <button
                    type="button"
                    onClick={handleResetSubmit}
                    className="w-full py-1.5 bg-[#00685f] text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Update Password
                  </button>
                  {resetFeedback && (
                    <div className="text-[10.5px] font-medium text-[#00685f]">{resetFeedback}</div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#00685f] hover:bg-[#00534c] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>{isSubmitting ? 'Authenticating...' : 'Log In with Password'}</span>
              </button>
            </form>
          </div>
        )}

        {/* ---------------- SIGN UP TAB ---------------- */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[#131b2e] block mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
                  person
                </span>
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full h-10 pl-9 pr-3 bg-[#faf8ff] rounded-xl text-xs sm:text-sm text-[#131b2e] outline-none border border-[#eaedff] focus:border-[#00685f]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#131b2e] block mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
                  mail
                </span>
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full h-10 pl-9 pr-3 bg-[#faf8ff] rounded-xl text-xs sm:text-sm text-[#131b2e] outline-none border border-[#eaedff] focus:border-[#00685f]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#131b2e] block mb-1">
                Home City / State <span className="text-gray-400 text-[10px] font-normal">(optional)</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
                  location_on
                </span>
                <input
                  type="text"
                  value={signupCity}
                  onChange={(e) => setSignupCity(e.target.value)}
                  placeholder="e.g. Medinipur, West Bengal"
                  className="w-full h-10 pl-9 pr-3 bg-[#faf8ff] rounded-xl text-xs sm:text-sm text-[#131b2e] outline-none border border-[#eaedff] focus:border-[#00685f]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#131b2e] block mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
                  lock
                </span>
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full h-10 pl-9 pr-10 bg-[#faf8ff] rounded-xl text-xs sm:text-sm text-[#131b2e] outline-none border border-[#eaedff] focus:border-[#00685f]"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showSignupPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {signupPassword && (
                <div className="mt-1 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
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
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
                  lock_reset
                </span>
                <input
                  type={showSignupConfirm ? 'text' : 'password'}
                  required
                  value={signupConfirmPass}
                  onChange={(e) => setSignupConfirmPass(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full h-10 pl-9 pr-10 bg-[#faf8ff] rounded-xl text-xs sm:text-sm text-[#131b2e] outline-none border border-[#eaedff] focus:border-[#00685f]"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupConfirm(!showSignupConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showSignupConfirm ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#00685f] hover:bg-[#00534c] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>{isSubmitting ? 'Registering...' : 'Create Account & Sign In'}</span>
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative flex items-center justify-center pt-1">
          <div className="border-t border-[#eaedff] w-full" />
          <span className="bg-white px-2.5 text-[10.5px] font-bold text-gray-400 uppercase tracking-wider absolute">
            or 1-click continue
          </span>
        </div>

        {/* Google 1-Click Action */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handle1ClickGmail('priya.traveler@gmail.com', 'Priya Sharma')}
          className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#eaedff] hover:border-[#00685f] text-[#131b2e] font-bold text-xs shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
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

        {/* Footer switch */}
        <div className="text-center pt-1 text-xs">
          {authMode === 'login' ? (
            <span className="text-[#5f6368]">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorNotice(null);
                  setSuccessNotice(null);
                }}
                className="font-bold text-[#00685f] hover:underline cursor-pointer"
              >
                Sign Up free →
              </button>
            </span>
          ) : (
            <span className="text-[#5f6368]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorNotice(null);
                  setSuccessNotice(null);
                }}
                className="font-bold text-[#00685f] hover:underline cursor-pointer"
              >
                Log In with password →
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
