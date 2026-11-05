import React from 'react';
import { Ticket, Agent } from '../types';
import { 
  Sparkles, 
  BrainCircuit, 
  UserCheck, 
  ShieldCheck, 
  RefreshCw, 
  Gauge, 
  Lightbulb, 
  CheckCircle,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

interface AICopilotPanelProps {
  ticket: Ticket;
  agents: Agent[];
  onTriggerTriage: () => void;
  onAutoAssign: () => void;
  isTriaging: boolean;
}

export const AICopilotPanel: React.FC<AICopilotPanelProps> = ({
  ticket,
  agents,
  onTriggerTriage,
  onAutoAssign,
  isTriaging
}) => {
  // Sentiment color & emoji
  const getSentimentDisplay = () => {
    switch (ticket.sentiment) {
      case 'Angry':
        return { emoji: '😡', label: 'Angry / High Risk', color: 'text-rose-400 bg-rose-950/60 border-rose-800' };
      case 'Frustrated':
        return { emoji: '😟', label: 'Frustrated / Displeased', color: 'text-amber-400 bg-amber-950/60 border-amber-800' };
      case 'Positive':
        return { emoji: '😊', label: 'Positive / Satisfied', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' };
      default:
        return { emoji: '😐', label: 'Neutral / Informational', color: 'text-slate-300 bg-slate-800 border-slate-700' };
    }
  };

  const sentimentInfo = getSentimentDisplay();
  const sentimentPct = Math.round(((ticket.sentiment_score + 1) / 2) * 100);

  return (
    <div className="w-80 shrink-0 h-full bg-slate-900 border-l border-slate-800 flex flex-col overflow-y-auto">
      {/* Copilot Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Copilot & Triage</h3>
            <span className="text-[10px] text-indigo-400 font-medium">Confidence: {Math.round(ticket.ai_confidence * 100)}%</span>
          </div>
        </div>

        <button
          onClick={onTriggerTriage}
          disabled={isTriaging}
          title="Re-run AI sentiment and triage analysis"
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isTriaging ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>

      <div className="p-4 space-y-4 text-xs">
        {/* Executive Summary */}
        <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/50">
          <div className="flex items-center space-x-1.5 text-indigo-300 font-semibold mb-1">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>AI Incident Summary</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {ticket.ai_summary || 'Analyzing ticket details...'}
          </p>
        </div>

        {/* Sentiment & Emotion Telemetry */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium flex items-center space-x-1">
              <Gauge className="w-3.5 h-3.5 text-slate-400" />
              <span>Customer Emotion</span>
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${sentimentInfo.color}`}>
              {sentimentInfo.emoji} {ticket.sentiment}
            </span>
          </div>

          {/* Sentiment Meter Bar */}
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-500 ${
                  ticket.sentiment === 'Angry'
                    ? 'bg-rose-500'
                    : ticket.sentiment === 'Frustrated'
                    ? 'bg-amber-500'
                    : ticket.sentiment === 'Positive'
                    ? 'bg-emerald-500'
                    : 'bg-slate-500'
                }`}
                style={{ width: `${Math.max(sentimentPct, 15)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>Frustrated (-1.0)</span>
              <span>Neutral (0.0)</span>
              <span>Positive (+1.0)</span>
            </div>
          </div>
        </div>

        {/* Urgency & Taxonomy */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Urgency Score</span>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <div
                  key={lvl}
                  className={`w-2 h-4 rounded-sm transition-all ${
                    lvl <= ticket.urgency_score
                      ? lvl >= 4
                        ? 'bg-rose-500'
                        : lvl === 3
                        ? 'bg-amber-500'
                        : 'bg-indigo-500'
                      : 'bg-slate-800'
                  }`}
                />
              ))}
              <span className="ml-1 font-bold text-slate-200">{ticket.urgency_score}/5</span>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Classified Domain:</span>
            <span className="font-semibold text-slate-200">{ticket.category}</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Sub-Category:</span>
            <span className="text-indigo-400 font-medium">{ticket.sub_category}</span>
          </div>
        </div>

        {/* Smart Agent Routing & Rationale */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium flex items-center space-x-1">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Smart Routing</span>
            </span>
            {ticket.auto_assigned && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                AI Auto-Routed
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900 p-2 rounded border border-slate-800/80">
            {ticket.assignment_rationale || 'No AI routing rationale available yet.'}
          </p>

          <button
            onClick={onAutoAssign}
            className="w-full mt-2 flex items-center justify-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700/80 text-indigo-300 hover:text-white border border-slate-700 p-2 rounded-md transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Re-evaluate Smart Routing</span>
          </button>
        </div>

        {/* Suggested Response Preview */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Response Strategy</span>
            </span>
            <span className="text-[10px] text-slate-500">Ready</span>
          </div>

          <p className="text-[11px] text-slate-400 line-clamp-4 italic bg-slate-900/60 p-2 rounded border border-slate-800">
            "{ticket.ai_suggested_response?.slice(0, 160)}..."
          </p>
        </div>
      </div>
    </div>
  );
};

