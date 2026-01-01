import React, { useState, useEffect } from 'react';
import { login, signup, resetPassword, updateUserPassword, getCurrentUser } from '../services/supabase';
import { User } from '../types';
import { Mail, Lock, User as UserIcon, Loader2, ArrowRight, KeyRound, Layout } from 'lucide-react';

interface AuthProps {
    onLogin: (user: User) => void;
    onSwitch: (view: 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD' | 'UPDATE_PASSWORD') => void;
    view: 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD' | 'UPDATE_PASSWORD';
}

const Auth: React.FC<AuthProps> = ({ onLogin, onSwitch, view }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');

    // OTP States
    const [resetStep, setResetStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
    const [otp, setOtp] = useState('');

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Reset local state when view changes
    useEffect(() => {
        setResetStep('EMAIL');
        setOtp('');
        setError(null);
        setSuccess(null);
        setPassword('');
        setConfirmPassword('');
    }, [view]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            if (view === 'LOGIN') {
                const user = await login(email, password);
                onLogin(user);
            } else if (view === 'SIGNUP') {
                if (!name) throw new Error("Name is required");
                const user = await signup(email, password, name);
                if (user) {
                    onLogin(user);
                } else {
                    setSuccess("Account created! Please check your email to confirm.");
                }
            } else if (view === 'FORGOT_PASSWORD') {
                await resetPassword(email);
                setSuccess("Password reset link sent! Please check your email and click the link to reset your password.");
            } else if (view === 'UPDATE_PASSWORD') {
                if (password !== confirmPassword) throw new Error("Passwords do not match!");
                await updateUserPassword(password);
                setSuccess("Password updated successfully! Redirecting...");
                setTimeout(async () => {
                    const u = await getCurrentUser();
                    if (u) onLogin(u);
                }, 1500);
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => {
        switch (view) {
            case 'LOGIN': return 'Welcome Back';
            case 'SIGNUP': return 'Create Account';
            case 'FORGOT_PASSWORD':
                return 'Forgot Password?';
            case 'UPDATE_PASSWORD':
                return 'Set New Password';
        }
    };

    const getDescription = () => {
        switch (view) {
            case 'LOGIN': return 'Sign in to access your saved resumes.';
            case 'SIGNUP': return 'Sign up to start saving your progress.';
            case 'FORGOT_PASSWORD':
                return 'Enter your email to receive a password reset link.';
            case 'UPDATE_PASSWORD':
                return 'Enter your new password below.';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-in fade-in duration-500">
            <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-slate-200 dark:border-neutral-800 p-8">
                <div className="text-center mb-8">
                    <img src="/logo.png" alt="GradCraft" className="w-32 md:w-40 mx-auto mb-6 drop-shadow-md" />
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">{getTitle()}</p>
                    <p className="text-slate-400 text-sm mt-1 max-w-[280px] mx-auto leading-relaxed">
                        {getDescription()}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {view === 'SIGNUP' && (
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-slate-500">Full Name</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="pl-9 w-full p-2.5 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 focus:ring-2 focus:ring-brand-primary focus:outline-none dark:text-white text-sm"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {(view !== 'FORGOT_PASSWORD' && view !== 'UPDATE_PASSWORD') && (
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-slate-500">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className={`pl-9 w-full p-2.5 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 focus:ring-2 focus:ring-brand-primary focus:outline-none dark:text-white text-sm ${resetStep === 'OTP' ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    placeholder="you@example.com"
                                    required
                                    readOnly={resetStep === 'OTP'}
                                />
                            </div>
                        </div>
                    )}

                    {(view !== 'FORGOT_PASSWORD' || resetStep === 'OTP') && (
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-slate-500">
                                {view === 'FORGOT_PASSWORD' ? 'New Password' : 'Password'}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="pl-9 w-full p-2.5 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 focus:ring-2 focus:ring-brand-primary focus:outline-none dark:text-white text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {view === 'UPDATE_PASSWORD' && (
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-slate-500">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className="pl-9 w-full p-2.5 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 focus:ring-2 focus:ring-brand-primary focus:outline-none dark:text-white text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* OTP Field */}
                    {view === 'FORGOT_PASSWORD' && resetStep === 'OTP' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <label className="text-xs font-semibold uppercase text-slate-500">Verification Code</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="pl-9 w-full p-2.5 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 focus:ring-2 focus:ring-red-500 focus:outline-none dark:text-white text-sm tracking-widest font-mono"
                                    placeholder="123456"
                                    required
                                />
                            </div>
                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={() => { setResetStep('EMAIL'); setSuccess(null); }}
                                    className="text-xs text-red-600 hover:text-red-700"
                                >
                                    Resend Code / Change Email
                                </button>
                            </div>
                        </div>
                    )}

                    {view === 'LOGIN' && (
                        <div className="text-right">
                            <button
                                type="button"
                                onClick={() => onSwitch('FORGOT_PASSWORD')}
                                className="text-xs text-brand-primary hover:text-brand-accent font-medium"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    {error && <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</div>}
                    {success && <div className="text-green-600 text-sm text-center bg-green-50 dark:bg-green-900/20 p-2 rounded">{success}</div>}

                    <button
                        type="submit"
                        disabled={loading || (view === 'FORGOT_PASSWORD' && resetStep === 'OTP' && !!success)}
                        className="w-full py-3 bg-brand-primary hover:bg-brand-accent text-white rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-wait"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            view === 'LOGIN' ? 'Sign In' :
                                view === 'SIGNUP' ? 'Create Account' :
                                    view === 'UPDATE_PASSWORD' ? 'Update Password' :
                                        resetStep === 'EMAIL' ? 'Send Verification Code' : 'Reset Password'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => onSwitch(view === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
                        className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-primary dark:hover:text-brand-primary flex items-center justify-center mx-auto gap-1"
                    >
                        {view === 'LOGIN' ? "Don't have an account? Sign up" : "Back to Sign In"}
                        {view !== 'FORGOT_PASSWORD' && <ArrowRight className="w-3 h-3" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;