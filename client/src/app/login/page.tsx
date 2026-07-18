'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { Eye, EyeOff, LogIn, Shield, Users, BarChart3 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (email: string) => {
    setEmail(email);
    setPassword('Password@123');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel – Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-primary">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/10 animate-pulse" />
          <div className="absolute top-1/2 -left-20 w-60 h-60 rounded-full bg-white/5 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-white/10 animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
              <Users className="w-8 h-8" />
            </div>
            <h1 className="text-5xl font-bold mb-4">
              Employee<br />Management<br />System
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              Streamline your workforce management with powerful tools for HR, 
              organizational hierarchy, and real-time analytics.
            </p>
          </div>

          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <span>Role-based access control with 3-tier security</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <span>Organizational hierarchy with reporting trees</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span>Real-time dashboard with analytics charts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel – Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">EMS</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-2">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field h-12"
                placeholder="admin@ems.com"
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field h-12 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full h-12 text-base font-semibold"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign in
                </>
              )}
            </button>
          </form>

          {/* Quick login buttons */}
          <div className="mt-8">
            <p className="text-xs text-muted-foreground text-center mb-3">Quick login (demo)</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickLogin('admin@ems.com')}
                className="btn-ghost text-xs py-2 px-2 rounded-lg border border-border hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <span className="badge badge-admin text-[10px] mb-1">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin('priya.patel@ems.com')}
                className="btn-ghost text-xs py-2 px-2 rounded-lg border border-border hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <span className="badge badge-hr text-[10px] mb-1">HR</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin('amit.joshi@ems.com')}
                className="btn-ghost text-xs py-2 px-2 rounded-lg border border-border hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/20"
              >
                <span className="badge badge-employee text-[10px] mb-1">Employee</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Default password: <code className="px-1.5 py-0.5 rounded bg-muted text-xs">Password@123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
