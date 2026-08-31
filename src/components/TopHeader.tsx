import React, { useState } from 'react';
import { Menu, Bell, Shield, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { GlassCard } from './GlassCard';

interface TopHeaderProps {
  onMobileMenuToggle: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onMobileMenuToggle }) => {
  const { user, setUser } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'VIP Check-In Today',
      desc: 'Ananya Deshmukh (Suite 101) arriving at Kaveri Palace',
      time: '10 mins ago',
      type: 'info',
    },
    {
      id: 2,
      title: 'High Occupancy Alert',
      desc: 'Coorg River Mist reached 92% occupancy for weekend',
      time: '1 hour ago',
      type: 'warning',
    },
    {
      id: 3,
      title: 'Payment Received',
      desc: '₹1,40,000 received for Presidential Penthouse',
      time: '2 hours ago',
      type: 'success',
    },
  ];

  const handleSwitchRole = (role: 'admin' | 'manager' | 'receptionist' | 'guest') => {
    if (!user) return;
    const names = {
      admin: 'Srimanth Adepu (Admin)',
      manager: 'Meera Nambiar (Manager)',
      receptionist: 'Karan Patel (Receptionist)',
      guest: 'Guest Visitor',
    };
    const updated = {
      ...user,
      role,
      name: names[role],
    };
    setUser(updated);
    setShowRoleSwitcher(false);
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-[#080808]/90 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="p-2 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/[0.08] lg:hidden transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-zinc-200">Kaveri Stays Core API</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">Live Sync</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Role Quick Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#141416] hover:bg-[#1A1A1D] border border-white/[0.1] text-xs text-zinc-200 font-medium transition-all"
            title="Switch staff role for demo/testing"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span className="capitalize">{user?.role || 'Role'}</span>
            <span className="text-[10px] text-indigo-300 bg-indigo-500/15 px-1.5 py-0.5 rounded-full ml-1 font-mono font-bold">
              ROLE
            </span>
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-52 z-50">
              <GlassCard variant="elevated" className="p-2 space-y-1">
                <div className="px-2 py-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Select Staff Role
                </div>
                {(['admin', 'manager', 'receptionist', 'guest'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleSwitchRole(r)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium capitalize flex items-center justify-between transition-colors ${
                      user?.role === r
                        ? 'bg-white text-black font-bold'
                        : 'text-zinc-300 hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    <span>{r}</span>
                    {user?.role === r && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                  </button>
                ))}
              </GlassCard>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-2xl bg-[#141416] hover:bg-[#1A1A1D] border border-white/[0.1] text-zinc-300 hover:text-white transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-black" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 z-50">
              <GlassCard variant="elevated" className="p-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">Live Activity</h4>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-medium">3 new</span>
                </div>

                <div className="space-y-2.5">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-2xl bg-[#18181A] border border-white/[0.06] hover:bg-[#202024] transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        {n.type === 'warning' ? (
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-zinc-200">{n.title}</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{n.desc}</p>
                          <span className="text-[10px] text-zinc-500 mt-1 block font-mono">{n.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}
        </div>

        {/* Staff User Avatar & Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-white/[0.1]">
          <img
            src={
              user?.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
            }
            alt={user?.name || 'Staff'}
            className="w-8 h-8 rounded-full object-cover border border-white/20"
            referrerPolicy="no-referrer"
          />
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-white leading-tight">{user?.name || 'Staff User'}</p>
            <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">
              {user?.role || 'Staff'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
