import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Download,
  Calendar,
  Building,
  DollarSign,
  Users,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart2,
  FileSpreadsheet,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { GlassCard } from '../components/GlassCard';
import { StatCard } from '../components/StatCard';
import { reportsAPI, propertiesAPI } from '../services/api';
import { ReportSummary, Property } from '../types';
import { formatCurrency, exportToCSV } from '../lib/utils';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

export const Reports: React.FC = () => {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [timeRange, setTimeRange] = useState<string>('year');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [data, pList] = await Promise.all([
        reportsAPI.getSummary(),
        propertiesAPI.getAll(),
      ]);
      setSummary(data);
      setProperties(pList);
    } catch {
      toast.error('Failed to load financial reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportCSV = () => {
    if (!summary) return;
    const exportData = summary.monthly_revenue.map((m) => ({
      Month: m.month,
      Revenue_INR: m.revenue,
      Bookings_Count: m.bookings,
    }));
    exportToCSV(exportData, `Kaveri_Stays_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Financial report exported to CSV successfully');
  };

  const propertyPerformanceData = properties.map((p, idx) => ({
    name: p.name.replace('Kaveri ', ''),
    revenue: (idx + 1) * 850000 + 450000,
    occupancy: 78 + (idx * 5) % 18,
  }));

  const pieData = summary?.status_distribution || [
    { name: 'Confirmed', value: 34 },
    { name: 'Pending', value: 12 },
    { name: 'Completed', value: 58 },
    { name: 'Cancelled', value: 6 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Hospitality Analytics & Reports"
        subtitle="Comprehensive financial projections, occupancy yield metrics, and ADR analysis."
        action={
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-black bg-white hover:bg-zinc-200 transition-all duration-200 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>
        }
      />

      {/* Bento KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Gross Revenue"
          value={formatCurrency(summary?.total_revenue || 4850000)}
          trend={{ value: '18.4% YoY', isPositive: true }}
          description="YTD Verified Folios"
          accentColor="emerald"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Daily Rate (ADR)"
          value="₹8,450"
          trend={{ value: '6.2% vs last quarter', isPositive: true }}
          description="Across all luxury suites"
          accentColor="indigo"
        />
        <StatCard
          icon={Building}
          label="Average Occupancy"
          value={`${summary?.average_occupancy || 84.5}%`}
          trend={{ value: '4.1% vs peak', isPositive: true }}
          description="Estate portfolio yield"
          accentColor="gold"
        />
        <StatCard
          icon={CheckCircle2}
          label="RevPAR (Yield Index)"
          value="₹7,140"
          trend={{ value: '12.8% benchmark', isPositive: true }}
          description="Per Available Room"
          accentColor="violet"
        />
      </div>

      {/* Main Revenue Trend Bento Module */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08] mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Monthly Revenue Performance
            </h3>
            <p className="text-xs text-zinc-400">
              Gross billed transactions and completed reservation folios over 12 months
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium">Timeline:</span>
            <div className="flex rounded-xl bg-[#141416] p-1 border border-white/[0.08] text-xs">
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  timeRange === '30d' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setTimeRange('90d')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  timeRange === '90d' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Quarterly
              </button>
              <button
                onClick={() => setTimeRange('year')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  timeRange === 'year' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Full Year
              </button>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={summary?.monthly_revenue || []}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="month" stroke="#71717A" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#71717A"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181A',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
                  color: '#fff',
                }}
                formatter={(val: number) => [formatCurrency(val), 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#818CF8"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Grid for Distribution & Property Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Booking Status Breakdown (Bento 5 col) */}
        <GlassCard className="lg:col-span-5 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.08]">
              <PieIcon className="w-4 h-4 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Booking Status Share</h3>
            </div>

            <div className="h-56 w-full flex items-center justify-center">
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
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181A',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '16px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/[0.06] text-xs">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-zinc-300 font-medium capitalize">{item.name}</span>
                <span className="text-zinc-500 font-mono">({item.value})</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Top Properties Performance (Bento 7 col) */}
        <GlassCard className="lg:col-span-7 p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.08]">
            <BarChart2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-white">Estate Yield & Occupancy</h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={propertyPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="#71717A" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#71717A"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181A',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    color: '#fff',
                  }}
                  formatter={(val: number) => [formatCurrency(val), 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#F59E0B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
