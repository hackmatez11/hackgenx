import { supabase } from "../db/supabaseClient.js";

// Haversine Distance Formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function getTopNearbyHospitals(userLat, userLon) {
  // 1️⃣ Fetch all hospitals (doctors)
  const { data: hospitals, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("role", "doctor");

  if (error) throw new Error(error.message);

  const enrichedHospitals = [];

  for (const hospital of hospitals) {
    if (!hospital.latitude || !hospital.longitude) continue;

    // 2️⃣ Calculate distance
    const distance = calculateDistance(
      userLat,
      userLon,
      Number(hospital.latitude),
      Number(hospital.longitude)
    );

    // 3️⃣ Get available ICU beds
    const { count: availableBeds } = await supabase
      .from("icu_beds")
      .select("*", { count: "exact", head: true })
      .eq("doctor_id", hospital.id)
      .eq("is_available", true);

    // 4️⃣ Get ICU waiting time
    const { data: waitingQueue } = await supabase
      .from("icu_queue")
      .select("time")
      .eq("doctor_id", hospital.id)
      .eq("status", "waiting");

    let avgWaitingMinutes = 0;

    if (waitingQueue && waitingQueue.length > 0) {
      const now = new Date();

      const totalMinutes = waitingQueue.reduce((sum, patient) => {
        const arrival = new Date(patient.time);
        const diff = (now - arrival) / (1000 * 60);
        return sum + diff;
      }, 0);

      avgWaitingMinutes = totalMinutes / waitingQueue.length;
    }

    enrichedHospitals.push({
      hospital_name: hospital.name,
      address: `${hospital.city}, ${hospital.state}`,
      zip_code: hospital.zip_code,
      distance_km: distance.toFixed(2),
      icu_waiting_minutes: Math.round(avgWaitingMinutes),
      total_beds_available: availableBeds || 0,
    });
  }

  // 5️⃣ Sort by nearest
  enrichedHospitals.sort((a, b) => a.distance_km - b.distance_km);

  // 6️⃣ Return Top 3
  return enrichedHospitals.slice(0, 3);
}
