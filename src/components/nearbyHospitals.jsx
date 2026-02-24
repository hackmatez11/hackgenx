import React from "react";

export default function NearbyHospitals({ hospitals }) {
  if (!hospitals || hospitals.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-10">
        No nearby hospitals found.
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospitals.map((hospital, index) => (
          <div
            key={index}
            className="relative bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 p-6 border border-gray-100"
          >
            {/* 🔴 Waiting Time Tag (Top Left) */}
            <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
              {hospital.icu_waiting_minutes} mins wait
            </div>

            {/* 🟢 Beds Available (Bottom Right) */}
            <div className="absolute bottom-4 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
              {hospital.total_beds_available} Beds
            </div>

            {/* ⭐ Recommended Badge (Only First Card) */}
            {index === 0 && (
              <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                Recommended
              </div>
            )}

            {/* 🏥 Hospital Details */}
            <div className="mt-10">
              <h2 className="text-lg font-bold text-gray-800">
                {hospital.hospital_name}
              </h2>
              <p className="text-gray-600 mt-2">{hospital.address}</p>
              <p className="text-gray-500 text-sm">PIN: {hospital.zip_code}</p>

              <p className="text-gray-400 text-sm mt-2">
                {hospital.distance_km} km away
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
