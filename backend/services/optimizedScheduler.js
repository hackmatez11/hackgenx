import { supabase } from "../db/supabaseClient.js";

// assign rank/number encoding to patient type.
const severityRank = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

// baseline brute-force method for scheduling.
function scheduleOnce(patients, beds) {
  const bedAvailability = {};
  beds.forEach((bed) => {
    bedAvailability[bed.bed_id] = new Date(0);
  });

  let totalWaiting = 0;
  let admittedCount = 0;
  const admissions = [];

  for (const patient of patients) {
    if (!patient.arrival_time) continue;

    const arrival = new Date(patient.arrival_time);
    if (isNaN(arrival.getTime())) continue;

    let bestBed = null;
    let bestStartTime = null;

    for (const bed of beds) {
      const compatible =
        (!patient.ventilator_needed || bed.ventilator_available) &&
        (!patient.dialysis_needed || bed.dialysis_available);

      if (!compatible) continue;

      const availableFrom = bedAvailability[bed.bed_id];

      const startTime = arrival > availableFrom ? arrival : availableFrom;

      if (!bestStartTime || startTime < bestStartTime) {
        bestBed = bed;
        bestStartTime = startTime;
      }
    }

    if (!bestBed) continue;

    const dischargeTime = new Date(bestStartTime);
    dischargeTime.setDate(
      dischargeTime.getDate() + patient.predicted_stay_days
    );

    const waitingHours = Math.floor(
      (bestStartTime - arrival) / (1000 * 60 * 60)
    );

    totalWaiting += waitingHours;
    admittedCount++;

    bedAvailability[bestBed.bed_id] = dischargeTime;

    admissions.push({
      patient_id: patient.patient_id,
      bed_id: bestBed.bed_id,
      admission_time: bestStartTime.toISOString(),
      discharge_time: dischargeTime.toISOString(),
      waiting_hours: waitingHours,
    });
  }

  return {
    totalWaiting,
    admittedCount,
    admissions,
  };
}

// optimized method for scheduling
export async function runOptimizedScheduler(iterations = 20) {
  const { data: patients, error: pError } = await supabase
    .from("patients")
    .select("*");

  const { data: beds, error: bError } = await supabase
    .from("icu_beds")
    .select("*");

  if (pError) throw new Error(pError.message);
  if (bError) throw new Error(bError.message);

  if (!patients?.length) throw new Error("No patients found");
  if (!beds?.length) throw new Error("No beds found");

  let bestResult = null;

  for (let i = 0; i < iterations; i++) {
    // 🔥 Random-Key Priority Score
    const randomizedPatients = [...patients].map((p) => ({
      ...p,
      priorityScore:
        Math.random() * 0.4 +
        (p.is_emergency ? 0.3 : 0) +
        (severityRank[p.severity] || 0) * 0.1,
    }));

    randomizedPatients.sort((a, b) => b.priorityScore - a.priorityScore);

    const result = scheduleOnce(randomizedPatients, beds);

    if (!bestResult || result.totalWaiting < bestResult.totalWaiting) {
      bestResult = result;
    }
  }

  // Clear old admissions
  await supabase.from("admissions").delete().neq("id", "");

  if (bestResult.admissions.length > 0) {
    await supabase.from("admissions").insert(bestResult.admissions);
  }

  return {
    totalWaitingHours: bestResult.totalWaiting,
    averageWaitingHours:
      bestResult.admittedCount > 0
        ? bestResult.totalWaiting / bestResult.admittedCount
        : 0,
    admittedPatients: bestResult.admittedCount,
    optimizationRuns: iterations,
  };
}
