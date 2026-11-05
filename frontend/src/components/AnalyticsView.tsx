import React from 'react';
import { AnalyticsData } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Smile, 
  Frown, 
  Meh, 
  Flame,
  Radio,
  Layers,
  Users
} from 'lucide-react';

interface AnalyticsViewProps {
  analytics: AnalyticsData | null;
  loading: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics, loading }) => {
  if (loading || !analytics) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-500 text-xs">
        Loading contact center telemetry...
      </div>
    );
  }

  const sentimentTotal = Object.values(analytics.sentiment_distribution).reduce((a, b) => a + b, 0) || 1;
  const categoryTotal = Object.values(analytics.category_distribution).reduce((a, b) => a + b, 0) || 1;
  const channelTotal = Object.values(analytics.channel_distribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <span>Contact Center Operations & AI Triage Intelligence</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time queue analytics, customer sentiment, SLA health, and capacity allocation.
          </p>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <span className="text-[11px] text-slate-400">Total Volume</span>
            <div className="text-xl font-bold text-white">{analytics.total_tickets}</div>
            <span className="text-[10px] text-slate-500">All channels</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <span className="text-[11px] text-amber-400">Open Queue</span>
            <div className="text-xl font-bold text-amber-300">{analytics.open_tickets}</div>
            <span className="text-[10px] text-slate-500">Awaiting triage/action</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <span className="text-[11px] text-rose-400 flex items-center">
              <Flame className="w-3 h-3 mr-1 text-rose-400" />
              Critical (P0)
            </span>
            <div className="text-xl font-bold text-rose-300">{analytics.critical_tickets}</div>
            <span className="text-[10px] text-slate-500">High impact</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <span className="text-[11px] text-rose-400 flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              SLA Breaches
            </span>
            <div className="text-xl font-bold text-rose-300">{analytics.sla_breached_count}</div>
            <span className="text-[10px] text-slate-500">Beyond SLA limit</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <span className="text-[11px] text-emerald-400 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Avg 1st Response
            </span>
            <div className="text-xl font-bold text-emerald-300">{analytics.avg_first_response_minutes}m</div>
            <span className="text-[10px] text-slate-500">AI-assisted target: &lt;15m</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <span className="text-[11px] text-indigo-400 flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Resolved
            </span>
            <div className="text-xl font-bold text-indigo-300">{analytics.resolved_tickets}</div>
            <span className="text-[10px] text-slate-500">Avg {analytics.avg_resolution_hours}h handle time</span>
          </div>
        </div>

        {/* Charts & Distributions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sentiment Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center space-x-1.5">
                <Smile className="w-4 h-4 text-emerald-400" />
                <span>Customer Sentiment Health</span>
              </h3>
            </div>

            <div className="space-y-2.5">
              {[
                { label: 'Positive', count: analytics.sentiment_distribution['Positive'] || 0, color: 'bg-emerald-500', text: 'text-emerald-400' },
                { label: 'Neutral', count: analytics.sentiment_distribution['Neutral'] || 0, color: 'bg-slate-500', text: 'text-slate-300' },
                { label: 'Frustrated', count: analytics.sentiment_distribution['Frustrated'] || 0, color: 'bg-amber-500', text: 'text-amber-400' },
                { label: 'Angry', count: analytics.sentiment_distribution['Angry'] || 0, color: 'bg-rose-500', text: 'text-rose-400' },
              ].map((item) => {
                const pct = Math.round((item.count / sentimentTotal) * 100);
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className={item.text}>{item.label}</span>
                      <span className="text-slate-400">{item.count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Domain Classification</span>
            </h3>

            <div className="space-y-2.5">
              {Object.entries(analytics.category_distribution).map(([cat, count]) => {
                const pct = Math.round((count / categoryTotal) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">{cat}</span>
                      <span className="text-slate-400">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ingestion Channel Mix */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center space-x-1.5">
              <Radio className="w-4 h-4 text-amber-400" />
              <span>Ingestion Channels</span>
            </h3>

            <div className="space-y-2.5">
              {Object.entries(analytics.channel_distribution).map(([chan, count]) => {
                const pct = Math.round((count / channelTotal) * 100);
                return (
                  <div key={chan} className="space-y-1">
                    <div className="flex justify-between text-xs capitalize">
                      <span className="text-slate-300">{chan.replace('_', ' ')}</span>
                      <span className="text-slate-400">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Agent Load Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Agent Capacity Utilization & Shift Status</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Agent Name</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Active / Max Load</th>
                  <th className="py-2.5 px-3">Utilization</th>
                  <th className="py-2.5 px-3">CSAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {analytics.agent_workload.map((ag) => (
                  <tr key={ag.agent_id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-medium text-slate-200">{ag.name}</td>
                    <td className="py-2.5 px-3 text-slate-400">{ag.department}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        ag.status === 'available'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : ag.status === 'busy'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {ag.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {ag.active_tickets} / {ag.max_active_tickets}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              ag.utilization_pct >= 100
                                ? 'bg-rose-500'
                                : ag.utilization_pct >= 60
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(ag.utilization_pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-slate-400">{ag.utilization_pct}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-amber-400 font-medium">★ {ag.csat_score.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

