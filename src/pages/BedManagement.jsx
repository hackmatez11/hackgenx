import React, { useState } from 'react';

// ── Bed Data ──────────────────────────────────────────────────────────────────

const beds = [
    { id: 'ICU-01', status: 'occupied', patient: 'Johnathan Doe', meta: 'Age: 45 • Male • Adm: 2d ago', detail: 'Post-Op Recovery', timeLeft: '~4h left', tags: [] },
    { id: 'ICU-02', status: 'available' },
    { id: 'ER-05', status: 'critical', patient: 'Sarah Smith', meta: 'Age: 72 • Female • Adm: 30m ago', monitoring: 'Monitoring', tags: [{ label: 'Ventilator', danger: true }, { label: 'Cardiac' }] },
    { id: 'ICU-03', status: 'cleaning', cleaningNote: 'Housekeeping assigned\nStarted 10m ago' },
    { id: 'ICU-04', status: 'occupied', patient: 'Michael Chen', meta: 'Age: 33 • Male • Adm: 4h ago', detail: 'Observation', timeLeft: '~1d left', tags: [] },
    { id: 'ICU-05', status: 'available' },
    { id: 'GEN-12', status: 'occupied', patient: 'Emma Wilson', meta: 'Age: 58 • Female • Adm: 5d ago', detail: 'Pneumonia', timeLeft: '~2h left', tags: [] },
    { id: 'ER-02', status: 'critical', patient: 'Unknown Male', meta: 'Age: ~30 • Male • Adm: 5m ago', monitoring: 'Unstable', tags: [{ label: 'Trauma', danger: true }, { label: 'Isolation', warning: true }] },
    { id: 'GEN-14', status: 'available' },
];

const WARDS = ['All Wards', 'ICU', 'General Ward', 'Emergency', 'Pediatrics'];

const occupancyStats = [
    { label: 'Occupied', count: 135, color: 'bg-[#2b8cee]' },
    { label: 'Available', count: 24, color: 'bg-green-500' },
    { label: 'Cleaning', count: 8, color: 'bg-yellow-500' },
    { label: 'Emergency', count: 3, color: 'bg-red-500' },
];

const priorityAlerts = [
    {
        icon: 'group_add', iconBg: 'bg-red-50', iconColor: 'text-red-500',
        title: 'ED Surge Detected',
        desc: 'Patient influx rate +15% over last hour. Prepare for admissions.',
        time: '10 min ago',
    },
    {
        icon: 'person_search', iconBg: 'bg-blue-50', iconColor: 'text-[#2b8cee]',
        title: 'Staff Shortage',
        desc: 'Night shift nursing staff for Wing A is below threshold.',
        time: '1 hour ago',
    },
];

// ── Bed Card ──────────────────────────────────────────────────────────────────

function BedCard({ bed }) {
    const { id, status, patient, meta, detail, timeLeft, tags, monitoring, cleaningNote } = bed;

    if (status === 'available') return (
        <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-green-500/50 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full">
            <div className="h-1 bg-green-500 w-full absolute top-0" />
            <div className="p-4 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900 text-lg">{id}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">Available</span>
                </div>
                <div className="flex-1 flex items-center justify-center my-4">
                    <div className="size-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-green-500 transition-colors">
                        <span className="material-symbols-outlined text-2xl">bed</span>
                    </div>
                </div>
                <div className="pt-3 border-t border-slate-100">
                    <button className="w-full py-1.5 rounded text-sm font-medium text-green-600 border border-green-200 hover:bg-green-500 hover:text-white transition-colors">Assign Patient</button>
                </div>
            </div>
        </div>
    );

    if (status === 'cleaning') return (
        <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-yellow-500/50 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full opacity-80">
            <div className="h-1 bg-yellow-500 w-full absolute top-0" />
            <div className="p-4 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-900 text-lg">{id}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">Cleaning</span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center my-4 text-center">
                    <span className="material-symbols-outlined text-3xl text-yellow-500/70 mb-2">cleaning_services</span>
                    <p className="text-xs text-slate-500 whitespace-pre-line">{cleaningNote}</p>
                </div>
                <div className="pt-3 border-t border-slate-100">
                    <button className="w-full py-1.5 rounded text-sm font-medium text-slate-600 border border-slate-200 hover:bg-green-500 hover:text-white hover:border-green-500 transition-colors">Mark as Ready</button>
                </div>
            </div>
        </div>
    );

    if (status === 'critical') return (
        <div className="group bg-white rounded-xl border border-red-200 shadow-sm hover:shadow-md hover:border-red-400 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full ring-2 ring-red-50">
            <div className="h-1 bg-red-500 w-full absolute top-0" />
            <div className="p-4 flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-slate-900 text-lg">{id}</span>
                    <div className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">priority_high</span> Critical
                    </div>
                </div>
                <h4 className="text-sm font-semibold text-slate-900">{patient}</h4>
                <p className="text-xs text-slate-500">{meta}</p>
                {tags?.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                        {tags.map((t) => (
                            <span key={t.label} className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${t.danger ? 'bg-red-500 text-white' : t.warning ? 'bg-yellow-300 text-slate-700' : 'bg-slate-100 text-slate-600'}`}>{t.label}</span>
                        ))}
                    </div>
                )}
                <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
                        <span className="material-symbols-outlined text-sm">monitor_heart</span><span>{monitoring}</span>
                    </div>
                    <button className="text-slate-400 hover:text-[#2b8cee] transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
                </div>
            </div>
        </div>
    );

    // occupied
    return (
        <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#2b8cee]/50 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full">
            <div className="h-1 bg-[#2b8cee] w-full absolute top-0" />
            <div className="p-4 flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-slate-900 text-lg">{id}</span>
                    <div className="px-2 py-0.5 rounded text-xs font-semibold bg-[#2b8cee]/10 text-[#2b8cee] flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-[#2b8cee] animate-pulse inline-block" /> Occupied
                    </div>
                </div>
                <h4 className="text-sm font-semibold text-slate-900">{patient}</h4>
                <p className="text-xs text-slate-500">{meta}</p>
                {detail && <p className="text-xs font-medium text-slate-700 mt-2 bg-slate-50 p-1.5 rounded inline-block">Diagnosis: {detail}</p>}
                <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                        <span className="material-symbols-outlined text-sm">schedule</span><span>{timeLeft}</span>
                    </div>
                    <button className="text-slate-400 hover:text-[#2b8cee] transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
                </div>
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function BedManagement() {
    const [activeWard, setActiveWard] = useState('All Wards');
    const [sortBy, setSortBy] = useState('Acuity Level');

    return (
        <div className="flex flex-1 flex-col overflow-hidden">

            {/* ── Top Header ── */}
            <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shrink-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-md text-sm text-slate-600 font-medium">
                        <span className="material-symbols-outlined text-lg">domain</span>
                        <span>City General Hospital</span>
                        <span className="material-symbols-outlined text-lg">chevron_right</span>
                        <span className="text-[#2b8cee] font-semibold">Bed Management</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center rounded-lg bg-slate-50 border border-slate-200 h-10 px-3 gap-2">
                        <span className="material-symbols-outlined text-slate-400">search</span>
                        <input className="bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none w-44" placeholder="Search bed or patient..." />
                    </div>
                    <button className="flex items-center gap-2 rounded-lg h-10 px-4 bg-[#2b8cee] hover:bg-blue-600 transition-colors text-white text-sm font-bold shadow-md shadow-[#2b8cee]/20">
                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                        Quick Allocation
                    </button>
                    <div className="relative size-9 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer">
                        <img alt="Doctor" className="w-full h-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBx8G8kkrgGIFdCJDvPqh8zspXwXNjw1JjTWsxfk4WtE3eBUI1A1B889FzK-h_Kj0mkrq8RQCsGlOQFz1Lgo7uYdhXqtsYFKK4o3UP1Lgqyzz3wCfGGqIp6CCaDBBVwsf7mR-Xw9RteR9jdVVnx0Lw9tmRHFHB4A-WP1-hlO61RjhaXsb3yNBJ7YkmoKDa-pccTuEYJ9JG8GsKAR7DMJp2KaIFb4nwDLUzTs9WVZLWQvWQtxQWEcO_JZh1lhGsEyS4xsLOktsNfsOA"
                        />
                        <div className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full border-2 border-white" />
                    </div>
                </div>
            </header>

            {/* ── Body ── */}
            <div className="flex flex-1 overflow-hidden bg-[#f6f7f8]">



                {/* ── Main Bed Grid ── */}
                <main className="flex-1 flex flex-col min-w-0">

                    {/* Filter Bar */}
                    <div className="bg-white px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 shadow-sm">
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                            {WARDS.map((w) => (
                                <button
                                    key={w}
                                    onClick={() => setActiveWard(w)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeWard === w
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >{w}</button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="material-symbols-outlined text-lg">sort</span>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent border-none text-slate-900 font-semibold focus:ring-0 focus:outline-none p-0 cursor-pointer text-sm">
                                <option>Acuity Level</option>
                                <option>Discharge Time</option>
                                <option>Bed Number</option>
                            </select>
                        </div>
                    </div>

                    {/* Bed Cards */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {beds.map((bed) => <BedCard key={bed.id} bed={bed} />)}
                        </div>
                    </div>
                </main>

                {/* ── Right AI Sidebar — Occupancy Chart moved here ── */}
                <aside className="w-64 bg-slate-50 border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto hidden xl:flex">
                    <div className="p-5">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-[#2b8cee] text-xl">auto_awesome</span>
                            <h3 className="font-bold text-slate-900">AI Insights</h3>
                        </div>

                        {/* Discharge Forecast */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Discharge Forecast</h4>
                                <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">Next 12h</span>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { bed: 'GEN-12', patient: 'Emma Wilson', prob: 92, barColor: 'bg-green-500', probColor: 'text-green-600', timeLeft: '~2 hours' },
                                    { bed: 'ICU-01', patient: 'Johnathan Doe', prob: 75, barColor: 'bg-yellow-400', probColor: 'text-yellow-600', timeLeft: '~4 hours' },
                                ].map((f) => (
                                    <div key={f.bed} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden">
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${f.barColor}`} />
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{f.bed}</p>
                                                <p className="text-xs text-slate-500">{f.patient}</p>
                                            </div>
                                            <span className={`text-xs font-bold ${f.probColor}`}>{f.prob}%</span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-1 text-xs text-slate-600">
                                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                                            <span>{f.timeLeft} remaining</span>
                                        </div>
                                        <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
                                            <div className={`${f.barColor} h-1.5 rounded-full`} style={{ width: `${f.prob}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-3 py-2 text-xs font-medium text-[#2b8cee] hover:bg-[#2b8cee]/5 rounded transition-colors text-center">
                                View All Predictions
                            </button>
                        </div>

                        {/* ── Occupancy Donut Chart — moved from left sidebar ── */}
                        <div>
                            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-4">Occupancy Rate</h4>

                            {/* Donut */}
                            <div className="relative size-36 mx-auto mb-4">
                                <div
                                    className="size-full rounded-full p-3.5 shadow-inner"
                                    style={{
                                        background: 'conic-gradient(#2b8cee 0deg 306deg, #10b981 306deg 392deg, #f59e0b 392deg 434deg, #ef4444 434deg 360deg)',
                                    }}
                                >
                                    <div className="size-full bg-slate-50 rounded-full flex items-center justify-center flex-col">
                                        <span className="text-2xl font-bold text-slate-900">85%</span>
                                        <span className="text-[11px] text-slate-500 font-medium">Full</span>
                                    </div>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="space-y-2 text-sm">
                                {occupancyStats.map((s) => (
                                    <div key={s.label} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`size-2.5 rounded-full ${s.color}`} />
                                            <span className="text-slate-600">{s.label}</span>
                                        </div>
                                        <span className="font-semibold text-slate-900">{s.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </aside>

            </div>
        </div>
    );
}
