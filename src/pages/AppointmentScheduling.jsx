import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext_simple';
import { supabase } from '../lib/supabase';

export default function AppointmentScheduling() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    patient_name: '',
    age: '',
    disease: '',
    phone: '',
    email: '',
    appointment_date: '',
    notes: ''
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch appointments on component mount
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', user?.id)
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (err) {
      setError('Failed to fetch appointments: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.patient_name || !formData.age || !formData.disease || !formData.phone || !formData.email || !formData.appointment_date) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseInt(formData.age) < 1 || parseInt(formData.age) > 150) {
      setError('Age must be between 1 and 150');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .insert([
          {
            patient_name: formData.patient_name,
            age: parseInt(formData.age),
            disease: formData.disease,
            phone: formData.phone,
            email: formData.email,
            appointment_date: formData.appointment_date,
            notes: formData.notes,
            doctor_id: user?.id,
            status: 'scheduled'
          }
        ])
        .select();

      if (error) throw error;

      const appointmentToken = data?.[0]?.token_number || 'N/A';
      setSuccess(`Appointment scheduled successfully! Token: ${appointmentToken}`);
      setFormData({
        patient_name: '',
        age: '',
        disease: '',
        phone: '',
        email: '',
        appointment_date: '',
        notes: ''
      });

      // Refresh appointments list
      fetchAppointments();
    } catch (err) {
      setError('Failed to schedule appointment: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;

      setSuccess('Appointment cancelled successfully!');
      fetchAppointments();
    } catch (err) {
      setError('Failed to cancel appointment: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header - Fixed */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 md:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Appointment Scheduling</h1>
          <p className="text-slate-600 text-lg">Manage and schedule patient appointments efficiently</p>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3 animate-pulse">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-3">
              <span className="material-symbols-outlined">check_circle</span>
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Form Section */}
            <div className="order-2 xl:order-1">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">New Appointment</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Patient Name */}
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

                  {/* Age and Phone in row */}
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

                  {/* Disease/Condition */}
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

                  {/* Email */}
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

                  {/* Appointment Date */}
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

                  {/* Notes */}
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

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#2b8cee] to-[#1e6bb8] hover:shadow-lg text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
                  >
                    <span className="material-symbols-outlined">event_available</span>
                    {loading ? 'Scheduling...' : 'Schedule Appointment'}
                  </button>
                </form>
              </div>
            </div>

            {/* Appointments List Section */}
            <div className="order-1 xl:order-2">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-[#2b8cee] text-3xl">schedule</span>
                  <h2 className="text-2xl font-bold text-slate-900">Scheduled Appointments</h2>
                </div>

                {loading && !appointments.length && (
                  <div className="text-center py-16">
                    <div className="animate-spin w-12 h-12 border-4 border-slate-200 border-t-[#2b8cee] rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading appointments...</p>
                  </div>
                )}

                {appointments.length === 0 && !loading && (
                  <div className="text-center py-16">
                    <span className="material-symbols-outlined text-6xl text-slate-300 block mb-4">event</span>
                    <p className="text-slate-500 text-lg">No appointments scheduled yet</p>
                    <p className="text-slate-400 text-sm mt-2">Create your first appointment using the form</p>
                  </div>
                )}

                {appointments.length > 0 && (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl hover:shadow-md transition-all duration-200 hover:border-[#2b8cee]"
                      >
                        <div className="flex justify-between items-start mb-3 gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="font-bold text-slate-900 text-lg">{appointment.patient_name}</h3>
                              <span className="bg-gradient-to-r from-[#2b8cee] to-[#1e6bb8] text-white text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                                #{appointment.token_number}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600">
                              <span className="font-semibold">Disease:</span> {appointment.disease}
                            </p>
                          </div>
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                            appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                            appointment.status === 'completed' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                          <div className="bg-white p-2 rounded-lg">
                            <span className="text-slate-600 text-xs font-medium uppercase">Age</span>
                            <p className="font-semibold text-slate-900">{appointment.age} years</p>
                          </div>
                          <div className="bg-white p-2 rounded-lg">
                            <span className="text-slate-600 text-xs font-medium uppercase">Phone</span>
                            <p className="font-semibold text-slate-900 text-sm">{appointment.phone}</p>
                          </div>
                          <div className="bg-white p-2 rounded-lg col-span-2">
                            <span className="text-slate-600 text-xs font-medium uppercase">Email</span>
                            <p className="font-semibold text-slate-900 text-sm truncate">{appointment.email}</p>
                          </div>
                          <div className="bg-white p-2 rounded-lg col-span-2">
                            <span className="text-slate-600 text-xs font-medium uppercase">Date & Time</span>
                            <p className="font-semibold text-slate-900 text-sm">{formatDate(appointment.appointment_date)}</p>
                          </div>
                        </div>

                        {appointment.notes && (
                          <div className="mb-3 bg-white p-2 rounded-lg">
                            <span className="text-slate-600 text-xs font-medium uppercase">Notes</span>
                            <p className="text-sm text-slate-700 mt-1">{appointment.notes}</p>
                          </div>
                        )}

                        <button
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          disabled={loading}
                          className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 rounded-lg transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-lg">close</span>
                          Cancel Appointment
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
