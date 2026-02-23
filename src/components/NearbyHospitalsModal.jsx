import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext_simple';

/**
 * Nearby Hospitals Modal
 * Shows available ICU beds in other hospitals sorted by distance
 */
export default function NearbyHospitalsModal({ isOpen, onClose, patientRequirements = {} }) {
    const [loading, setLoading] = useState(false);
    const [nearbyDoctors, setNearbyDoctors] = useState([]);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    // Haversine formula to calculate distance between two coordinates in kilometers
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371; // Earth's radius in kilometers
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
        if (isOpen) {
            fetchNearbyHospitals();
        }
    }, [isOpen]);

    const fetchNearbyHospitals = async () => {
        if (!user?.id) return;

        setLoading(true);
        setError(null);

        try {
            // 1. Get current doctor's coordinates
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

            // 2. Get all other doctors with coordinates
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

            // 3. Get available ICU beds for these doctors
            const doctorIds = otherDoctors.map(d => d.id);

            let bedQuery = supabase
                .from('icu_beds')
                .select('doctor_id, bed_id, ventilator_available, dialysis_available')
                .eq('is_available', true)
                .in('doctor_id', doctorIds);

            // Filter by patient requirements if specified
            if (patientRequirements.needsVentilator) {
                bedQuery = bedQuery.eq('ventilator_available', true);
            }
            if (patientRequirements.needsDialysis) {
                bedQuery = bedQuery.eq('dialysis_available', true);
            }

            const { data: availableBeds, error: bedsError } = await bedQuery;

            if (bedsError) throw bedsError;

            // 4. Count beds per doctor and calculate distances
            const bedCounts = {};
            availableBeds?.forEach(bed => {
                bedCounts[bed.doctor_id] = (bedCounts[bed.doctor_id] || 0) + 1;
            });

            // 5. Calculate distances and sort
            const doctorsWithDistance = otherDoctors
                .filter(doctor => bedCounts[doctor.id] > 0) // Only doctors with available beds
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
                    // Sort by distance first, then by available beds (descending)
                    if (Math.abs(a.distance - b.distance) < 0.5) {
                        return b.availableBeds - a.availableBeds;
                    }
                    return a.distance - b.distance;
                });

            setNearbyDoctors(doctorsWithDistance);
        } catch (err) {
            console.error('Error fetching nearby hospitals:', err);
            setError('Failed to load nearby hospitals. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-white text-2xl">location_on</span>
                        <div>
                            <h3 className="text-lg font-bold text-white">Nearby Hospitals</h3>
                            <p className="text-blue-100 text-sm">Hospitals with available ICU beds</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                            <p className="mt-4 text-slate-600">Finding nearby hospitals...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                            <span className="material-symbols-outlined text-red-500">error</span>
                            <p className="text-red-700">{error}</p>
                        </div>
                    ) : nearbyDoctors.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="material-symbols-outlined text-6xl text-slate-300">location_off</span>
                            <h4 className="mt-4 text-lg font-semibold text-slate-700">No Nearby Hospitals Found</h4>
                            <p className="mt-2 text-slate-500">
                                No other hospitals with available ICU beds were found in your area.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500 mb-4">
                                Showing {nearbyDoctors.length} hospital{nearbyDoctors.length !== 1 ? 's' : ''} sorted by distance and available beds.
                            </p>

                            {nearbyDoctors.map((doctor, index) => (
                                <div
                                    key={doctor.id}
                                    className={`border rounded-xl p-4 transition-all hover:shadow-md ${index === 0
                                            ? 'border-green-300 bg-green-50/50'
                                            : 'border-slate-200 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {index === 0 && (
                                                    <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                                                        Nearest
                                                    </span>
                                                )}
                                                <h4 className="font-semibold text-slate-800">
                                                    {doctor.name || 'Hospital'} in {doctor.city || 'Unknown City'}
                                                </h4>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-slate-600 mt-2">
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-blue-500 text-sm">distance</span>
                                                    {doctor.distance} km
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-green-500 text-sm">bed</span>
                                                    {doctor.availableBeds} bed{doctor.availableBeds !== 1 ? 's' : ''} available
                                                </span>
                                            </div>

                                            {(doctor.street || doctor.state) && (
                                                <p className="text-xs text-slate-500 mt-2">
                                                    {doctor.street}{doctor.street && doctor.state && ', '}{doctor.state}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${doctor.availableBeds > 5
                                                    ? 'bg-green-100 text-green-600'
                                                    : doctor.availableBeds > 2
                                                        ? 'bg-amber-100 text-amber-600'
                                                        : 'bg-red-100 text-red-600'
                                                }`}>
                                                <span className="material-symbols-outlined text-xl">
                                                    {doctor.availableBeds > 5 ? 'check_circle' : doctor.availableBeds > 2 ? 'info' : 'warning'}
                                                </span>
                                            </div>
                                            <span className={`text-xs font-semibold ${doctor.availableBeds > 5
                                                    ? 'text-green-600'
                                                    : doctor.availableBeds > 2
                                                        ? 'text-amber-600'
                                                        : 'text-red-600'
                                                }`}>
                                                {doctor.availableBeds > 5 ? 'High' : doctor.availableBeds > 2 ? 'Moderate' : 'Low'} Availability
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
