import React from 'react';

// ── Data ──────────────────────────────────────────────────────────────────────

const journeySteps = [
    { icon: 'check', label: 'Entry', time: '08:00 AM', done: true, active: false },
    { icon: 'stethoscope', label: 'OPD', time: '09:30 AM', done: true, active: false },
    { icon: 'biotech', label: 'Diagnosis', time: '11:00 AM', done: true, active: false },
    { icon: 'assignment_ind', label: 'Admission', time: '12:15 PM', done: true, active: false },
    { icon: 'autorenew', label: 'Bed Alloc.', time: 'Processing...', done: false, active: true },
    { icon: 'monitor_heart', label: 'ICU', time: 'If required', done: false, active: false },
    { icon: 'door_front', label: 'Discharge', time: 'Pending', done: false, active: false },
];

const nextSteps = [
    {
        icon: 'description', iconBg: 'bg-orange-50', iconColor: 'text-orange-600',
        title: 'Prepare Insurance Documents',
        desc: 'Keep ID #89201 handy for verification at the nurse station.',
    },
    {
        icon: 'medication', iconBg: 'bg-blue-50', iconColor: 'text-[#2b8cee]',
        title: 'Medication Review',
        desc: 'Doctor has prescribed new antibiotics. Pharmacy is preparing order #992.',
    },
];

// ── Keyframe style injected once ──────────────────────────────────────────────
const pulseStyle = `
@keyframes pulse-ring {
  0%   { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(43,140,238,0.6); }
  70%  { transform: scale(1);   box-shadow: 0 0 0 10px rgba(43,140,238,0); }
  100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(43,140,238,0); }
}
.pulse-active { animation: pulse-ring 2s infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 1.5s linear infinite; }
`;

// ── Main Component ────────────────────────────────────────────────────────────

export default function Patients() {
    return (
        <>
            <style>{pulseStyle}</style>

            <div className="flex flex-1 flex-col overflow-hidden bg-[#f6f7f8]">

                {/* ── Page Header ── */}
                <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
                    <h1 className="text-xl font-bold text-slate-900">Patients</h1>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center rounded-lg bg-slate-100 px-3 py-2 gap-2">
                            <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                            <input
                                className="bg-transparent text-sm placeholder-slate-400 focus:outline-none w-48"
                                placeholder="Search patient ID..."
                            />
                        </div>
                        <button className="relative p-2 text-slate-500 hover:text-[#2b8cee] transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <div
                            className="size-9 rounded-full ring-2 ring-slate-100"
                            style={{
                                backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDjerwnlgczO0VbWROxaYin8JvPgUoDIxB4urA7E6z5u8is4b14ts6OUu68OZ4j0hxXqtOmhnAE1G8H95ZcEaaqllouRcCYE1agGEJXT3matTKhWAYF2wsr7_4YKI0a12cWuGbVcbAxxX-NdCy58bijBrZlrfVcnupy0aET6q3uM121sOCCeupRC7gVg5Z21yRCzIflAkamW9RVo1QOlVKg0sV2MdMgt_08YNoB2Dsq5oy12mWIDPRLGEEhzptcRTH-IjZnqu43heE')",
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        />
                    </div>
                </header>

                {/* ── Scrollable Content ── */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-[1400px] mx-auto flex flex-col gap-6">

                        {/* ── Patient Header Card ── */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                            <div className="flex gap-5 items-center">
                                <div
                                    className="rounded-xl h-20 w-20 shadow-inner shrink-0"
                                    style={{
                                        backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC1RcGkouZK7z3viQUCKrNLzw995hSy8ukW06dwsGSWDdssyMxVPFNRNafWQo04JcDXcvbqEU4V11MSCsyBmwY1GgmVwZyd5t2usvodjRlgx17VHh4fz4DWwmnza252SQ9SgLOmsJvjHESGU6KfzjyocPxjqCeYsSZK-4TRC39kooo2v0vMAGB-96L0rd3zL2RXPD2b5hAlxDhaS3vB5EKInWuy429Y4qnXvTHcgqlho-RCgYPJWRyGgg_pdO09WyeDbbn8P33Ga2M')",
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                />
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">John Doe</h2>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-slate-500 text-sm">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]">badge</span> ID: #89201
                                        </span>
                                        <span className="size-1 bg-slate-300 rounded-full" />
                                        <span>Male, 45 Yrs</span>
                                        <span className="size-1 bg-slate-300 rounded-full" />
                                        <span className="text-[#2b8cee] font-medium">Ward: General</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 w-full md:w-auto">
                                {[
                                    { icon: 'edit', label: 'Edit Details' },
                                    { icon: 'history', label: 'History' },
                                ].map((btn) => (
                                    <button key={btn.label} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">{btn.icon}</span>
                                        {btn.label}
                                    </button>
                                ))}
                                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2b8cee] text-white hover:bg-blue-600 font-medium text-sm shadow-sm shadow-blue-200 transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">call</span>
                                    Contact Family
                                </button>
                            </div>
                        </div>

                        {/* ── Main Grid ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Left: Journey + Details */}
                            <div className="lg:col-span-2 flex flex-col gap-6">

                                {/* Journey Timeline */}
                                <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-slate-200 relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#2b8cee]">timeline</span>
                                            Current Journey Status
                                        </h3>
                                        <span className="px-3 py-1 rounded-full bg-blue-50 text-[#2b8cee] text-xs font-bold uppercase tracking-wider">
                                            Active Stage: Bed Allocation
                                        </span>
                                    </div>

                                    {/* Scrollable timeline */}
                                    <div className="overflow-x-auto pb-4 -mx-2 px-2">
                                        <div className="min-w-[700px] relative">

                                            {/* Track */}
                                            <div className="absolute top-[28px] left-0 w-full h-1 bg-slate-100 rounded-full" />
                                            {/* Progress (4 of 7 completed ≈ 55%) */}
                                            <div className="absolute top-[28px] left-0 w-[60%] h-1 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-blue-300 to-[#2b8cee] w-full rounded-full" />
                                            </div>

                                            <div className="grid grid-cols-7 relative z-10">
                                                {journeySteps.map((step) => {
                                                    if (step.done) return (
                                                        <div key={step.label} className="flex flex-col items-center gap-3 group">
                                                            <div className="size-14 rounded-full bg-[#2b8cee] text-white flex items-center justify-center shadow-md shadow-blue-200 border-4 border-white transition-transform group-hover:scale-110">
                                                                <span className="material-symbols-outlined">{step.icon}</span>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="font-bold text-slate-900 text-sm">{step.label}</p>
                                                                <p className="text-xs text-slate-500">{step.time}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                    if (step.active) return (
                                                        <div key={step.label} className="flex flex-col items-center gap-3">
                                                            <div className="size-14 rounded-full bg-white text-[#2b8cee] border-[3px] border-[#2b8cee] flex items-center justify-center relative z-20 pulse-active shadow-lg">
                                                                <span className="material-symbols-outlined spin">{step.icon}</span>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="font-bold text-[#2b8cee] text-sm">{step.label}</p>
                                                                <p className="text-xs text-[#2b8cee] font-medium">{step.time}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                    return (
                                                        <div key={step.label} className="flex flex-col items-center gap-3 opacity-40">
                                                            <div className="size-14 rounded-full bg-slate-100 text-slate-400 border-4 border-white flex items-center justify-center">
                                                                <span className="material-symbols-outlined">{step.icon}</span>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="font-medium text-slate-500 text-sm">{step.label}</p>
                                                                <p className="text-xs text-slate-400">{step.time}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Status */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                                    <h3 className="text-base font-bold text-slate-900 mb-5">Detailed Status: Bed Allocation</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                <span className="material-symbols-outlined text-[#2b8cee] mt-0.5">info</span>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">Action Required</p>
                                                    <p className="text-sm text-slate-600">Waiting for housekeeping to sanitize Bed #402 in Ward A.</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                {[
                                                    { label: 'Allocated Ward', value: 'General Ward A' },
                                                    { label: 'Assigned Nurse', value: 'Sarah Jenkins' },
                                                ].map((item) => (
                                                    <div key={item.label} className="flex-1 p-3 bg-slate-50 rounded-lg">
                                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{item.label}</p>
                                                        <p className="text-base font-bold text-slate-900 mt-1">{item.value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border-t md:border-t-0 md:border-l border-slate-200 md:pl-6 pt-4 md:pt-0">
                                            <p className="text-sm text-slate-500 mb-3">Timeline of recent updates:</p>
                                            <ul className="space-y-4">
                                                {[
                                                    { dot: 'bg-[#2b8cee]', label: 'Request Sent to Housekeeping', time: 'Today, 12:45 PM', line: true },
                                                    { dot: 'bg-slate-300', label: 'Bed Availability Confirmed', time: 'Today, 12:30 PM', line: false },
                                                ].map((item) => (
                                                    <li key={item.label} className="flex gap-3 text-sm">
                                                        <div className="flex flex-col items-center">
                                                            <div className={`size-2 rounded-full ${item.dot} mt-1.5`} />
                                                            {item.line && <div className="w-px flex-1 bg-slate-200 my-1" />}
                                                        </div>
                                                        <div className="pb-1">
                                                            <p className="text-slate-900 font-medium">{item.label}</p>
                                                            <p className="text-slate-500 text-xs">{item.time}</p>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* Right: AI Insights + Next Steps + Stats */}
                            <div className="flex flex-col gap-5">

                                {/* AI Insights */}
                                <div
                                    className="rounded-xl p-6 shadow-sm border border-[#2b8cee]/20 relative overflow-hidden"
                                    style={{ background: 'linear-gradient(135deg, rgba(43,140,238,0.05) 0%, #fff 100%)' }}
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                        <span className="material-symbols-outlined text-[120px] text-[#2b8cee]">psychology</span>
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-5">
                                            <span className="material-symbols-outlined text-[#2b8cee]">auto_awesome</span>
                                            <h3 className="font-bold text-slate-900">AI Insights</h3>
                                        </div>

                                        {/* Wait time */}
                                        <div className="mb-5">
                                            <p className="text-sm text-slate-500 mb-1">Estimated Wait Time</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-bold text-slate-900">~15</span>
                                                <span className="text-lg font-medium text-slate-500">mins</span>
                                            </div>
                                            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                                                <div className="bg-[#2b8cee] h-full rounded-full w-3/4" />
                                            </div>
                                            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                92% Confidence Score
                                            </p>
                                        </div>

                                        {/* Token status */}
                                        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-slate-100">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-sm text-slate-500 font-medium">Token Status</span>
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-bold">Live</span>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-xs text-slate-400 uppercase mb-0.5">Your Token</p>
                                                    <p className="text-2xl font-bold text-[#2b8cee]">A-45</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-400 uppercase mb-0.5">Serving Now</p>
                                                    <p className="text-xl font-bold text-slate-700">A-42</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Next Steps */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">Next Steps</h3>
                                    <ul className="space-y-4">
                                        {nextSteps.map((step) => (
                                            <li key={step.title} className="flex gap-3 items-start">
                                                <div className={`size-8 rounded-full ${step.iconBg} ${step.iconColor} flex shrink-0 items-center justify-center`}>
                                                    <span className="material-symbols-outlined text-[18px]">{step.icon}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{step.title}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    <button className="w-full mt-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#2b8cee] hover:border-[#2b8cee] text-sm font-medium transition-colors">
                                        View Full Care Plan
                                    </button>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { icon: 'timer', value: '4h 20m', label: 'Total Time' },
                                        { icon: 'attach_money', value: '$450', label: 'Est. Bill' },
                                    ].map((stat) => (
                                        <div key={stat.label} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center gap-1">
                                            <span className="material-symbols-outlined text-slate-400">{stat.icon}</span>
                                            <span className="text-lg font-bold text-slate-900">{stat.value}</span>
                                            <span className="text-xs text-slate-500">{stat.label}</span>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
