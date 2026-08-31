import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  CalendarCheck,
  Percent,
  TrendingUp,
  Building2,
  LogIn,
  LogOut,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { GlassCard } from '../components/GlassCard';
import { StatCard } from '../components/StatCard';
import { PageHeader } from '../components/PageHeader';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { reportsAPI } from '../services/api';
import {
  DashboardSummary,
  DailyRevenue,
  RevenueByProperty,
  BookingStatusSummary,
  FutureBooking30Days,
} from '../types';
import { formatCurrency } from '../lib/utils';

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [propertyRevenue, setPropertyRevenue] = useState<RevenueByProperty[]>([]);
  const [statusSummary, setStatusSummary] = useState<BookingStatusSummary | null>(null);
  const [futureBookings, setFutureBookings] = useState<FutureBooking30Days[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sum, daily, propRev, status, future] = await Promise.all([
        reportsAPI.getDashboardSummary(),
        reportsAPI.getDailyRevenue(),
        reportsAPI.getRevenueByProperty(),
        reportsAPI.getBookingStatusSummary(),
        reportsAPI.getFutureBookings30Days(),
      ]);
      setSummary(sum);
      setDailyRevenue(daily);
      setPropertyRevenue(propRev);
      setStatusSummary(status);
      setFutureBookings(future);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const pieData = [
    { name: 'Confirmed', value: statusSummary?.confirmed || 5, color: '#10B981' },
    { name: 'Pending', value: statusSummary?.pending || 2, color: '#F59E0B' },
    { name: 'Cancelled', value: statusSummary?.cancelled || 1, color: '#EF4444' },
    { name: 'Completed', value: statusSummary?.completed || 4, color: '#6366F1' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#18181A] border border-white/15 p-3 rounded-2xl shadow-2xl text-xs">
          <p className="font-bold text-white mb-1">{label}</p>
          <p className="text-indigo-400 font-medium">
            Revenue: <span className="font-bold text-white">{formatCurrency(payload[0].value)}</span>
          </p>
          {payload[0].payload.bookings && (
            <p className="text-zinc-400 mt-0.5">Bookings: {payload[0].payload.bookings}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & Refresh */}
      <PageHeader
        title="Operations Command Center"
        subtitle="Real-time multi-property occupancy, revenue trends, and operational check-ins."
        action={
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold glass-button-secondary cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Metrics</span>
          </button>
        }
      />

      {/* Bento Top KPI Cards */}
      {loading || !summary ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={formatCurrency(summary.total_revenue)}
            trend={{ value: '14.8% vs last month', isPositive: true }}
            accentColor="gold"
          />
          <StatCard
            icon={CalendarCheck}
            label="Total Bookings"
            value={summary.total_bookings}
            trend={{ value: '8.2% vs last month', isPositive: true }}
            accentColor="indigo"
          />
          <StatCard
            icon={Percent}
            label="Average Occupancy"
            value={`${summary.avg_occupancy}%`}
            description="Across 4 luxury properties"
            accentColor="emerald"
          />
          <StatCard
            icon={TrendingUp}
            label="Average ADR"
            value={formatCurrency(summary.avg_adr)}
            description="Average daily room rate"
            accentColor="violet"
          />
        </div>
      )}

      {/* Bento Secondary Operational Modules */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={Building2}
            label="Active Estates"
            value={summary.properties_count}
            description="Bangalore, Coorg, Mysore, Hyderabad"
            accentColor="indigo"
          />
          <StatCard
            icon={LogIn}
            label="Today's Check-ins"
            value={summary.today_checkins}
            description="Guests arriving today"
            accentColor="emerald"
          />
          <StatCard
            icon={LogOut}
            label="Today's Check-outs"
            value={summary.today_checkouts}
            description="Departures scheduled today"
            accentColor="rose"
          />
        </div>
      )}

      {/* Bento Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Revenue AreaChart (Bento 8 col) */}
        <div className="lg:col-span-8">
          <GlassCard className="p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Daily Revenue Trend</h3>
                <p className="text-xs text-zinc-400">7-day performance across estate portfolio</p>
              </div>
              <div className="bento-tag">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Live Feed
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#71717A"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <YAxis
                    stroke="#71717A"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${val / 1000}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#818CF8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Booking Status PieChart (Bento 4 col) */}
        <div className="lg:col-span-4">
          <GlassCard className="p-6 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Booking Status</h3>
              <p className="text-xs text-zinc-400">Distribution of active reservations</p>
            </div>

            <div className="h-64 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.5)" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181A',
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '16px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', color: '#A1A1AA', paddingTop: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
              <span>Total Tracked</span>
              <span className="font-bold text-white">{summary?.total_bookings || 0} Bookings</span>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Bento Bottom Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue by Property (Bento 7 col) */}
        <div className="lg:col-span-7">
          <GlassCard className="p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Revenue by Estate</h3>
                <p className="text-xs text-zinc-400">Financial distribution across active properties</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0E0E10]">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-white/[0.08] bg-[#141416]">
                  <tr>
                    <th className="py-3 px-4">Estate Property</th>
                    <th className="py-3 px-4">Revenue</th>
                    <th className="py-3 px-4">Bookings</th>
                    <th className="py-3 px-4">Nights Sold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {propertyRevenue.map((prop) => (
                    <tr key={prop.property_id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{prop.property_name}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-400">
                        {formatCurrency(prop.revenue)}
                      </td>
                      <td className="py-3 px-4">{prop.bookings_count}</td>
                      <td className="py-3 px-4">{prop.nights_sold} nights</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Future Bookings (Next 30 Days) (Bento 5 col) */}
        <div className="lg:col-span-5">
          <GlassCard className="p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Future Forecast</h3>
                <p className="text-xs text-zinc-400">Next 30 days projected inventory</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-indigo-400" />
            </div>

            <div className="space-y-3 flex-1 flex flex-col justify-around">
              {futureBookings.map((fb, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#141416] border border-white/[0.06] flex items-center justify-between hover:bg-[#1A1A1E] transition-colors"
                >
                  <div>
                    <p className="text-xs font-bold text-white">{fb.date}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{fb.total_nights} total room nights</p>
                  </div>
                  <div className="text-right">
                    <span className="bento-tag font-bold">
                      {fb.booking_count} Bookings
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

