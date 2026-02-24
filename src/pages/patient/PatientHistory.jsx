import React from 'react';
import { useAuth } from '../../context/AuthContext_simple';
import { usePatientAppointmentsHistory } from '../../hooks/usePatientAppointmentsHistory';

export default function PatientHistory() {
  const { user } = useAuth();
  const { history, loading, error } = usePatientAppointmentsHistory(
    user?.email || null,
  );

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500 text-sm">
        Loading your medical history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
        <span className="material-symbols-outlined">error</span>
        Failed to load medical history: {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-[#2b8cee] text-2xl">
          medical_information
        </span>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Your medical history
          </h2>
          <p className="text-sm text-slate-500">
            All your past and upcoming appointments in one place.
          </p>
        </div>
        <span className="ml-auto bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-lg font-medium">
          {history.length} records
        </span>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">
            medical_information
          </span>
          <p className="text-slate-500 font-medium mb-2">
            No medical history found
          </p>
          <p className="text-slate-400 text-sm mb-2">
            Once you book an appointment, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((appt) => (
            <div
              key={appt.id}
              className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#2b8cee]/50 transition-all hover:shadow-md relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-[#2b8cee]/10 group-hover:bg-[#2b8cee] transition-all" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex size-14 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all shrink-0">
                    <span className="material-symbols-outlined text-3xl">
                      medical_information
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="mb-3">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Chief Complaint
                      </p>
                      <p className="text-lg font-bold text-slate-900 mb-2">
                        {appt.disease || 'General consultation'}
                      </p>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Consulting Doctor
                      </p>
                      <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                        <span className="material-symbols-outlined text-[16px] text-blue-500">
                          stethoscope
                        </span>
                        Dr.{' '}
                        {appt.doctor?.name ||
                          appt.doctor?.email?.split('@')[0] ||
                          'Medical Specialist'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Visit Date
                        </p>
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <span className="material-symbols-outlined text-[14px]">
                            calendar_today
                          </span>
                          {new Date(appt.appointment_date).toLocaleDateString(
                            'en-IN',
                            {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            },
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Time
                        </p>
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                          <span className="material-symbols-outlined text-[14px]">
                            schedule
                          </span>
                          {new Date(appt.appointment_date).toLocaleTimeString(
                            'en-IN',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Patient Age
                        </p>
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <span className="material-symbols-outlined text-[14px]">
                            person
                          </span>
                          {appt.age} years
                        </div>
                      </div>
                    </div>

                    {appt.notes && (
                      <div className="mb-3">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Clinical Notes
                        </p>
                        <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-2 border border-slate-100">
                          {appt.notes}
                        </p>
                      </div>
                    )}

                    {appt.status === 'scheduled' && (
                      <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 w-fit">
                        <span className="material-symbols-outlined text-[16px] text-blue-600">
                          event
                        </span>
                        <div>
                          <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                            Appointment Status
                          </p>
                          <p className="text-sm font-bold text-blue-800">
                            Scheduled - Awaiting consultation
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0">
                  <span
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      appt.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : appt.status === 'completed'
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : appt.status === 'cancelled'
                        ? 'bg-red-100 text-red-700 border-red-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[12px] mr-1">
                      {appt.status === 'scheduled'
                        ? 'event'
                        : appt.status === 'completed'
                        ? 'check_circle'
                        : appt.status === 'cancelled'
                        ? 'cancel'
                        : 'help'}
                    </span>
                    {appt.status}
                  </span>

                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                      Appointment ID
                    </p>
                    <p className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                      {appt.token_number || appt.id.split('-')[0]}
                    </p>
                  </div>

                  <div className="text-right text-xs text-slate-500">
                    <p className="font-medium">{appt.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

