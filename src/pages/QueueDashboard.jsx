import React, { useState } from 'react';

// ── Data ──────────────────────────────────────────────────────────────────────

const patients = [
    { id: '#E-099', name: 'Robert Fox', dept: 'Emergency', wait: 'IMMEDIATE', status: 'critical', isEmergency: true },
    { id: '#OPD-104', name: 'Esther Howard', dept: 'OPD', wait: '0 min', status: 'in-progress', isEmergency: false },
    { id: '#OPD-105', name: 'Jenny Wilson', dept: 'OPD', wait: '12 min', status: 'waiting', isEmergency: false },
    { id: '#LAB-042', name: 'Guy Hawkins', dept: 'Laboratory', wait: '15 min', status: 'waiting', isEmergency: false },
    { id: '#PH-008', name: 'Courtney Henry', dept: 'Pharmacy', wait: '22 min', status: 'waiting', isEmergency: false },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
    const map = { critical: 'bg-red-100 text-red-800', 'in-progress': 'bg-blue-100 text-blue-800', waiting: 'bg-slate-100 text-slate-800' };
    const label = { critical: 'Critical', 'in-progress': 'In Progress', waiting: 'Waiting' };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[status]}`}>
            {label[status]}
        </span>
    );
}

function DeptCard({ icon, iconColor, iconBg, name, sub, statusLabel, statusColor, count, avgWait, barColor, barPct }) {
    return (
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg} ${iconColor}`}>
                        <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">{name}</h3>
                        <p className="text-xs text-slate-500">{sub}</p>
                    </div>
                </div>
                <span className={`rounded px-2 py-1 text-xs font-medium ${statusColor}`}>{statusLabel}</span>
            </div>
            <div className="mb-4 flex items-end justify-between">
                <div>
                    <span className="text-3xl font-bold text-slate-900">{count}</span>
                    <span className="ml-1 text-sm font-medium text-slate-500">Waiting</span>
                </div>
                <div className="text-right">
                    <span className="block text-sm font-medium text-slate-900">{avgWait}</span>
                    <span className="text-xs text-slate-500">Avg Wait</span>
                </div>
            </div>
            <div className="w-full">
                <div className="mb-1 flex justify-between text-xs font-medium text-slate-500">
                    <span>Capacity</span><span>{barPct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${barPct}%` }} />
                </div>
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function QueueDashboard() {
    const [search, setSearch] = useState('');

    const filteredPatients = patients.filter(
        (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.id.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-1 flex-col overflow-hidden bg-[#f6f7f8]">

            {/* Header */}
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
                <h1 className="text-xl font-bold text-slate-900">Real-Time Overview</h1>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center rounded-lg bg-slate-100 px-3 py-2">
                        <span className="material-symbols-outlined text-slate-400">search</span>
                        <input
                            className="ml-2 w-52 bg-transparent text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none"
                            placeholder="Search patient ID..."
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-[#2b8cee] transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                    </button>
                    <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-[#2b8cee] transition-colors">
                        <span className="material-symbols-outlined">dark_mode</span>
                    </button>
                </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">

                {/* Department Stats */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <DeptCard icon="local_hospital" iconColor="text-blue-600" iconBg="bg-blue-100" name="OPD Queue" sub="General Medicine" statusLabel="Active" statusColor="bg-green-100 text-green-700" count={45} avgWait="~12 min" barColor="bg-[#2b8cee]" barPct={75} />
                    <DeptCard icon="biotech" iconColor="text-purple-600" iconBg="bg-purple-100" name="Laboratory" sub="Pathology & Blood" statusLabel="Active" statusColor="bg-green-100 text-green-700" count={12} avgWait="~5 min" barColor="bg-purple-500" barPct={40} />
                    <DeptCard icon="medication" iconColor="text-teal-600" iconBg="bg-teal-100" name="Pharmacy" sub="Dispensary A" statusLabel="Busy" statusColor="bg-yellow-100 text-yellow-700" count={8} avgWait="~3 min" barColor="bg-teal-500" barPct={85} />
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

                    {/* Live Patient Queue Table */}
                    <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Live Patient Queue</h2>
                                <p className="text-sm text-slate-500">Real-time AI estimations</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                                    <span className="material-symbols-outlined text-[18px]">filter_list</span>Filter
                                </button>
                                <button className="flex items-center gap-2 rounded-lg bg-[#2b8cee] px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600 shadow-sm">
                                    <span className="material-symbols-outlined text-[18px]">add</span>New Token
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold">Token ID</th>
                                        <th className="px-6 py-3 font-semibold">Patient Name</th>
                                        <th className="px-6 py-3 font-semibold">Department</th>
                                        <th className="px-6 py-3 font-semibold">
                                            <div className="flex items-center gap-1">AI Est. Wait <span className="material-symbols-outlined text-[14px] text-[#2b8cee]">auto_awesome</span></div>
                                        </th>
                                        <th className="px-6 py-3 font-semibold">Status</th>
                                        <th className="px-6 py-3 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredPatients.map((p) => (
                                        <tr
                                            key={p.id}
                                            className={
                                                p.isEmergency ? 'bg-red-50 animate-pulse'
                                                    : p.status === 'in-progress' ? 'bg-blue-50/50 hover:bg-blue-50 transition-colors'
                                                        : 'hover:bg-slate-50 transition-colors'
                                            }
                                        >
                                            <td className={`px-6 py-4 font-medium ${p.isEmergency ? 'text-red-700' : p.status === 'in-progress' ? 'text-[#2b8cee]' : 'text-slate-600'}`}>{p.id}</td>
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                <div className="flex items-center gap-2">
                                                    {p.name}
                                                    {p.isEmergency && <span className="material-symbols-outlined text-red-500 text-[18px]">warning</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{p.dept}</td>
                                            <td className={`px-6 py-4 font-medium text-slate-900 ${p.isEmergency ? 'font-bold' : ''}`}>{p.wait}</td>
                                            <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                                            <td className="px-6 py-4 text-right">
                                                {p.isEmergency ? (
                                                    <button className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">Attend Now</button>
                                                ) : (
                                                    <button className="text-slate-400 hover:text-[#2b8cee] transition-colors">
                                                        <span className="material-symbols-outlined">more_vert</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
                            <span className="text-sm text-slate-500">Showing {filteredPatients.length} of 65 patients</span>
                            <div className="flex gap-2">
                                <button className="rounded px-2 py-1 text-sm text-slate-500 hover:bg-slate-100">Prev</button>
                                <button className="rounded bg-[#2b8cee]/10 px-2 py-1 text-sm font-medium text-[#2b8cee]">1</button>
                                <button className="rounded px-2 py-1 text-sm text-slate-500 hover:bg-slate-100">2</button>
                                <button className="rounded px-2 py-1 text-sm text-slate-500 hover:bg-slate-100">3</button>
                                <button className="rounded px-2 py-1 text-sm text-slate-500 hover:bg-slate-100">Next</button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-6">

                        {/* Wait Time Trends */}
                        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900">Wait Time Trends</h3>
                                <select className="rounded border-none bg-slate-100 py-1 pl-2 pr-6 text-xs font-medium text-slate-600 focus:ring-0 focus:outline-none">
                                    <option>Today</option><option>Yesterday</option>
                                </select>
                            </div>
                            <div className="relative h-48 w-full">
                                <div className="absolute inset-0 flex flex-col justify-between text-xs text-slate-400 pointer-events-none">
                                    <span>30m</span><span>20m</span><span>10m</span><span>0m</span>
                                </div>
                                <div className="absolute bottom-0 left-8 right-0 top-0">
                                    <div className="flex h-full flex-col justify-between border-l border-slate-100">
                                        {[0, 1, 2].map((i) => <div key={i} className="w-full border-b border-dashed border-slate-100" />)}
                                        <div className="w-full border-b border-slate-200" />
                                    </div>
                                    <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="grad" x1="0%" x2="0%" y1="0%" y2="100%">
                                                <stop offset="0%" style={{ stopColor: '#2b8cee', stopOpacity: 0.2 }} />
                                                <stop offset="100%" style={{ stopColor: '#2b8cee', stopOpacity: 0 }} />
                                            </linearGradient>
                                        </defs>
                                        <path d="M0,80 Q40,90 80,60 T160,50 T240,20 T320,40" fill="url(#grad)" stroke="none" />
                                        <path d="M0,80 Q40,90 80,60 T160,50 T240,20 T320,40" fill="none" stroke="#2b8cee" strokeLinecap="round" strokeWidth="2" />
                                        <circle cx="80" cy="60" r="3" fill="white" stroke="#2b8cee" strokeWidth="2" />
                                        <circle cx="160" cy="50" r="3" fill="white" stroke="#2b8cee" strokeWidth="2" />
                                        <circle cx="240" cy="20" r="3" fill="white" stroke="#2b8cee" strokeWidth="2" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-8 mt-2 flex justify-between text-xs text-slate-400">
                                <span>9am</span><span>11am</span><span>1pm</span><span>3pm</span>
                            </div>
                        </div>

                        {/* Active Alerts */}
                        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="font-bold text-slate-900">Active Alerts</h3>
                            <div className="flex items-start gap-3 rounded-lg bg-orange-50 p-3">
                                <span className="material-symbols-outlined text-orange-500 shrink-0">warning</span>
                                <div>
                                    <p className="text-sm font-semibold text-orange-800">High Load: OPD</p>
                                    <p className="text-xs text-orange-600">Queue length exceeds optimal limit by 15%.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
                                <span className="material-symbols-outlined text-blue-500 shrink-0">info</span>
                                <div>
                                    <p className="text-sm font-semibold text-blue-800">New Staff Check-in</p>
                                    <p className="text-xs text-blue-600">Dr. Emily Stone active in Laboratory.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
