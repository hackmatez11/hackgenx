import React from 'react';
import { useAuth } from '../../context/AuthContext_simple';
import { usePatientAppointmentsHistory } from '../../hooks/usePatientAppointmentsHistory';

export default function PatientOverview() {
  const { user } = useAuth();
  const { history } = usePatientAppointmentsHistory(user?.email || null);

  const totalAppointments = history.length;
  const upcoming = history.filter((a) => a.status === 'scheduled').length;
  const completed = history.filter((a) => a.status === 'completed').length;

  return (
    <div className="space-y-8">
      <section className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-[#2b8cee]/10 text-[#2b8cee]">
          <span className="material-symbols-outlined text-3xl">person</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.email?.split('@')[0]}
          </h2>
          <p className="text-sm text-slate-500">
            This is your personal health hub. Quickly book new appointments and
            review your history.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Total appointments
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totalAppointments}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
            Upcoming
          </p>
          <p className="mt-2 text-3xl font-bold text-blue-700">{upcoming}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
            Completed
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {completed}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <OverviewCard
          icon="event_available"
          title="Book an appointment"
          description="Choose your doctor and time slot, and we’ll place you in the live OPD queue."
          href="/patient-dashboard/appointments"
          accent="blue"
        />
        <OverviewCard
          icon="medical_information"
          title="View medical history"
          description="See all your past visits, doctors, and clinical notes at a glance."
          href="/patient-dashboard/history"
          accent="slate"
        />
        <OverviewCard
          icon="call"
          title="Voice consultation"
          description="Use our AI voice agent to quickly book, reschedule, or cancel your appointments."
          href="/patient-dashboard/voice-consultation"
          accent="emerald"
        />
      </section>
    </div>
  );
}

function OverviewCard({ icon, title, description, href, accent }) {
  const accentClasses =
    accent === 'blue'
      ? 'bg-blue-50 text-blue-700'
      : accent === 'emerald'
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-slate-50 text-slate-700';

  return (
    <a
      href={href}
      className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 hover:border-[#2b8cee]/60 hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${accentClasses}`}
        >
          <span className="material-symbols-outlined text-lg">{icon}</span>
        </div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      </div>
      <p className="text-xs text-slate-500 flex-1">{description}</p>
      <span className="mt-4 inline-flex items-center text-xs font-semibold text-[#2b8cee]">
        Open{' '}
        <span className="material-symbols-outlined text-sm ml-1">
          arrow_forward
        </span>
      </span>
    </a>
  );
}

