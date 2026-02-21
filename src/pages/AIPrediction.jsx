import React, { useState } from 'react';

// ── Data ──────────────────────────────────────────────────────────────────────

const queueItems = [
    {
        id: '#8821', name: 'Martha Stewart', tag: 'Stroke Risk', tagColor: 'bg-red-100 text-red-700',
        wait: '14m', waitColor: 'text-red-600', bar: 'bg-red-500',
        complaint: 'Slurred speech, numbness', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALuE7-yav0fCy3QZFZ4R6CIglGrzpD_OqOH6Aw_d5q5g83-7AeqTyZWGVw2IFVIRc1LCfU-kO_InDy1cSVCUGJh0HJ5_WOCYXIcInwZbbSx5Z6V_MZq_U0q9aoAyBTXMFfXbQo1oyqAqXgitDdVqxQfzK4UpszLbvjzM8ROel0heoj4vmpbSNpMX7TS2TY0A75JcC7kNV5Cf0M4lyZQOqIaCQMccmiU6xKvuuqM03XdKGkpLuHER6IKlqSJPAT58_bMe4uqsOb9jc',
        category: 'immediate', action: 'Assign Bed',
    },
    {
        id: '#9910', name: 'John Doe', tag: 'Chest Pain', tagColor: 'bg-orange-100 text-orange-700',
        wait: '8m', waitColor: 'text-orange-600', bar: 'bg-orange-500',
        complaint: 'Pressure, shortness of breath', initials: 'JD',
        category: 'immediate', action: 'Assign Bed',
    },
    {
        id: '#7732', name: 'Michael Chen', tag: 'Fracture', tagColor: 'bg-yellow-100 text-yellow-800',
        wait: '22m', waitColor: 'text-slate-900', bar: 'bg-yellow-400',
        complaint: 'Right arm trauma', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPxPPdI4nLO5GBZaelZgOcOQutSoPTuIE27_JkVgOF0gqYcFSfgBJ5oix8w8j98Y7eMmnMWNO8_C-iAVlhrgCQsBY1EfSxN1kOdm4t0UDxO3chwCTBHPBBle6ehEFTgzAKiwKuZ5cAgev_xBNI50mA-KnYC5jDICjze2Z9i5WEUtGTXN_UsaGRKdWW2OiM4TgenC1CkzXvc7_znAOU2Bkw3I-rNT5r_kS2ELqjqqul7Pi0tRDGX8XknpQnapKEDP9KZkXAL2Tv86Y',
        category: 'urgent', action: 'Details',
    },
    {
        id: '#5512', name: 'Alice Little', tag: 'Stable', tagColor: 'bg-green-100 text-green-800',
        wait: '45m', waitColor: 'text-slate-900', bar: 'bg-green-500',
        complaint: 'Minor laceration', initials: 'AL',
        category: 'urgent', action: 'Details',
    },
];

const staffMembers = [
    { initials: 'Dr', bg: 'bg-indigo-100', color: 'text-indigo-600', name: 'Dr. Sarah L.', role: 'Pediatrics', on: false },
    { initials: 'RN', bg: 'bg-purple-100', color: 'text-purple-600', name: 'Nurse Mike', role: 'Triage Desk', on: true },
];

// ── Toggle Switch ─────────────────────────────────────────────────────────────

function Toggle({ on, onChange }) {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={on} onChange={onChange} readOnly />
            <div className={`w-9 h-5 rounded-full transition-colors ${on ? 'bg-[#2b8cee]' : 'bg-slate-200'} relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all ${on ? 'after:translate-x-4' : ''}`} />
        </label>
    );
}

// ── Queue Item ────────────────────────────────────────────────────────────────

function QueueItem({ item }) {
    const isPrimary = item.action === 'Assign Bed';
    return (
        <div className="group flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-[#2b8cee]/50 cursor-grab transition-all hover:shadow-md relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.bar}`} />
            <span className="material-symbols-outlined text-slate-300 select-none">drag_indicator</span>
            <div className="w-11 h-11 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm">
                {item.avatar
                    ? <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                    : item.initials}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h3 className="font-bold text-slate-900 truncate">
                        {item.name} <span className="text-slate-400 font-normal text-sm ml-1">{item.id}</span>
                    </h3>
                    <span className={`px-2 py-0.5 ${item.tagColor} text-[10px] font-bold rounded uppercase`}>{item.tag}</span>
                </div>
                <p className="text-sm text-slate-500 truncate">
                    Wait time: <span className={`${item.waitColor} font-bold`}>{item.wait}</span> • {item.complaint}
                </p>
            </div>
            <div className="shrink-0">
                <button
                    className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${isPrimary
                            ? 'bg-[#2b8cee]/10 hover:bg-[#2b8cee]/20 text-[#2b8cee]'
                            : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    {item.action}
                </button>
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AIPrediction() {
    const [staff, setStaff] = useState(staffMembers);
    const [search, setSearch] = useState('');

    const toggleStaff = (i) =>
        setStaff((prev) => prev.map((s, idx) => (idx === i ? { ...s, on: !s.on } : s)));

    const filtered = queueItems.filter(
        (q) =>
            q.name.toLowerCase().includes(search.toLowerCase()) ||
            q.id.toLowerCase().includes(search.toLowerCase())
    );
    const immediate = filtered.filter((q) => q.category === 'immediate');
    const urgent = filtered.filter((q) => q.category === 'urgent');

    return (
        <div className="flex flex-1 overflow-hidden bg-[#f6f7f8]">

            {/* ── LEFT: Critical Alerts ── */}
            <aside className="w-[300px] xl:w-[340px] shrink-0 flex flex-col bg-white border-r border-slate-200 overflow-y-auto hidden lg:flex">

                {/* Header */}
                <div className="p-5 border-b border-slate-100 bg-red-50/60">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="text-red-700 text-base font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">warning</span>
                            Critical Patient Alerts
                        </h2>
                        <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">3 Active</span>
                    </div>
                    <p className="text-xs text-red-600/80">Immediate attention required for incoming severe trauma.</p>
                </div>

                <div className="flex-1 p-4 space-y-4">
                    {/* Alert 1 — Pulsing */}
                    <div className="relative bg-white rounded-xl p-4 border-2 border-red-500 shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)] animate-pulse">
                        <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-lg">ETA: 2m</div>
                        <div className="flex gap-3 mb-3">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-red-500 shrink-0">
                                <span className="material-symbols-outlined text-3xl">ecg_heart</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Patient #1024</h3>
                                <div className="text-red-600 text-sm font-bold uppercase tracking-tight">Cardiac Arrest</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                            <div className="bg-red-50 p-2 rounded text-center">
                                <span className="block text-slate-500 uppercase text-[10px]">HR</span>
                                <span className="font-mono font-bold text-red-600">0 bpm</span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded text-center">
                                <span className="block text-slate-500 uppercase text-[10px]">Team</span>
                                <span className="font-bold text-slate-700">Alpha</span>
                            </div>
                        </div>
                        <button className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                            <span className="material-symbols-outlined text-lg">visibility</span> View Vitals &amp; Prep
                        </button>
                    </div>

                    {/* Alert 2 */}
                    <div className="relative bg-white rounded-xl p-4 border border-red-200 shadow-sm hover:border-red-400 transition-colors">
                        <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-lg">ARRIVED</div>
                        <div className="flex gap-3 mb-3">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-orange-500 shrink-0">
                                <span className="material-symbols-outlined text-3xl">coronavirus</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Patient #998</h3>
                                <div className="text-orange-600 text-sm font-bold uppercase tracking-tight">Sepsis Alert</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-3 px-1">
                            <span>BP: <strong className="text-slate-900">80/50</strong></span>
                            <span>Temp: <strong className="text-red-600">40.1°C</strong></span>
                        </div>
                        <button className="w-full py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                            <span className="material-symbols-outlined text-lg">check_circle</span> Acknowledge
                        </button>
                    </div>

                    {/* Emergency Protocols */}
                    <div className="pt-5 border-t border-slate-200">
                        <h3 className="text-slate-900 text-xs font-bold uppercase tracking-wider mb-4">Emergency Protocols</h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-slate-900 text-sm">Trauma Team 1</div>
                                    <div className="text-xs text-green-600 font-medium">Available</div>
                                </div>
                                <button className="text-xs font-bold text-[#2b8cee] hover:underline">Reassign</button>
                            </div>
                            <button className="w-full p-4 bg-slate-900 text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg mt-4">
                                <span className="material-symbols-outlined">campaign</span> Activate Mass Casualty
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── MIDDLE: Triage Queue ── */}
            <section className="flex-1 flex flex-col overflow-hidden bg-[#f6f7f8]">
                {/* Toolbar */}
                <div className="px-6 py-5 flex items-center justify-between shrink-0 flex-wrap gap-3 bg-white border-b border-slate-200 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Triage Queue</h1>
                        <p className="text-slate-500 text-sm">AI-Optimized • Drag to re-prioritize</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex w-56 items-center bg-slate-50 rounded-lg border border-slate-200 px-3 h-10">
                            <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                            <input
                                className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-900 placeholder:text-slate-400 ml-2 focus:outline-none"
                                placeholder="Search patient ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button className="h-10 px-4 bg-[#2b8cee] text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-600 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">add</span> New
                        </button>
                    </div>
                </div>

                {/* Queue list */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">

                    {/* Immediate */}
                    {immediate.length > 0 && (
                        <>
                            <div className="flex items-center gap-4 py-1">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Immediate (ESI 1)</span>
                                <div className="h-px bg-slate-200 flex-1" />
                            </div>
                            {immediate.map((item) => <QueueItem key={item.id} item={item} />)}
                        </>
                    )}

                    {/* Urgent */}
                    {urgent.length > 0 && (
                        <>
                            <div className="flex items-center gap-4 py-1 mt-4">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Urgent (ESI 2-3)</span>
                                <div className="h-px bg-slate-200 flex-1" />
                            </div>
                            {urgent.map((item) => <QueueItem key={item.id} item={item} />)}
                        </>
                    )}

                    {filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
                            <p className="text-sm">No patients match your search</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ── RIGHT: Bed Management ── */}
            <aside className="w-[300px] xl:w-[340px] shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-y-auto hidden lg:flex">

                {/* Header */}
                <div className="p-5 border-b border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-slate-900">Bed Management</h2>
                        <button className="text-[#2b8cee] text-xs font-bold uppercase hover:underline">View Map</button>
                    </div>
                    <div className="flex gap-3">
                        {[{ label: 'Available', value: 4, color: 'text-slate-900' }, { label: 'Occupied', value: 28, color: 'text-red-500' }].map((s) => (
                            <div key={s.label} className="flex-1 bg-white p-3 rounded-lg border border-slate-200 text-center shadow-sm">
                                <span className={`block text-2xl font-black ${s.color}`}>{s.value}</span>
                                <span className="text-xs text-slate-500 font-bold uppercase">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 p-5 space-y-6">

                    {/* Zone A */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            Zone A (Trauma)
                            <span className="h-px bg-slate-200 flex-1" />
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[{ id: 'A1', name: 'J. Smith' }, { id: 'A2', name: 'M. Brown' }].map((bed) => (
                                <div key={bed.id} className="bg-red-50 border border-red-100 p-3 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-black text-slate-900 text-lg">{bed.id}</span>
                                        <span className="material-symbols-outlined text-red-500 text-lg">bed</span>
                                    </div>
                                    <div className="text-xs text-slate-600 mb-2 truncate">Occupied: {bed.name}</div>
                                    <button className="w-full py-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">Force Vacate</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Zone B */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            Zone B (General)
                            <span className="h-px bg-slate-200 flex-1" />
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-green-50 border border-green-100 p-3 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-black text-slate-900 text-lg">B4</span>
                                    <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                                </div>
                                <div className="text-xs text-green-700 mb-2 font-medium">Ready for cleanup</div>
                                <button className="w-full py-1 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 transition-colors">Assign</button>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg opacity-70">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-black text-slate-900 text-lg">B5</span>
                                    <span className="material-symbols-outlined text-slate-400 text-lg">bed</span>
                                </div>
                                <div className="text-xs text-slate-500 mb-2">Discharging...</div>
                                <button className="w-full py-1 bg-white border border-slate-200 text-slate-400 text-xs font-bold rounded cursor-not-allowed">Wait</button>
                            </div>
                        </div>
                    </div>

                    {/* Staff Override */}
                    <div className="pt-5 border-t border-slate-200">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Staff Override</h3>
                        <div className="space-y-3">
                            {staff.map((s, i) => (
                                <div key={s.name} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full ${s.bg} flex items-center justify-center ${s.color} font-bold text-xs`}>{s.initials}</div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900">{s.name}</div>
                                            <div className="text-[10px] text-slate-500 uppercase font-medium">{s.role}</div>
                                        </div>
                                    </div>
                                    <Toggle on={s.on} onChange={() => toggleStaff(i)} />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </aside>
        </div>
    );
}
