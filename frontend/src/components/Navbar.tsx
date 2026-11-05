import React from 'react';
import { Bot, Headphones, BarChart3, PlusCircle, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentTab: 'queue' | 'agents' | 'analytics';
  setCurrentTab: (tab: 'queue' | 'agents' | 'analytics') => void;
  openNewTicketModal: () => void;
  onResetData: () => void;
  criticalCount: number;
  openCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openNewTicketModal,
  onResetData,
  criticalCount,
  openCount
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Brand & Mode */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">Nexus AI</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                  Contact Center v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Intelligent Ticket Triage & Workload Auto-Assignment</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-2 pl-4 border-l border-slate-800">
            <div className="flex items-center text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2"></span>
              AI Router Active
            </div>
            {criticalCount > 0 && (
              <div className="flex items-center text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2.5 py-1 rounded-md">
                <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                {criticalCount} Critical P0/P1
              </div>
            )}
            <div className="text-xs text-slate-400 px-2 py-1">
              {openCount} Open Tickets
            </div>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <nav className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setCurrentTab('queue')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all ${
              currentTab === 'queue'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Ticket Queue</span>
          </button>

          <button
            onClick={() => setCurrentTab('agents')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all ${
              currentTab === 'agents'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Agent Roster</span>
          </button>

          <button
            onClick={() => setCurrentTab('analytics')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all ${
              currentTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onResetData}
            title="Reset to safe synthetic test data"
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          <button
            onClick={openNewTicketModal}
            className="flex items-center space-x-1.5 text-xs font-medium bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-3.5 py-1.5 rounded-lg shadow-md shadow-indigo-600/20 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ingest Ticket</span>
          </button>
        </div>
      </div>
    </header>
  );
};

