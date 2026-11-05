import React, { useState } from 'react';
import { Ticket, Agent } from '../types';
import { 
  Send, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  ShieldAlert, 
  Bot, 
  History, 
  CheckCheck,
  Flame,
  Tag
} from 'lucide-react';

interface TicketDetailProps {
  ticket: Ticket;
  agents: Agent[];
  onUpdateStatus: (newStatus: string) => void;
  onUpdatePriority: (newPriority: string) => void;
  onAssignAgent: (agentId: string) => void;
  onSendMessage: (content: string, senderType: 'agent' | 'ai_copilot') => void;
}

export const TicketDetail: React.FC<TicketDetailProps> = ({
  ticket,
  agents,
  onUpdateStatus,
  onUpdatePriority,
  onAssignAgent,
  onSendMessage
}) => {
  const [replyText, setReplyText] = useState('');
  const [activeTab, setActiveTab] = useState<'messages' | 'audit'>('messages');

  const handleSend = () => {
    if (!replyText.trim()) return;
    onSendMessage(replyText, 'agent');
    setReplyText('');
  };

  const handleInsertAIDraft = () => {
    if (ticket.ai_suggested_response) {
      setReplyText(ticket.ai_suggested_response);
    }
  };

  const entities: string[] = (() => {
    try {
      return JSON.parse(ticket.ai_key_entities || '[]');
    } catch {
      return [];
    }
  })();

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header Bar */}
      <div className="border-b border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded">
              {ticket.id}
            </span>
            <span className="text-xs text-slate-400">
              Channel: <span className="text-slate-200 capitalize">{ticket.channel.replace('_', ' ')}</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">
              Created: <span className="text-slate-200">{new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </span>
          </div>

          {/* Quick status & priority controls */}
          <div className="flex items-center space-x-2">
            {/* Status dropdown */}
            <select
              value={ticket.status}
              onChange={(e) => onUpdateStatus(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1 text-xs text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="open">Status: Open</option>
              <option value="in_progress">Status: In Progress</option>
              <option value="resolved">Status: Resolved</option>
              <option value="closed">Status: Closed</option>
            </select>

            {/* Priority dropdown */}
            <select
              value={ticket.priority}
              onChange={(e) => onUpdatePriority(e.target.value)}
              className={`border rounded-md px-2.5 py-1 text-xs font-medium focus:outline-none ${
                ticket.priority === 'critical'
                  ? 'bg-rose-950/80 border-rose-700 text-rose-300'
                  : ticket.priority === 'high'
                  ? 'bg-orange-950/80 border-orange-700 text-orange-300'
                  : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <option value="critical">Critical (Sev 1)</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Agent Assign Dropdown */}
            <select
              value={ticket.assigned_agent_id || ''}
              onChange={(e) => onAssignAgent(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Assign Agent...</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name} ({ag.department})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-base font-semibold text-white leading-snug">
          {ticket.title}
        </h2>
      </div>

      {/* Synthetic Customer Info Banner & Key Entities */}
      <div className="bg-slate-900/40 border-b border-slate-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-slate-300">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-medium">{ticket.customer?.name}</span>
            <span className="text-[10px] text-slate-500">({ticket.customer?.tier} Tier)</span>
          </div>

          <div className="flex items-center space-x-1 text-slate-400">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{ticket.customer?.company}</span>
          </div>

          <div className="flex items-center space-x-1 text-slate-400">
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span>{ticket.customer?.email}</span>
          </div>

          <div className="flex items-center space-x-1 text-slate-400">
            <Phone className="w-3.5 h-3.5 text-slate-500" />
            <span>{ticket.customer?.phone}</span>
          </div>
        </div>

        {/* Detected Entities */}
        {entities.length > 0 && (
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] text-slate-500 font-medium">Entities:</span>
            {entities.map((item, idx) => (
              <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 font-mono">
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs: Messages vs Audit Trail */}
      <div className="flex items-center space-x-4 px-4 pt-2 border-b border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('messages')}
          className={`pb-2 font-medium border-b-2 transition ${
            activeTab === 'messages'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Conversation ({ticket.messages?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-2 font-medium border-b-2 flex items-center space-x-1 transition ${
            activeTab === 'audit'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Timeline & Triage Audit ({ticket.audit_logs?.length || 0})</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'messages' ? (
          <div className="space-y-4 max-w-3xl">
            {ticket.messages?.map((msg) => {
              const isCustomer = msg.sender_type === 'customer';
              const isAi = msg.sender_type === 'ai_copilot';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center space-x-2 mb-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">
                      {msg.sender_name}
                    </span>
                    <span>•</span>
                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isAi && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                        AI Draft
                      </span>
                    )}
                  </div>

                  <div
                    className={`p-3.5 rounded-xl text-xs leading-relaxed max-w-xl whitespace-pre-wrap ${
                      isCustomer
                        ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
                        : isAi
                        ? 'bg-indigo-950/40 border border-indigo-800 text-indigo-100 rounded-tr-sm'
                        : 'bg-indigo-600 text-white rounded-tr-sm shadow-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Audit Logs Timeline */
          <div className="space-y-3 max-w-2xl">
            {ticket.audit_logs?.map((log) => (
              <div
                key={log.id}
                className="flex items-start space-x-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs"
              >
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  {log.action.includes('ai') ? (
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  ) : (
                    <History className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200 capitalize">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">{log.details}</p>
                  <span className="text-[10px] text-slate-500 mt-1 inline-block">
                    Triggered by: {log.performed_by}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Composer */}
      <div className="border-t border-slate-800 bg-slate-900/90 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-300">Agent Response Box</span>
          {ticket.ai_suggested_response && (
            <button
              onClick={handleInsertAIDraft}
              className="flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 border border-indigo-800/80 px-2.5 py-1 rounded-md transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply AI Suggested Response</span>
            </button>
          )}
        </div>

        <div className="relative">
          <textarea
            rows={3}
            placeholder="Type your response to the customer or load the AI draft above..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
          />

          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-slate-500">
              Press Send to update conversation & advance ticket to In Progress.
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  handleSend();
                  onUpdateStatus('resolved');
                }}
                disabled={!replyText.trim()}
                className="flex items-center space-x-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800 disabled:opacity-40 transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Send & Resolve</span>
              </button>

              <button
                onClick={handleSend}
                disabled={!replyText.trim()}
                className="flex items-center space-x-1.5 text-xs font-medium px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm disabled:opacity-40 transition active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Reply</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

