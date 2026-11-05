import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Mail, 
  MessageSquare, 
  PhoneCall, 
  Globe, 
  CheckCircle,
  ShieldCheck
} from 'lucide-react';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticketData: {
    title: string;
    description: string;
    customer_name: string;
    customer_email: string;
    channel: string;
  }) => Promise<void>;
}

const TEMPLATES = [
  {
    name: 'Critical API Outage',
    channel: 'phone_call',
    customer_name: 'Customer Jordan Lee',
    customer_email: 'jordan.lee@example.com',
    title: 'URGENT: Production 504 Gateway Timeout on payments endpoint',
    description: 'We are experiencing complete downtime on our production API gateway. Customers cannot complete checkout and are receiving Error 504 Gateway Timeout. This is blocking business transactions.'
  },
  {
    name: 'Billing Refund Request',
    channel: 'email',
    customer_name: 'Customer Dana Brooks',
    customer_email: 'dana.brooks@example.org',
    title: 'Requesting refund for duplicate invoice charge INV-9102',
    description: 'Hello, our corporate account was billed twice for the Annual Pro License under invoice INV-9102. Please review our subscription history and reverse the second $850 charge.'
  },
  {
    name: 'SSO 2FA Lockout',
    channel: 'live_chat',
    customer_name: 'Customer Riley Bennett',
    customer_email: 'riley.bennett@example.org',
    title: 'Admin locked out of dashboard after 2FA security reset',
    description: 'I recently upgraded my authenticator app and the 6-digit MFA token is rejected with unauthorized access code 401. I am an enterprise administrator and need emergency reset.'
  }
];

export const NewTicketModal: React.FC<NewTicketModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [channel, setChannel] = useState('email');
  const [customerName, setCustomerName] = useState('Customer Alex Mercer');
  const [customerEmail, setCustomerEmail] = useState('alex.mercer@example.com');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setChannel(tpl.channel);
    setCustomerName(tpl.customer_name);
    setCustomerEmail(tpl.customer_email);
    setTitle(tpl.title);
    setDescription(tpl.description);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        description,
        customer_name: customerName,
        customer_email: customerEmail,
        channel
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Ingest Ticket / Multi-Channel Simulator</h3>
              <p className="text-[11px] text-slate-400">Triggers instant AI sentiment analysis, classification & smart routing</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Demo Templates */}
        <div className="px-5 pt-3 pb-2 bg-slate-950/40 border-b border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mb-1.5">
            Quick Synthetic Scenarios:
          </span>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.name}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              >
                + {tpl.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Channel Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Ingestion Channel
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'email', label: 'Email', icon: Mail },
                { id: 'live_chat', label: 'Live Chat', icon: MessageSquare },
                { id: 'phone_call', label: 'Call Transcript', icon: PhoneCall },
                { id: 'portal', label: 'Portal Form', icon: Globe },
              ].map((ch) => {
                const Icon = ch.icon;
                const isSelected = channel === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setChannel(ch.id)}
                    className={`flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg text-xs font-medium border transition ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="truncate">{ch.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer Metadata (Synthetic) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Customer Name (Synthetic)
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Customer Jordan Lee"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Customer Email (Test domain)
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="e.g. user@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Ticket Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Issue Title / Subject
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. REST API returning 504 on checkout..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Customer Message / Call Transcript
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue or paste simulated customer inquiry..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center text-[11px] text-slate-500 bg-slate-950/40 p-2 rounded border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0" />
            <span>Strict Privacy Mode: All inputs operate on synthetic test entities with zero live credentials.</span>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="text-xs px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700/80 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim()}
              className="flex items-center space-x-1.5 text-xs font-semibold px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md disabled:opacity-40 transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'AI Triaging...' : 'Ingest & Auto-Assign'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

