import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext_simple';

/**
 * Nearby Hospitals List Component
 * Shows available ICU beds in other hospitals below the waiting patients list
 */
export default function NearbyHospitalsList() {
    const [loading, setLoading] = useState(true);
    const [nearbyDoctors, setNearbyDoctors] = useState([]);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    // Haversine formula to calculate distance between two coordinates in kilometers
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    useEffect(() => {
        fetchNearbyHospitals();
    }, [user?.id]);

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
                setError('Your hospital location is not set. Please update your profile.');
                setLoading(false);
                return;
            }

            const { latitude: myLat, longitude: myLng } = currentDoctor;

            const { data: otherDoctors, error: doctorsError } = await supabase
                .from('user_profiles')
                .select('id, email, street, city, state, latitude, longitude')
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
            
            const { data: availableBeds, error: bedsError } = await supabase
                .from('icu_beds')
                .select('doctor_id')
                .eq('is_available', true)
                .in('doctor_id', doctorIds);
            
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
                });

            setNearbyDoctors(doctorsWithDistance);
        } catch (err) {
            console.error('Error fetching nearby hospitals:', err);
            setError('Failed to load nearby hospitals.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-blue-600 text-xl">location_on</span>
                    <h3 className="font-bold text-slate-800">Nearby Hospitals with ICU Beds</h3>
                </div>
                <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <span className="ml-3 text-slate-500">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600">info</span>
                    <p className="text-amber-700 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    if (nearbyDoctors.length === 0) {
        return (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-slate-400 text-xl">location_off</span>
                    <h3 className="font-semibold text-slate-700">Nearby Hospitals</h3>
                </div>
                <p className="text-sm text-slate-500">No other hospitals with available ICU beds found in your area.</p>
            </div>
        );
    }

    return (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-blue-600 text-xl">local_hospital</span>
                        <div>
                            <h3 className="font-bold text-slate-800">Nearby Hospitals with ICU Beds</h3>
                            <p className="text-xs text-slate-500">{nearbyDoctors.length} hospital{nearbyDoctors.length !== 1 ? 's' : ''} with available beds</p>
                        </div>
                    </div>
                    <button 
                        onClick={fetchNearbyHospitals}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Refresh"
                    >
                        <span className="material-symbols-outlined text-sm">refresh</span>
                    </button>
                </div>
            </div>

            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {nearbyDoctors.slice(0, 6).map((doctor, index) => (
                        <div
                            key={doctor.id}
                            className={`border rounded-lg p-3 transition-all hover:shadow-md ${
                                index === 0 
                                    ? 'border-green-300 bg-green-50/30' 
                                    : 'border-slate-200 hover:border-blue-300 bg-white'
                            }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {index === 0 && (
                                        <span className="px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded">
                                            Nearest
                                        </span>
                                    )}
                                    <span className="text-xs font-semibold text-slate-700">{doctor.city || 'Unknown'}</span>
                                </div>
                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    doctor.availableBeds > 5 
                                        ? 'bg-green-100 text-green-700' 
                                        : doctor.availableBeds > 2 
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-red-100 text-red-700'
                                }`}>
                                    {doctor.availableBeds} beds
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                                <span className="material-symbols-outlined text-blue-400 text-sm">distance</span>
                                <span>{doctor.distance} km away</span>
                            </div>
                            
                            {(doctor.street || doctor.state) && (
                                <p className="text-[10px] text-slate-400 truncate">
                                    {doctor.street}{doctor.street && doctor.state && ', '}{doctor.state}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {nearbyDoctors.length > 6 && (
                    <p className="text-center text-xs text-slate-400 mt-4">
                        + {nearbyDoctors.length - 6} more hospitals
                    </p>
                )}
            </div>
        </div>
    );
}
