import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext_simple';
import { supabase } from '../../lib/supabase';
import { allocateEmergencyICUBed } from '../../services/emergencyBedAllocationService';
import { useDoctorsList } from '../../hooks/useDoctorsList';
import {
  computeMovingAverage,
  getNextQueuePosition,
  PATIENT_MOVING_AVG_WINDOW,
} from '../../utils/patientQueueHelpers';

export default function PatientAppointments() {
  const { user } = useAuth();
  const { doctors } = useDoctorsList();

  const [formData, setFormData] = useState({
    patient_name: '',
    age: '',
    disease: '',
    phone: '',
    email: user?.email || '',
    appointment_date: '',
    doctor_id: '',
    notes: '',
    is_emergency: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [queueInfo, setQueueInfo] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setQueueInfo(null);

    if (
      !formData.patient_name ||
      !formData.age ||
      !formData.disease ||
      !formData.phone ||
      !formData.email ||
      !formData.appointment_date ||
      !formData.doctor_id
    ) {
      setError('Please fill in all required fields');
      return;
    }
    if (parseInt(formData.age, 10) < 1 || parseInt(formData.age, 10) > 150) {
      setError('Age must be between 1 and 150');
      return;
    }

    try {
      setLoading(true);

      const { data: apptData, error: apptError } = await supabase
        .from('appointments')
        .insert([
          {
            patient_name: formData.patient_name,
            age: parseInt(formData.age, 10),
            disease: formData.disease,
            phone: formData.phone,
            email: formData.email,
            appointment_date: formData.appointment_date,
            doctor_id: formData.doctor_id,
            notes: formData.notes,
            status: 'scheduled',
            is_emergency: formData.is_emergency,
          },
        ])
        .select();

      if (apptError) throw apptError;

      const appointment = apptData?.[0];

      if (formData.is_emergency) {
        const tokenNumber = appointment?.token_number || `ICU-${Date.now()}`;

        const { data: icuQueueData, error: icuError } = await supabase
          .from('icu_queue')
          .insert([
            {
              patient_token: tokenNumber,
              patient_name: formData.patient_name,
              diseases: formData.disease,
              doctor_id: formData.doctor_id,
              is_emergency: true,
              status: 'waiting',
              severity: 'critical',
              ventilator_needed: false,
              dialysis_needed: false,
              predicted_stay_days: 7,
              created_at: new Date().toISOString(),
            },
          ])
          .select();

        if (icuError) throw icuError;

        const icuQueueEntry = icuQueueData?.[0];

        if (icuQueueEntry) {
          const allocationResult = await allocateEmergencyICUBed({
            icuQueueId: icuQueueEntry.id,
            doctorId: formData.doctor_id,
            patientRequirements: {
              ventilator_needed: false,
              dialysis_needed: false,
            },
            predictedStayDays: 7,
          });

          if (allocationResult.success) {
            if (allocationResult.bedFreed) {
              setSuccess(
                `Emergency appointment booked! ICU bed ${allocationResult.bed.bed_id} assigned (transferred ${allocationResult.transferredPatient} to general ward).`,
              );
            } else {
              setSuccess(
                `Emergency appointment booked! ICU bed ${allocationResult.bed.bed_id} assigned.`,
              );
            }
          } else {
            setSuccess(
              'Emergency appointment booked! You have been added to ICU Queue (no beds currently available).',
            );
          }
        }

        setQueueInfo({ token: tokenNumber, isEmergency: true });
      } else {
        const [estimatedWait, queuePosition] = await Promise.all([
          computeMovingAverage(formData.doctor_id),
          getNextQueuePosition(formData.doctor_id),
        ]);

        const tokenNumber = appointment?.token_number || `OPD-${queuePosition}`;

        const { error: opdError } = await supabase.from('opd_queue').insert([
          {
            appointment_id: appointment.id,
            patient_name: formData.patient_name,
            disease: formData.disease,
            token_number: tokenNumber,
            doctor_id: formData.doctor_id,
            queue_position: queuePosition,
            status: 'waiting',
            estimated_wait_minutes: estimatedWait,
            entered_queue_at: new Date().toISOString(),
          },
        ]);

        if (opdError) throw opdError;

        setQueueInfo({
          position: queuePosition,
          estimatedWait,
          token: tokenNumber,
        });
        setSuccess('Appointment booked successfully!');
      }

      setFormData({
        patient_name: '',
        age: '',
        disease: '',
        phone: '',
        email: user?.email || '',
        appointment_date: '',
        doctor_id: '',
        notes: '',
        is_emergency: false,
      });
    } catch (err) {
      setError('Failed to schedule appointment: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {success && queueInfo && (
        <div className="mb-8 rounded-2xl overflow-hidden shadow-lg border border-green-200">
          <div
            className={`${
              queueInfo.isEmergency
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : 'bg-gradient-to-r from-green-500 to-emerald-600'
            } px-6 py-4 flex items-center gap-3`}
          >
            <span className="material-symbols-outlined text-white text-3xl">
              {queueInfo.isEmergency ? 'emergency' : 'check_circle'}
            </span>
            <div>
              <p className="text-white font-bold text-lg">{success}</p>
              <p
                className={`${
                  queueInfo.isEmergency ? 'text-red-100' : 'text-green-100'
                } text-sm`}
              >
                {queueInfo.isEmergency
                  ? 'Emergency patient prioritized for ICU'
                  : 'You are now in the live OPD priority queue'}
              </p>
            </div>
          </div>
          <div className="bg-white px-6 py-6 grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Token ID
              </p>
              <p className="text-xl font-black text-[#2b8cee]">
                {queueInfo.token}
              </p>
            </div>
            {!queueInfo.isEmergency && (
              <>
                <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Queue Pos
                  </p>
                  <p className="text-2xl font-black text-slate-900">
                    #{queueInfo.position}
                  </p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">
                    Approx. Wait
                  </p>
                  <p className="text-2xl font-black text-amber-700">
                    {queueInfo.estimatedWait} min
                  </p>
                </div>
              </>
            )}
            {queueInfo.isEmergency && (
              <>
                <div className="text-center p-4 bg-red-50 rounded-2xl border border-red-200">
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">
                    Priority
                  </p>
                  <p className="text-2xl font-black text-red-700">EMERGENCY</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-2xl border border-red-200">
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">
                    Queue Type
                  </p>
                  <p className="text-2xl font-black text-red-700">ICU</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="mb-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#2b8cee] text-2xl">
          add_circle
        </span>
        <h2 className="text-xl font-bold text-slate-900">
          Schedule a new appointment
        </h2>
      </div>
      <p className="mb-6 text-sm text-slate-500">
        Choose your doctor, pick a time slot, and we&apos;ll place you in the
        live OPD queue. Emergency visits are routed to ICU.
      </p>

      <div className="mb-6 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700">
        <span className="material-symbols-outlined text-[18px]">
          auto_awesome
        </span>
        Wait time is predicted using the moving average of the last{' '}
        {PATIENT_MOVING_AVG_WINDOW} consultations.
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Patient Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="patient_name"
              value={formData.patient_name}
              onChange={handleInputChange}
              placeholder="John Doe"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2b8cee]/20 focus:border-[#2b8cee] bg-slate-50 transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
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
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2b8cee]/20 focus:border-[#2b8cee] bg-slate-50 transition-all font-medium"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2b8cee]/20 focus:border-[#2b8cee] bg-slate-50 transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="john@example.com"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2b8cee]/20 focus:border-[#2b8cee] bg-slate-50 transition-all font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Symptoms / Reason for Visit <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="disease"
            value={formData.disease}
            onChange={handleInputChange}
            placeholder="Describe your health concern"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2b8cee]/20 focus:border-[#2b8cee] bg-slate-50 transition-all font-medium"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Preferred Doctor <span className="text-red-500">*</span>
            </label>
            <select
              name="doctor_id"
              value={formData.doctor_id}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2b8cee]/20 focus:border-[#2b8cee] bg-slate-50 transition-all font-medium appearance-none"
            >
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name || doctor.email.split('@')[0]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Date and Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="appointment_date"
              value={formData.appointment_date}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2b8cee]/20 focus:border-[#2b8cee] bg-slate-50 transition-all font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Additional Notes{' '}
            <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="List any medical history or allergies..."
            rows={3}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2b8cee]/20 focus:border-[#2b8cee] bg-slate-50 transition-all font-medium resize-none"
          />
        </div>

        <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <input
            type="checkbox"
            id="is_emergency"
            name="is_emergency"
            checked={formData.is_emergency}
            onChange={handleInputChange}
            className="w-5 h-5 text-red-600 border-red-300 rounded focus:ring-red-500 focus:ring-2 cursor-pointer"
          />
          <label
            htmlFor="is_emergency"
            className="flex items-center gap-2 cursor-pointer flex-1"
          >
            <span className="material-symbols-outlined text-red-600 text-2xl">
              emergency
            </span>
            <div>
              <p className="text-sm font-bold text-red-700">Emergency visit</p>
              <p className="text-xs text-red-600">
                Skip OPD queue and add directly to ICU triage queue.
              </p>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full ${
            formData.is_emergency
              ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-200'
              : 'bg-gradient-to-r from-[#2b8cee] to-[#1a73e8] hover:from-[#1a73e8] hover:to-[#174ea6] shadow-blue-200'
          } hover:shadow-lg text-white font-bold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 shadow-md text-lg`}
        >
          {loading ? (
            <span className="material-symbols-outlined animate-spin">
              progress_activity
            </span>
          ) : (
            <span className="material-symbols-outlined">
              {formData.is_emergency ? 'emergency' : 'send'}
            </span>
          )}
          {loading
            ? 'Processing...'
            : formData.is_emergency
            ? 'Book Emergency & Add to ICU'
            : 'Confirm Booking & Join Queue'}
        </button>
      </form>
    </div>
  );
}

