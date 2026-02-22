import { supabase } from "../db/supabaseClient.js";
import dayjs from "dayjs";

const severityRank = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

// baseline version
export async function runBaselineScheduler() {
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

  // Clear old admissions
  await supabase.from("admissions").delete().neq("id", "");

  // Boolean safety
  patients.forEach((p) => {
    p.is_emergency = Boolean(p.is_emergency);
    p.ventilator_needed = Boolean(p.ventilator_needed);
    p.dialysis_needed = Boolean(p.dialysis_needed);
  });

  beds.forEach((b) => {
    b.ventilator_available = Boolean(b.ventilator_available);
    b.dialysis_available = Boolean(b.dialysis_available);
  });

  // Sort patients
  patients.sort((a, b) => {
    if (a.is_emergency !== b.is_emergency)
      return b.is_emergency - a.is_emergency;

    if (severityRank[a.severity] !== severityRank[b.severity])
      return severityRank[b.severity] - severityRank[a.severity];

    return new Date(a.arrival_time) - new Date(b.arrival_time);
  });

  // Initialize bed availability
  const bedAvailability = {};
  beds.forEach((bed) => {
    bedAvailability[bed.bed_id] = new Date(0); // native Date, not dayjs
  });

  let totalWaiting = 0;
  let admittedCount = 0;

  for (const patient of patients) {
    // if (!patient.arrival_time) continue;

    const arrival = new Date();
    if (isNaN(arrival.getTime())) continue;

    let bestBed = null;
    let bestStartTime = null;

    for (const bed of beds) {
      console.log("Patient:", patient.patient_id, patient.arrival_time);
      // const compatible =
      //   (!patient.ventilator_needed || bed.ventilator_available) &&
      //   (!patient.dialysis_needed || bed.dialysis_available);

      const compatible = true;
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

    await supabase.from("admissions").insert({
      patient_id: patient.patient_id,
      bed_id: bestBed.bed_id,
      admission_time: bestStartTime.toISOString(),
      discharge_time: dischargeTime.toISOString(),
      waiting_hours: waitingHours,
    });
  }

  return {
    totalWaitingHours: totalWaiting,
    averageWaitingHours: admittedCount > 0 ? totalWaiting / admittedCount : 0,
    admittedPatients: admittedCount,
  };
}
