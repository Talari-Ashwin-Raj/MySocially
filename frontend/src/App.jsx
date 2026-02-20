import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TrendingUp,
  DollarSign,
  Target,
  Layout,
  AlertCircle,
  Zap,
  ArrowRight,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';

const API_BASE = 'http://localhost:5001/api';

const App = () => {
  const [summary, setSummary] = useState(null);
  const [channels, setChannels] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, chanRes, monthRes, insRes] = await Promise.all([
          axios.get(`${API_BASE}/summary`),
          axios.get(`${API_BASE}/channels`),
          axios.get(`${API_BASE}/monthly`),
          axios.get(`${API_BASE}/insights`)
        ]);
        setSummary(sumRes.data);
        setChannels(chanRes.data);
        setMonthly(monthRes.data);
        setInsights(insRes.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Zap size={48} className="animate-pulse text-indigo-500" />
    </div>
  );

  return (
    <div className="dashboard-container animate-fade-in">
      <header>
        <div>
          <h1>Marketing Pulse</h1>
          <p className="subtitle">Real-time advertising performance & strategy</p>
        </div>
        <div className="card" style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem' }}>
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>Last updated: Today, {new Date().toLocaleTimeString()}</span>
        </div>
      </header>

      {/* KPI Section */}
      <div className="kpi-grid">
        <KPICard
          label="Total Spend"
          value={`$${summary?.total_spend.toLocaleString()}`}
          icon={<DollarSign size={20} />}
          color="#6366f1"
        />
        <KPICard
          label="Total Revenue"
          value={`$${summary?.total_revenue.toLocaleString()}`}
          icon={<TrendingUp size={20} />}
          color="#10b981"
        />
        <KPICard
          label="Conversions"
          value={summary?.total_conversions.toLocaleString()}
          icon={<Target size={20} />}
          color="#f59e0b"
        />
        <KPICard
          label="Overall ROAS"
          value={`${summary?.overall_roas.toFixed(2)}x`}
          icon={<Zap size={20} />}
          color="#8b5cf6"
        />
      </div>

      <div className="main-grid">
        {/* Monthly Trend Chart */}
        <section className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} /> Revenue vs Spend Trend
          </h3>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: '#19191e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                <Area type="monotone" dataKey="spend" stroke="#6366f1" fillOpacity={1} fill="url(#colorSpend)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Strategy Panel */}
        <section className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={18} /> Strategic Insights
          </h3>
          <div style={{ display: 'flex', flex_direction: 'column', gap: '1rem' }}>
            {insights.map((insight, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ marginTop: '0.25rem' }}>
                  <ArrowRight size={14} className="text-indigo-400" />
                </div>
                <p style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>{insight}</p>
              </div>
            ))}
          </div>
          <button style={{
            marginTop: '2rem',
            width: '100%',
            padding: '0.75rem',
            background: 'var(--primary)',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            Download Full Report
          </button>
        </section>
      </div>

      {/* Channel Performance Table */}
      <section className="card">
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layout size={18} /> Channel Efficiency Breakdown
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Channel</th>
                <th>Ad Spend</th>
                <th>Impressions</th>
                <th>Clicks</th>
                <th>Revenue</th>
                <th>ROAS</th>
                <th>CPA</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((chan) => (
                <tr key={chan.name}>
                  <td style={{ fontWeight: '600' }}>{chan.name}</td>
                  <td>${chan.spend.toLocaleString()}</td>
                  <td>{chan.impressions.toLocaleString()}</td>
                  <td>{chan.clicks.toLocaleString()}</td>
                  <td>${chan.revenue.toLocaleString()}</td>
                  <td>
                    <span className={`status-chip ${chan.roas > 4 ? 'status-success' : chan.roas < 2 ? 'status-danger' : 'status-warning'}`}>
                      {chan.roas.toFixed(2)}x
                    </span>
                  </td>
                  <td>${chan.cpa.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const KPICard = ({ label, value, icon, color }) => (
  <div className="card kpi-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span className="kpi-label">{label}</span>
      <div style={{ color }}>{icon}</div>
    </div>
    <div className="kpi-value">{value}</div>
  </div>
);

export default App;
