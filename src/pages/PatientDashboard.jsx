import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext_simple';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f8] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 sm:px-10 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#2b8cee]/10 text-[#2b8cee]">
              <span className="material-symbols-outlined">local_hospital</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">MediFlow</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">Welcome, {user?.email?.split('@')[0]}</span>
            <button 
              onClick={handleSignOut}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 px-4 text-sm font-bold text-slate-900 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-10 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <div className="flex justify-center mb-4">
              <span className="material-symbols-outlined text-6xl text-[#2b8cee]">person</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Patient Portal</h1>
            <p className="text-slate-600 mb-6">
              Welcome to your patient dashboard. This area is under development.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[#2b8cee]">schedule</span>
                  <h3 className="font-semibold text-slate-900">My Appointments</h3>
                </div>
                <p className="text-sm text-slate-600">View and manage your upcoming appointments</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[#2b8cee]">medical_information</span>
                  <h3 className="font-semibold text-slate-900">Medical Records</h3>
                </div>
                <p className="text-sm text-slate-600">Access your medical history and records</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[#2b8cee]">medication</span>
                  <h3 className="font-semibold text-slate-900">Prescriptions</h3>
                </div>
                <p className="text-sm text-slate-600">View current prescriptions and medications</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[#2b8cee]">notifications</span>
                  <h3 className="font-semibold text-slate-900">Notifications</h3>
                </div>
                <p className="text-sm text-slate-600">Stay updated with important alerts</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
