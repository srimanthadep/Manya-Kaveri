import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Building2,
  DoorOpen,
  CreditCard,
  Star,
  ClipboardList,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { cn } from '../lib/utils';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'receptionist', 'guest'] },
    { name: 'Bookings', path: '/bookings', icon: CalendarDays, roles: ['admin', 'manager', 'receptionist', 'guest'] },
    { name: 'Guests', path: '/guests', icon: Users, roles: ['admin', 'manager', 'receptionist', 'guest'] },
    { name: 'Properties', path: '/properties', icon: Building2, roles: ['admin', 'manager', 'receptionist', 'guest'] },
    { name: 'Rooms', path: '/rooms', icon: DoorOpen, roles: ['admin', 'manager', 'receptionist', 'guest'] },
    { name: 'Payments', path: '/payments', icon: CreditCard, roles: ['admin', 'manager', 'receptionist', 'guest'] },
    { name: 'Reviews', path: '/reviews', icon: Star, roles: ['admin', 'manager', 'receptionist', 'guest'] },
    { name: 'Rate Plans', path: '/rate-plans', icon: ClipboardList, roles: ['admin', 'manager', 'receptionist', 'guest'] },
    { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['admin', 'manager'] },
  ];

  const userRole = user?.role || 'guest';
  const visibleNav = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out',
          'bg-[#0D0D0F] border-r border-white/[0.08] shadow-2xl shadow-black/80',
          collapsed ? 'w-20' : 'w-64',
          // Mobile responsive classes
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-white">Kaveri Stays</span>
                  <span className="text-[10px] uppercase font-semibold tracking-widest px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    ESTATE
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400 font-medium tracking-wide">
                  Operations Console
                </span>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="p-1 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 group relative',
                    isActive
                      ? 'bg-white text-black font-semibold shadow-lg shadow-white/10'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                  )
                }
                title={collapsed ? item.name : undefined}
              >
                <Icon className={cn('w-5 h-5 shrink-0 transition-transform group-hover:scale-105')} />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info & Bottom Panel */}
        <div className="p-3 border-t border-white/[0.08] bg-[#0A0A0C]">
          <div
            className={cn(
              'flex items-center gap-3 p-2 rounded-2xl bg-[#141416] border border-white/[0.08]',
              collapsed && 'justify-center p-1.5'
            )}
          >
            <div className="relative shrink-0">
              <img
                src={
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                }
                alt={user?.name || 'Staff'}
                className="w-9 h-9 rounded-full object-cover border border-white/20"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-black" />
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Staff Member'}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider capitalize text-indigo-300">
                    {user?.role || 'Staff'}
                  </span>
                </div>
              </div>
            )}

            {!collapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {collapsed && (
            <button
              onClick={handleLogout}
              className="mt-2 w-full p-2 flex items-center justify-center rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
