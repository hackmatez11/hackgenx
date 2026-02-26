import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext_simple';

export default function PatientLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/');
    }
  };

  const navItems = [
    { to: '/patient-dashboard', label: 'Overview', icon: 'dashboard' },
    { to: '/patient-dashboard/appointments', label: 'Appointments', icon: 'event_available' },
    { to: '/patient-dashboard/history', label: 'History', icon: 'medical_information' },
  ];

  const isRootOverview = location.pathname === '/patient-dashboard';

  return (
    <div className="min-h-screen bg-[#f6f7f8] font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 sm:px-10 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#2b8cee]/10 text-[#2b8cee]">
              <span className="material-symbols-outlined">local_hospital</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">MediFlow</h1>
              <p className="hidden sm:block text-xs text-slate-500">
                Patient portal — manage your care in one place
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-slate-600">
              Welcome, {user?.email?.split('@')[0]}
            </span>
            <button
              onClick={handleSignOut}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 px-4 text-sm font-bold text-slate-900 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main content with sidebar nav + outlet */}
      <main className="flex-1 bg-white">
        <div className="flex min-h-[calc(100vh-56px)]">
          {/* Sidebar navigation */}
          <aside className="hidden md:flex md:w-60 md:flex-col border-r border-slate-200 bg-white text-sm">
            <p className="mb-3 px-4 pt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Dashboard
            </p>
            <nav className="flex flex-col gap-1 px-2 pb-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/patient-dashboard'}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-2 rounded-lg px-3 py-2 transition-colors',
                      isActive
                        ? 'bg-[#2b8cee]/10 text-[#2b8cee] font-semibold shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    ].join(' ')
                  }
                >
                  <span className="material-symbols-outlined text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Mobile top nav (fallback) + main content */}
          <div className="flex-1 bg-white">
            <nav className="mb-4 flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 text-sm md:hidden">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/patient-dashboard'}
                  className={({ isActive }) =>
                    [
                      'inline-flex items-center gap-2 rounded-lg px-3 py-2 whitespace-nowrap transition-all',
                      isActive
                        ? 'bg-[#2b8cee]/10 text-[#2b8cee] font-semibold shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    ].join(' ')
                  }
                >
                  <span className="material-symbols-outlined text-base">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="h-full">
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto w-full max-w-4xl">
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

