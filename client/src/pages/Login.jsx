import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MotionWrapper } from '../components/ui/MotionWrapper';
import { LogIn, Mail, Lock, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loginAsGuest, error, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            navigate('/dashboard');
        }
    };

    const handleGuestLogin = () => {
        loginAsGuest();
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#121214] p-6 selection:bg-primary/30">
            <MotionWrapper className="w-full max-w-md">
                <Card className="p-8 space-y-6 bg-[#18181D] border-white/10 shadow-2xl">
                    <div className="text-center space-y-2">
                        <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-3 border border-primary/20 shadow-lg shadow-primary/20">
                            <LogIn size={28} />
                        </div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight">Productivity Tracker</h1>
                        <p className="text-xs text-muted">Sign in to your account or explore with Demo Mode.</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2.5 text-red-400 text-xs font-semibold">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* 1-Click Demo / Guest Mode Button */}
                    <button
                        type="button"
                        onClick={handleGuestLogin}
                        className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:scale-[1.01] active:scale-[0.99] transition-all"
                    >
                        <Sparkles size={16} />
                        <span>Continue as Guest / Demo Mode</span>
                        <ArrowRight size={14} />
                    </button>

                    <div className="relative flex items-center justify-center">
                        <div className="border-t border-white/10 w-full" />
                        <span className="bg-[#18181D] px-3 text-[10px] uppercase font-bold text-muted tracking-wider absolute">
                            Or sign in with account
                        </span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted ml-1 uppercase tracking-wider text-[10px]">Email Address</label>
                            <div className="relative group">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-background border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition-all"
                                    placeholder="alex.rivers@productivity.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted ml-1 uppercase tracking-wider text-[10px]">Password</label>
                            <div className="relative group">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-background border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold text-xs border border-white/10 shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? "Signing in..." : "Sign In with Credentials"}
                        </Button>
                    </form>

                    <div className="text-center pt-2">
                        <p className="text-muted text-xs">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary hover:underline font-bold">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </Card>
            </MotionWrapper>
        </div>
    );
}
