import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useDoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: supaError } = await supabase
          .from('user_profiles')
          .select('id, email, name')
          .eq('role', 'doctor');

        if (supaError) throw supaError;
        setDoctors(data || []);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return { doctors, loading, error };
}

