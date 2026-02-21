import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext_simple';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, userRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f7f8]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2b8cee]"></div>
          <p className="mt-2 text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/signin" replace />
  }

  if (requiredRole) {
    if (userRole !== requiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f6f7f8] px-4">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <span className="material-symbols-outlined text-4xl text-slate-400">lock</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
            <p className="text-slate-600 mb-4">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center rounded-lg bg-[#2b8cee] px-4 py-2 text-sm font-medium text-white hover:bg-[#2b8cee]/90"
            >
              Go Back
            </button>
          </div>
        </div>
      )
    }
  }

  return children
}
