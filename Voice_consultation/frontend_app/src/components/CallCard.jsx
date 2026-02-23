import React from 'react';
import { Phone, CheckCircle, XCircle, Loader2, Calendar, FileText, Hash } from 'lucide-react';

const CallCard = ({ call }) => {
    if (!call) return null;

    const getStatusIcon = (status) => {
        switch (status) {
            case 'calling': return <Loader2 className="animate-spin text-blue-400" />;
            case 'completed': return <CheckCircle className="text-green-400" />;
            case 'failed': return <XCircle className="text-red-400" />;
            default: return <Loader2 className="text-gray-400" />;
        }
    };

    const statusLabel = {
        calling: 'Calling...',
        completed: 'Call Completed',
        failed: 'Call Failed',
        idle: 'Idle'
    };

    return (
        <div className="glass-card mt-8 p-6 w-full max-w-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    {getStatusIcon(call.status)}
                    <h3 className="text-xl font-bold text-white">{statusLabel[call.status] || 'Unknown'}</h3>
                </div>
                <span className="text-xs text-blue-200/60 font-mono tracking-wider uppercase">
                    ID: {call.call_id}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-blue-300 mt-1" />
                        <div>
                            <p className="text-xs text-blue-200/50 uppercase font-bold tracking-tighter">Phone Number</p>
                            <p className="text-white font-medium">{call.phone_number}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Hash className="w-5 h-5 text-purple-300 mt-1" />
                        <div>
                            <p className="text-xs text-blue-200/50 uppercase font-bold tracking-tighter">Action Type</p>
                            <p className="text-white font-medium capitalize">{call.action_type || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-pink-300 mt-1" />
                        <div>
                            <p className="text-xs text-blue-200/50 uppercase font-bold tracking-tighter">Appointment Date</p>
                            <p className="text-white font-medium">{call.appointment_date || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-300 mt-1" />
                        <div>
                            <p className="text-xs text-blue-200/50 uppercase font-bold tracking-tighter">Booking ID</p>
                            <p className="text-white font-medium font-mono">{call.booking_id || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-yellow-300 mt-1" />
                        <div className="w-full">
                            <p className="text-xs text-blue-200/50 uppercase font-bold tracking-tighter">Transcript</p>
                            <p className="text-white/80 text-sm leading-relaxed max-h-32 overflow-y-auto pr-2 custom-scrollbar italic mt-1 bg-white/5 p-3 rounded-lg border border-white/5">
                                "{call.transcript || 'No transcript available'}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CallCard;
