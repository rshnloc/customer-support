import React from 'react';
import { Agent } from '../types';
import { 
  Headphones, 
  Award, 
  Star, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Zap,
  Activity,
  Layers
} from 'lucide-react';

interface AgentRosterProps {
  agents: Agent[];
  onUpdateAgentStatus: (agentId: string, status: string) => void;
}

export const AgentRoster: React.FC<AgentRosterProps> = ({
  agents,
  onUpdateAgentStatus
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return { label: 'Online / Available', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 dot-bg:bg-emerald-400' };
      case 'busy':
        return { label: 'Busy (On Active Ticket)', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20 dot-bg:bg-rose-400' };
      case 'away':
        return { label: 'On Break / Away', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 dot-bg:bg-amber-400' };
      default:
        return { label: 'Offline', color: 'bg-slate-700/20 text-slate-400 border-slate-700 dot-bg:bg-slate-500' };
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Headphones className="w-5 h-5 text-indigo-400" />
              <span>Contact Center Agent Roster & Workload Balancer</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live capacity monitoring, skill matrices, and AI routing weights.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs text-slate-400">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
              {agents.filter(a => a.status === 'available').length} Available
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-rose-400 mr-2"></span>
              {agents.filter(a => a.status === 'busy').length} Busy
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-slate-500 mr-2"></span>
              {agents.filter(a => a.status === 'offline').length} Offline
            </span>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => {
            const statusConfig = getStatusBadge(agent.status);
            const loadPercent = Math.min(
              Math.round((agent.active_tickets_count / Math.max(agent.max_active_tickets, 1)) * 100),
              100
            );
            const skillsList = (agent.skills || '').split(',').filter(Boolean);

            return (
              <div
                key={agent.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition shadow-sm"
              >
                {/* Agent Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-md"
                      style={{ backgroundColor: agent.avatar_color }}
                    >
                      {agent.name.split(' ')[1]?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white leading-tight">
                        {agent.name}
                      </h3>
                      <p className="text-xs text-slate-400">{agent.department}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{agent.email}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    Tier {agent.tier}
                  </span>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400 text-[11px]">Availability:</span>
                  <select
                    value={agent.status}
                    onChange={(e) => onUpdateAgentStatus(agent.id, e.target.value)}
                    className={`text-xs px-2.5 py-1 rounded-md border font-medium focus:outline-none ${statusConfig.color}`}
                  >
                    <option value="available" className="bg-slate-900 text-slate-200">Online / Available</option>
                    <option value="busy" className="bg-slate-900 text-slate-200">Busy (Active Queue)</option>
                    <option value="away" className="bg-slate-900 text-slate-200">Away / Break</option>
                    <option value="offline" className="bg-slate-900 text-slate-200">Offline</option>
                  </select>
                </div>

                {/* Workload Capacity Meter */}
                <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center space-x-1">
                      <Activity className="w-3.5 h-3.5 text-slate-500" />
                      <span>Active Workload</span>
                    </span>
                    <span className="font-semibold text-slate-200">
                      {agent.active_tickets_count} / {agent.max_active_tickets} tickets
                    </span>
                  </div>

                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        loadPercent >= 100
                          ? 'bg-rose-500'
                          : loadPercent >= 60
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${loadPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{loadPercent}% Capacity</span>
                    <span className="flex items-center text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400 mr-1" />
                      {agent.csat_score.toFixed(1)} CSAT
                    </span>
                  </div>
                </div>

                {/* Skills Matrix */}
                <div>
                  <div className="flex items-center space-x-1 text-[11px] text-slate-400 mb-1.5">
                    <Layers className="w-3 h-3 text-slate-500" />
                    <span>Skill Tags for AI Matching:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {skillsList.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60 font-mono"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

