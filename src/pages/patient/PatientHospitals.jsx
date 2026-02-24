import React, { useEffect, useState } from 'react';

export default function PatientHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNearbyHospitals = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/hospitals/nearby', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latitude: 18.5204,
            longitude: 73.8567,
          }),
        });

        const data = await res.json();
        if (data.status === 'success') {
          setHospitals(data.data);
        } else {
          throw new Error('Failed to load hospitals');
        }
      } catch (err) {
        console.error('Failed to fetch hospitals:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyHospitals();
  }, []);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-[#2b8cee] text-2xl">
          location_on
        </span>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Nearby ICU hospitals
          </h2>
          <p className="text-sm text-slate-500">
            Find nearby hospitals with ICU capacity and estimated waiting time.
          </p>
        </div>
      </div>

      {loading && (
        <p className="text-slate-500 text-sm">Loading hospitals...</p>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          Could not load hospitals: {error.message}
        </div>
      )}

      {!loading && !error && hospitals.length === 0 && (
        <p className="text-slate-500 text-sm">
          No nearby ICU hospitals found for the given location.
        </p>
      )}

      {!loading && hospitals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((hospital, index) => (
            <div
              key={index}
              className="relative bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6 border border-slate-200"
            >
              <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                {hospital.icu_waiting_minutes} mins
              </div>

              <div className="absolute bottom-4 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                {hospital.total_beds_available} Beds
              </div>

              {index === 0 && (
                <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                  Recommended
                </div>
              )}

              <div className="mt-10">
                <h3 className="text-lg font-bold text-slate-900">
                  {hospital.hospital_name}
                </h3>
                <p className="text-slate-600 mt-1">{hospital.address}</p>
                <p className="text-slate-500 text-sm">
                  PIN: {hospital.zip_code}
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  {hospital.distance_km} km away
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

