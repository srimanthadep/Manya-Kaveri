import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Sparkles, Shield, Lock, Mail, ArrowRight, Hotel, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { GlassCard } from '../components/GlassCard';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@kaveri.com',
      password: 'Admin@123',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    const success = await login(data.email, data.password);
    if (success) {
      navigate('/dashboard');
    } else {
      setAuthError('Invalid credentials. Please verify your email and password.');
    }
  };

  const handleDemoFill = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'Admin@123', { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#E0E0E0] flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden">
      {/* Bento Grid Split Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-[32px] border border-white/[0.1] bg-[#121212] shadow-2xl shadow-black/80 overflow-hidden z-10">
        
        {/* Left Side: Luxury Brand Visual Showcase */}
        <div className="lg:col-span-6 relative p-8 lg:p-12 flex flex-col justify-between overflow-hidden bg-[#0E0E10] border-b lg:border-b-0 lg:border-r border-white/[0.08]">
          {/* Subtle background image texture */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-luminosity pointer-events-none"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E10] via-transparent to-transparent pointer-events-none" />

          {/* Top Brand Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white tracking-tight">Kaveri Stays</h1>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    ESTATE & SPA
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-medium">Enterprise Hotel Management System</p>
              </div>
            </div>

            <div className="space-y-4 my-8">
              <div className="bento-tag">
                <Shield className="w-3.5 h-3.5" />
                Staff Operations Portal
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Manage your hotel. <br />
                <span className="text-zinc-400">
                  Elevate every stay.
                </span>
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
                A unified hospitality command platform for reservations, guest loyalty, multi-property inventory, and revenue analytics.
              </p>
            </div>
          </div>

          {/* Luxury Brand Feature Bento Panel */}
          <div className="relative z-10 pt-4">
            <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#141416]">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2">
                  <div className="text-lg font-bold text-white">4</div>
                  <div className="text-[11px] text-zinc-400">Luxury Estates</div>
                </div>
                <div className="p-2 border-x border-white/[0.08]">
                  <div className="text-lg font-bold text-amber-300">94.8%</div>
                  <div className="text-[11px] text-zinc-400">Guest Rating</div>
                </div>
                <div className="p-2">
                  <div className="text-lg font-bold text-emerald-400">Real-Time</div>
                  <div className="text-[11px] text-zinc-400">Synchronized</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Bento Login Form */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center bg-[#121212]">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Staff Sign In</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Enter your authorized hotel credentials to access operations.
              </p>
            </div>

            {(error || authError) && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <span className="font-semibold">Error:</span> {authError || error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="admin@kaveri.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm glass-input"
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    {...register('password')}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm glass-input"
                  />
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-2xl text-sm font-bold text-black bg-white hover:bg-zinc-200 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Access Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="pt-4 border-t border-white/[0.08]">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                Quick Demo Access (Click to Fill)
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoFill('admin@kaveri.com')}
                  className="px-2.5 py-2 rounded-xl text-[11px] font-semibold bg-[#18181A] hover:bg-[#202024] border border-white/[0.08] text-zinc-300 hover:text-white transition-colors text-center truncate cursor-pointer"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('manager@kaveri.com')}
                  className="px-2.5 py-2 rounded-xl text-[11px] font-semibold bg-[#18181A] hover:bg-[#202024] border border-white/[0.08] text-zinc-300 hover:text-white transition-colors text-center truncate cursor-pointer"
                >
                  Manager
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('reception@kaveri.com')}
                  className="px-2.5 py-2 rounded-xl text-[11px] font-semibold bg-[#18181A] hover:bg-[#202024] border border-white/[0.08] text-zinc-300 hover:text-white transition-colors text-center truncate cursor-pointer"
                >
                  Receptionist
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
