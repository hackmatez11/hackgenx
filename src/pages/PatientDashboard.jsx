import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext_simple';
import { supabase } from '../lib/supabase';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();

  const [formData, setFormData] = useState({
    patient_name: '',
    age: '',
    disease: '',
    phone: '',
    email: '',
    appointment_date: '',
    doctor_id: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [queueInfo, setQueueInfo] = useState(null);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, email, name')
          .eq('role', 'doctor');

        if (error) throw error;
        setDoctors(data || []);
      } catch (err) {
        console.error('Error fetching doctors:', err);
      }
    };

    fetchDoctors();
  }, []);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setQueueInfo(null);

    if (!formData.patient_name || !formData.age || !formData.disease || !formData.phone || !formData.email || !formData.appointment_date || !formData.doctor_id) {
      setError('Please fill in all required fields');
      return;
    }
    if (parseInt(formData.age) < 1 || parseInt(formData.age) > 150) {
      setError('Age must be between 1 and 150');
      return;
    }

    try {
      setLoading(true);

      // Insert appointment with doctor
      const { data: apptData, error: apptError } = await supabase
        .from('appointments')
        .insert([{
          patient_name: formData.patient_name,
          age: parseInt(formData.age),
          disease: formData.disease,
          phone: formData.phone,
          email: formData.email,
          appointment_date: formData.appointment_date,
          doctor_id: formData.doctor_id,
          notes: formData.notes,
          status: 'scheduled'
        }])
        .select();

      if (apptError) throw apptError;

      const appointment = apptData?.[0];
      const tokenNumber = appointment?.token_number || 'OPD-' + Math.random().toString(36).substr(2, 9).toUpperCase();

      // Get next queue position for this doctor
      const { data: queueData, error: queueError } = await supabase
        .from('opd_queue')
        .select('queue_position')
        .eq('doctor_id', formData.doctor_id)
        .order('queue_position', { ascending: false })
        .limit(1);

      if (queueError) throw queueError;

      const nextPosition = (queueData?.[0]?.queue_position || 0) + 1;

      // Insert into OPD queue
      const { error: opdError } = await supabase
        .from('opd_queue')
        .insert([{
          appointment_id: appointment.id,
          patient_name: formData.patient_name,
          disease: formData.disease,
          token_number: tokenNumber,
          doctor_id: formData.doctor_id,
          queue_position: nextPosition,
          status: 'waiting'
        }]);

      if (opdError) throw opdError;

      setQueueInfo({ position: nextPosition, estimatedWait: 15, token: tokenNumber });
      setSuccess(`Appointment booked successfully!`);
      setFormData({
        patient_name: '', age: '', disease: '', phone: '',
        email: '', appointment_date: '', doctor_id: '', notes: ''
      });
    } catch (err) {
      setError('Failed to schedule appointment: ' + err.message);
    } finally {
      setLoading(false);
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

        {/* Appointment Scheduling Form */}
        <div className="mt-8">
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            {/* Alerts */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3 animate-pulse">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}

            {/* Queue Success Banner */}
            {success && queueInfo && (
              <div className="mb-6 rounded-2xl overflow-hidden shadow-lg border border-green-200">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-white text-3xl">check_circle</span>
                  <div>
                    <p className="text-white font-bold text-lg">{success}</p>
                    <p className="text-green-100 text-sm">Patient is now in the OPD waiting queue</p>
                  </div>
                </div>
                <div className="bg-white px-6 py-4 grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Token</p>
                    <p className="text-2xl font-bold text-[#2b8cee]">{queueInfo.token}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Queue Position</p>
                    <p className="text-2xl font-bold text-slate-900">#{queueInfo.position}</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-xs font-semibold text-amber-600 uppercase mb-1">Est. Wait Time</p>
                    <p className="text-2xl font-bold text-amber-700">~{queueInfo.estimatedWait} min</p>
                  </div>
                </div>
              </div>
            )}

            {success && !queueInfo && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-3">
                <span className="material-symbols-outlined">check_circle</span>
                {success}
              </div>
            )}

            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-[#2b8cee] text-3xl">event_available</span>
              <h2 className="text-2xl font-bold text-slate-900">Schedule New Appointment</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Patient Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="patient_name"
                  value={formData.patient_name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b8cee] focus:border-transparent bg-slate-50 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="30"
                    min="1"
                    max="150"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b8cee] focus:border-transparent bg-slate-50 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1234567890"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b8cee] focus:border-transparent bg-slate-50 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Disease/Condition <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="disease"
                  value={formData.disease}
                  onChange={handleInputChange}
                  placeholder="e.g., Fever, Headache"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b8cee] focus:border-transparent bg-slate-50 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="patient@example.com"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b8cee] focus:border-transparent bg-slate-50 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Choose Doctor <span className="text-red-500">*</span>
                </label>
                <select
                  name="doctor_id"
                  value={formData.doctor_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b8cee] focus:border-transparent bg-slate-50 transition"
                >
                  <option value="">Select a doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name || doctor.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Appointment Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="appointment_date"
                  value={formData.appointment_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b8cee] focus:border-transparent bg-slate-50 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Notes <span className="text-slate-400">(Optional)</span>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Add any additional notes or special requirements..."
                  rows="3"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b8cee] focus:border-transparent bg-slate-50 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#2b8cee] to-[#1e6bb8] hover:shadow-lg text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
              >
                <span className="material-symbols-outlined">queue</span>
                {loading ? 'Scheduling & Adding to Queue...' : 'Schedule & Add to OPD Queue'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
