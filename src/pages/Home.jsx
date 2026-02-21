import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext_simple';

export default function Home() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { user, userRole } = useAuth();

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f7f8] font-sans text-slate-900 antialiased selection:bg-[#2b8cee] selection:text-white">
            {/* Navigation */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 sm:px-10 py-3">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-[#2b8cee]/10 text-[#2b8cee]">
                            <span className="material-symbols-outlined">local_hospital</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">MediFlow</h2>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex flex-1 items-center justify-end gap-8">
                        <nav className="flex items-center gap-6">
                            <a className="text-sm font-medium text-slate-600 hover:text-[#2b8cee] transition-colors" href="#">Check Availability</a>
                            <a className="text-sm font-medium text-slate-600 hover:text-[#2b8cee] transition-colors" href="#">Features</a>
                            <a className="text-sm font-medium text-slate-600 hover:text-[#2b8cee] transition-colors" href="#">About Us</a>
                        </nav>
                        <div className="h-6 w-px bg-slate-200"></div>
                        {user ? (
                            <button onClick={() => navigate(userRole === 'doctor' ? '/dashboard' : '/patient-dashboard')} className="inline-flex h-10 items-center justify-center rounded-lg bg-[#2b8cee] hover:bg-[#2b8cee]/90 px-6 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md">
                                Dashboard
                            </button>
                        ) : (
                            <>
                                <button onClick={() => navigate('/signin')} className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 px-6 text-sm font-bold text-slate-900 transition-colors">
                                    Sign In
                                </button>
                                <button onClick={() => navigate('/signup')} className="inline-flex h-10 items-center justify-center rounded-lg bg-[#2b8cee] hover:bg-[#2b8cee]/90 px-6 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md">
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden flex size-10 items-center justify-center rounded-lg text-slate-600"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-3 border-t border-slate-200 pt-4 pb-2 px-2 flex flex-col gap-3">
                        <a className="text-sm font-medium text-slate-700 hover:text-[#2b8cee] py-1" href="#">Check Availability</a>
                        <a className="text-sm font-medium text-slate-700 hover:text-[#2b8cee] py-1" href="#">Features</a>
                        <a className="text-sm font-medium text-slate-700 hover:text-[#2b8cee] py-1" href="#">About Us</a>
                        <div className="flex gap-3 pt-2">
                            {user ? (
                                <button onClick={() => navigate(userRole === 'doctor' ? '/dashboard' : '/patient-dashboard')} className="flex-1 h-10 rounded-lg bg-[#2b8cee] text-sm font-bold text-white">Dashboard</button>
                            ) : (
                                <>
                                    <button onClick={() => navigate('/signin')} className="flex-1 h-10 rounded-lg bg-slate-100 text-sm font-bold text-slate-900">Sign In</button>
                                    <button onClick={() => navigate('/signup')} className="flex-1 h-10 rounded-lg bg-[#2b8cee] text-sm font-bold text-white">Sign Up</button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative px-4 sm:px-10 pt-10 pb-16 lg:pt-20 lg:pb-32">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="flex flex-col gap-6 max-w-2xl">
                                {/* Live Badge */}
                                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#2b8cee]/20 bg-[#2b8cee]/5 px-3 py-1 text-xs font-semibold text-[#2b8cee]">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2b8cee] opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2b8cee]"></span>
                                    </span>
                                    Live System Status: Operational
                                </div>

                                <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                                    Real-time Hospital{' '}
                                    <br className="hidden lg:block" />
                                    <span className="text-[#2b8cee]">Resource Management</span>
                                </h1>

                                <p className="text-lg font-medium leading-relaxed text-slate-600 max-w-lg">
                                    Experience AI-powered healthcare coordination. Monitor bed availability, ICU capacity,
                                    and queue times instantly for better patient care outcomes.
                                </p>

                                <div className="flex flex-wrap gap-4 pt-2">
                                    <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#2b8cee] hover:bg-[#2b8cee]/90 px-8 text-base font-bold text-white shadow-lg shadow-[#2b8cee]/25 transition-all hover:-translate-y-0.5">
                                        <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                                        Check Availability Now
                                    </button>
                                    <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-8 text-base font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">play_circle</span>
                                        Watch Demo
                                    </button>
                                </div>
                            </div>

                            {/* Hero Visual */}
                            <div className="relative lg:h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl bg-slate-100">
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#2b8cee]/20 to-transparent mix-blend-overlay z-10 pointer-events-none"></div>
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{
                                        backgroundImage:
                                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD3HIgU8S-Om5spK1ttwfxWMywqkHlzgqcnCM7A2rj7eMMWLmbHELnPJTZglV3PpAmRz7N-q4fMcnUFKnJK6YydUXrABisU-H6jQEQeBltqArTr5_msVP4uWM6Acv07UYiNacxHuAeMPOSj5bC_mkEdKebxz9qLkQ_61QoKpeatQAEpsONnbXpvWtp-pFlesoeWreeS02wb3h9mkiggE8Iw5yKpEBGHtlA7QEcVAk47QIw3LUf_C3HAF6fC3ikufmPTmZzVDuQgM4g')",
                                    }}
                                ></div>
                                {/* Floating UI Mockup */}
                                <div className="absolute bottom-6 left-6 right-6 z-20 bg-white/95 backdrop-blur rounded-xl p-4 shadow-xl border border-white/20">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="size-2 rounded-full bg-green-500"></div>
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">System Activity</span>
                                        </div>
                                        <span className="text-xs font-mono text-[#2b8cee]">Updating...</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-2 w-3/4 rounded-full bg-slate-200">
                                            <div className="h-full w-2/3 rounded-full bg-[#2b8cee] animate-pulse"></div>
                                        </div>
                                        <div className="h-2 w-1/2 rounded-full bg-slate-200"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="relative z-10 -mt-12 lg:-mt-24 px-4 sm:px-10 pb-16">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Stat Card 1 - Beds */}
                            <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl hover:border-[#2b8cee]/50">
                                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-[#2b8cee]/5 group-hover:bg-[#2b8cee]/10 transition-colors"></div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="rounded-lg bg-blue-50 p-2 text-[#2b8cee]">
                                        <span className="material-symbols-outlined">bed</span>
                                    </div>
                                    <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        Live Update
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-slate-500">Total Beds Available</p>
                                <div className="mt-1 flex items-baseline gap-2">
                                    <h3 className="text-4xl font-bold text-slate-900">142</h3>
                                    <span className="text-sm font-medium text-slate-400">/ 500</span>
                                </div>
                                <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100">
                                    <div className="h-full w-[28%] rounded-full bg-[#2b8cee]"></div>
                                </div>
                            </div>

                            {/* Stat Card 2 - ICU */}
                            <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl hover:border-orange-500/50">
                                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-orange-500/5 group-hover:bg-orange-500/10 transition-colors"></div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
                                        <span className="material-symbols-outlined">ecg_heart</span>
                                    </div>
                                    <span className="flex items-center gap-1.5 rounded-full bg-orange-100 px-2 py-1 text-xs font-bold text-orange-700">
                                        Critical
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-slate-500">ICU Availability</p>
                                <div className="mt-1 flex items-baseline gap-2">
                                    <h3 className="text-4xl font-bold text-slate-900">12</h3>
                                    <span className="text-sm font-medium text-slate-400">/ 40</span>
                                </div>
                                <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100">
                                    <div className="h-full w-[30%] rounded-full bg-orange-500"></div>
                                </div>
                            </div>

                            {/* Stat Card 3 - Wait Time */}
                            <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl hover:border-teal-500/50">
                                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-teal-500/5 group-hover:bg-teal-500/10 transition-colors"></div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="rounded-lg bg-teal-50 p-2 text-teal-600">
                                        <span className="material-symbols-outlined">timer</span>
                                    </div>
                                    <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                                        Average
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-slate-500">Current OPD Wait Time</p>
                                <div className="mt-1 flex items-baseline gap-2">
                                    <h3 className="text-4xl font-bold text-slate-900">45</h3>
                                    <span className="text-sm font-medium text-slate-400">mins</span>
                                </div>
                                <div className="mt-4 flex items-center justify-between text-xs font-medium text-slate-500">
                                    <span>Fastest: 15m</span>
                                    <span>Peak: 90m</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-20 px-4 sm:px-10 bg-white">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-12 md:mb-20 flex flex-col items-center text-center">
                            <span className="mb-3 font-bold uppercase tracking-wider text-[#2b8cee] text-sm">Patient Journey</span>
                            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl max-w-2xl">
                                How MediFlow Works
                            </h2>
                            <p className="mt-4 text-lg text-slate-600 max-w-2xl">
                                Navigate the hospital experience seamlessly with our intelligent digital token flow.
                                Save time and reduce anxiety.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                            {/* Connector Line */}
                            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

                            {/* Step 1 */}
                            <div className="relative flex flex-col items-center text-center group">
                                <div className="mb-6 flex size-24 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-xl z-10 transition-transform group-hover:scale-110 duration-300">
                                    <span className="material-symbols-outlined text-[#2b8cee] text-[40px]">confirmation_number</span>
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-slate-900">Digital Token</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Secure your spot online or at our self-service kiosk upon arrival. Receive a unique digital ID.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="relative flex flex-col items-center text-center group">
                                <div className="mb-6 flex size-24 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-xl z-10 transition-transform group-hover:scale-110 duration-300">
                                    <span className="material-symbols-outlined text-[#2b8cee] text-[40px]">sync</span>
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-slate-900">Track Live Status</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Monitor your position in the queue in real-time from your phone or hospital displays.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="relative flex flex-col items-center text-center group">
                                <div className="mb-6 flex size-24 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-xl z-10 transition-transform group-hover:scale-110 duration-300">
                                    <span className="material-symbols-outlined text-[#2b8cee] text-[40px]">medical_services</span>
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-slate-900">Consultation</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Proceed directly to your doctor when your token is called. Minimal waiting, maximum care.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-4 sm:px-10">
                    <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#2b8cee] relative">
                        <div
                            className="absolute inset-0 opacity-10"
                            style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                        ></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-10 md:p-16 gap-10">
                            <div className="flex flex-col gap-4 max-w-xl text-center md:text-left">
                                <h2 className="text-3xl font-black text-white sm:text-4xl">Ready to visit?</h2>
                                <p className="text-lg text-white/90 font-medium">
                                    Book your appointment in advance to reduce waiting time. Our AI system will optimize your schedule.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
                                    <button className="flex items-center justify-center gap-2 rounded-xl bg-white text-[#2b8cee] px-8 py-4 font-bold text-lg hover:bg-slate-50 transition-colors shadow-lg">
                                        Book Appointment
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </button>
                                    <button className="flex items-center justify-center gap-2 rounded-xl border border-white/20 text-white px-8 py-4 font-bold text-lg hover:bg-white/10 transition-colors">
                                        Emergency Contact
                                    </button>
                                </div>
                            </div>

                            {/* Icon Illustration */}
                            <div className="hidden md:block w-64 h-64 relative">
                                <div className="absolute inset-0 bg-white/10 rounded-full backdrop-blur-sm animate-pulse"></div>
                                <div className="absolute inset-4 bg-white/20 rounded-full backdrop-blur-md flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-[80px]">calendar_clock</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 pt-16 pb-8 px-4 sm:px-10">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        {/* Brand */}
                        <div className="col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex size-6 items-center justify-center rounded bg-[#2b8cee] text-white">
                                    <span className="material-symbols-outlined text-sm">local_hospital</span>
                                </div>
                                <span className="text-lg font-bold text-slate-900">MediFlow</span>
                            </div>
                            <p className="text-sm text-slate-500 mb-4">
                                Leading the way in digital healthcare management. Efficient, transparent, and patient-centric.
                            </p>
                        </div>

                        {/* Services */}
                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">Services</h4>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li><a className="hover:text-[#2b8cee] transition-colors" href="#">OPD Consultation</a></li>
                                <li><a className="hover:text-[#2b8cee] transition-colors" href="#">Emergency Care</a></li>
                                <li><a className="hover:text-[#2b8cee] transition-colors" href="#">Laboratory</a></li>
                                <li><a className="hover:text-[#2b8cee] transition-colors" href="#">Telemedicine</a></li>
                            </ul>
                        </div>

                        {/* Patient Support */}
                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">Patient Support</h4>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li><a className="hover:text-[#2b8cee] transition-colors" href="#">Book Appointment</a></li>
                                <li><a className="hover:text-[#2b8cee] transition-colors" href="#">Track Token</a></li>
                                <li><a className="hover:text-[#2b8cee] transition-colors" href="#">Doctor Schedule</a></li>
                                <li><a className="hover:text-[#2b8cee] transition-colors" href="#">Insurance Partners</a></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">Contact</h4>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-[#2b8cee] text-lg">location_on</span>
                                    123 Healthcare Ave,<br />Medical District, NY 10001
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#2b8cee] text-lg">call</span>
                                    +1 (555) 123-4567
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#2b8cee] text-lg">mail</span>
                                    support@mediflow.com
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-slate-500">© 2024 MediFlow Systems. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a className="text-sm text-slate-500 hover:text-[#2b8cee] transition-colors" href="#">Privacy Policy</a>
                            <a className="text-sm text-slate-500 hover:text-[#2b8cee] transition-colors" href="#">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
