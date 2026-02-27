import React from 'react';
import {
  Phone,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  FileText,
  Hash,
} from 'lucide-react';

export default function VoiceCallCard({ call }) {
  if (!call) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'calling':
        return <Loader2 className="animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="text-emerald-500" />;
      case 'failed':
        return <XCircle className="text-red-500" />;
      default:
        return <Loader2 className="text-slate-400" />;
    }
  };

  const statusLabel = {
    calling: 'Calling...',
    completed: 'Call completed',
    failed: 'Call failed',
    idle: 'Idle',
  };

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-white">
            {getStatusIcon(call.status)}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {statusLabel[call.status] || 'Unknown'}
            </h3>
            <p className="text-xs text-slate-500">
              Real-time status of your latest voice booking
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-slate-500">
          ID: {call.call_id}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-3 text-sm">
          

          

          
        </div>

        <div className="space-y-3 text-sm">
          

          
        </div>
      </div>
    </div>
  );
}

