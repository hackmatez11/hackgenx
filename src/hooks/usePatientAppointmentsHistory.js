import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function usePatientAppointmentsHistory(email) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    if (!email) return;
    setLoading(true);
    setError(null);

    try {
      const { data: appointments, error: apptError } = await supabase
        .from('appointments')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false });

      if (apptError) {
        throw apptError;
      }

      if (appointments && appointments.length > 0) {
        const doctorIds = [...new Set(appointments.map((appt) => appt.doctor_id).filter(Boolean))];

        if (doctorIds.length > 0) {
          const { data: doctors } = await supabase
            .from('user_profiles')
            .select('id, name, email')
            .in('id', doctorIds);

          const enriched = appointments.map((appt) => ({
            ...appt,
            doctor: doctors?.find((doc) => doc.id === appt.doctor_id),
          }));

          setHistory(enriched);
        } else {
          setHistory(appointments);
        }
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error('Error fetching appointment history:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    refresh: fetchHistory,
  };
}

