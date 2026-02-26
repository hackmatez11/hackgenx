import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import DailyRoundModal from '../components/DailyRoundModal';

export default function QrRoundPage() {
  const [searchParams] = useSearchParams();
  const bedIdFromQuery = searchParams.get('bedId');
  const icuBedIdFromQuery = searchParams.get('icuBedId');
  const isICU = searchParams.get('icu') === '1';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bed, setBed] = useState(null);
  const [showRoundModal, setShowRoundModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadBed = async () => {
      setLoading(true);
      setError('');
      setBed(null);

      try {
        if (isICU) {
          // ICU flow: fetch ICU bed and its assigned queue entry
          if (!icuBedIdFromQuery) {
            setError('ICU bed ID is missing in QR link.');
            setLoading(false);
            return;
          }

          const { data: icuBeds, error: icuBedError } = await supabase
            .from('icu_beds')
            .select('*')
            .eq('id', icuBedIdFromQuery)
            .limit(1);

          if (icuBedError) throw icuBedError;
          const icuBed = icuBeds?.[0];

          if (!icuBed) {
            setError('No ICU bed found for this QR code.');
            setLoading(false);
            return;
          }

          const { data: queueData, error: queueError } = await supabase
            .from('icu_queue')
            .select('*')
            .eq('assigned_bed_id', icuBed.id);

          if (queueError) throw queueError;

          const bedQueueEntries = queueData || [];
          const activeQ =
            bedQueueEntries.find(
              (q) => q.status === 'assigned'
            ) || bedQueueEntries[0] || null;

          setBed({
            ...icuBed,
            // For ICU we treat icu_beds.id as the primary UUID,
            // and icu_beds.bed_id as the human-readable label.
            is_icu: true,
            bed_id: icuBed.id,      // UUID for daily_rounds.icu_bed_id
            bed_number: icuBed.bed_id, // label shown in UI
            activeQueue: activeQ,
          });
          setShowRoundModal(true);
          setLoading(false);
          return;
        }

        // General ward flow
        if (!bedIdFromQuery) {
          setError('Bed ID is missing in QR link.');
          setLoading(false);
          return;
        }

        // Fetch the bed by bed_id
        const { data: bedsData, error: bedsError } = await supabase
          .from('beds')
          .select('*')
          .eq('bed_id', bedIdFromQuery)
          .limit(1);

        if (bedsError) throw bedsError;
        const bedRow = bedsData?.[0];

        if (!bedRow) {
          setError('No bed found for this QR code.');
          setLoading(false);
          return;
        }

        // Fetch queue entries for this bed to attach activeQueue
        const { data: queueData, error: queueError } = await supabase
          .from('bed_queue')
          .select(`
            id, patient_name, disease, phone, age, token_number,
            admitted_from_opd_at, bed_assigned_at, status, bed_id,
            predictions:discharge_predictions(
              predicted_discharge_date, remaining_days, confidence, reasoning, created_at
            )
          `)
          .eq('bed_id', bedRow.bed_id);

        if (queueError) throw queueError;

        const bedQueueEntries = queueData || [];
        const activeQ =
          bedQueueEntries.find(
            (q) => q.status === 'bed_assigned' || q.status === 'admitted'
          ) || bedQueueEntries[0] || null;

        if (activeQ && activeQ.predictions?.length) {
          const sorted = [...activeQ.predictions].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
          activeQ.latestPrediction = sorted[0];
        }

        setBed({ ...bedRow, activeQueue: activeQ });
        setShowRoundModal(true);
      } catch (err) {
        console.error('QR round load error:', err);
        setError(err.message || 'Failed to load bed details.');
      } finally {
        setLoading(false);
      }
    };

    loadBed();
  }, [bedIdFromQuery, icuBedIdFromQuery, isICU]);

  const handleRoundUpdated = () => {
    setSubmitted(true);
  };

  const handleClose = () => {
    setShowRoundModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-4">
      {loading && (
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin" />
          <p className="text-sm text-slate-600">Loading bed details…</p>
        </div>
      )}

      {!loading && error && (
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 border border-red-200">
          <h1 className="text-xl font-bold text-red-700 mb-2">Unable to open round form</h1>
          <p className="text-sm text-red-600 mb-2">{error}</p>
          <p className="text-xs text-slate-500">
            Please contact the administrator or regenerate the QR code for this bed.
          </p>
        </div>
      )}

      {!loading && !error && bed && !submitted && (
        <p className="text-xs text-slate-500 mb-2">
          Opening daily round form for bed <span className="font-semibold">{bed.bed_number || bed.bed_id}</span>.
        </p>
      )}

      {!loading && submitted && (
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 border border-emerald-200 text-center">
          <div className="flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-emerald-500 text-4xl">check_circle</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-1">Round submitted</h1>
          <p className="text-sm text-slate-600">
            Patient round details were saved successfully and the discharge prediction has been updated.
          </p>
        </div>
      )}

      {showRoundModal && bed && !submitted && (
        <DailyRoundModal
          bed={bed}
          onClose={handleClose}
          onUpdate={handleRoundUpdated}
        />
      )}
    </div>
  );
}

