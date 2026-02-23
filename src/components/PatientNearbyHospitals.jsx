import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext_simple';

/**
 * Inline Nearby Hospitals for a specific patient
 * Shows available ICU beds in other hospitals directly in the patient row
 */
export default function PatientNearbyHospitals({ patient }) {
    const [loading, setLoading] = useState(true);
    const [nearbyDoctors, setNearbyDoctors] = useState([]);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    useEffect(() => {
        fetchNearbyHospitals();
    }, [user?.id, patient?.id]);

    const fetchNearbyHospitals = async () => {
        if (!user?.id) return;

        setLoading(true);
        setError(null);

        try {
            const { data: currentDoctor, error: doctorError } = await supabase
                .from('user_profiles')
                .select('latitude, longitude')
                .eq('id', user.id)
                .single();

            if (doctorError) throw doctorError;

            if (!currentDoctor?.latitude || !currentDoctor?.longitude) {
                setError('Location not set');
                setLoading(false);
                return;
            }

            const { latitude: myLat, longitude: myLng } = currentDoctor;

            const { data: otherDoctors, error: doctorsError } = await supabase
                .from('user_profiles')
                .select('id, email, name, street, city, state, latitude, longitude')
                .eq('role', 'doctor')
                .not('id', 'eq', user.id)
                .not('latitude', 'is', null)
                .not('longitude', 'is', null);

            if (doctorsError) throw doctorsError;

            if (!otherDoctors || otherDoctors.length === 0) {
                setNearbyDoctors([]);
                setLoading(false);
                return;
            }

            const doctorIds = otherDoctors.map(d => d.id);

            let bedQuery = supabase
                .from('icu_beds')
                .select('doctor_id, ventilator_available, dialysis_available')
                .eq('is_available', true)
                .in('doctor_id', doctorIds);

            // Filter by patient requirements
            if (patient?.ventilator_needed) {
                bedQuery = bedQuery.eq('ventilator_available', true);
            }
            if (patient?.dialysis_needed) {
                bedQuery = bedQuery.eq('dialysis_available', true);
            }

            const { data: availableBeds, error: bedsError } = await bedQuery;

            if (bedsError) throw bedsError;

            const bedCounts = {};
            availableBeds?.forEach(bed => {
                bedCounts[bed.doctor_id] = (bedCounts[bed.doctor_id] || 0) + 1;
            });

            const doctorsWithDistance = otherDoctors
                .filter(doctor => bedCounts[doctor.id] > 0)
                .map(doctor => {
                    const distance = calculateDistance(
                        myLat, myLng,
                        doctor.latitude, doctor.longitude
                    );
                    return {
                        ...doctor,
                        distance: parseFloat(distance.toFixed(2)),
                        availableBeds: bedCounts[doctor.id] || 0
                    };
                })
                .sort((a, b) => {
                    if (Math.abs(a.distance - b.distance) < 0.5) {
                        return b.availableBeds - a.availableBeds;
                    }
                    return a.distance - b.distance;
                })
                .slice(0, 3); // Show top 3 nearest

            setNearbyDoctors(doctorsWithDistance);
        } catch (err) {
            console.error('Error fetching nearby hospitals:', err);
            setError('Failed to load');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-3 h-3 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                <span>Finding nearby hospitals...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-xs text-amber-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">info</span>
                <span>{error}</span>
            </div>
        );
    }

    if (nearbyDoctors.length === 0) {
        return (
            <div className="text-xs text-slate-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_off</span>
                <span>No nearby hospitals with available beds</span>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-2">
            {nearbyDoctors.map((doctor, index) => (
                <div
                    key={doctor.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${index === 0
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                >
                    <span className="font-semibold">{doctor.name || 'Hospital'}, {doctor.city || 'Unknown'}</span>
                    <span className="w-px h-3 bg-slate-300"></span>
                    <span className="flex items-center gap-0.5 text-slate-500">
                        <span className="material-symbols-outlined text-[10px]">distance</span>
                        {doctor.distance}km
                    </span>
                    <span className="w-px h-3 bg-slate-300"></span>
                    <span className={`font-bold ${doctor.availableBeds > 5 ? 'text-emerald-600' :
                            doctor.availableBeds > 2 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                        {doctor.availableBeds} beds
                    </span>
                    {index === 0 && (
                        <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[8px] font-bold rounded-md ml-1">
                            NEAREST
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}
