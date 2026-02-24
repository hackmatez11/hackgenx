import { supabase } from '../lib/supabase';

const DEFAULT_WAIT_MINUTES = 15;
const MOVING_AVG_WINDOW = 5;

export async function computeMovingAverage(doctorId) {
  try {
    const { data, error } = await supabase
      .from('opd_queue')
      .select('actual_wait_minutes')
      .eq('doctor_id', doctorId)
      .eq('status', 'completed')
      .not('actual_wait_minutes', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(MOVING_AVG_WINDOW);

    if (error || !data || data.length === 0) return DEFAULT_WAIT_MINUTES;

    const avg =
      data.reduce((sum, r) => sum + parseFloat(r.actual_wait_minutes), 0) /
      data.length;
    return Math.round(avg);
  } catch {
    return DEFAULT_WAIT_MINUTES;
  }
}

export async function getNextQueuePosition(doctorId) {
  const { count } = await supabase
    .from('opd_queue')
    .select('id', { count: 'exact', head: true })
    .eq('doctor_id', doctorId)
    .in('status', ['waiting', 'in_progress']);

  return (count || 0) + 1;
}

export const PATIENT_MOVING_AVG_WINDOW = MOVING_AVG_WINDOW;

