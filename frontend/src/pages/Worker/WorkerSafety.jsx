import React, { useEffect, useState } from 'react';
import useAxios from '../../hooks/useAxios';

const Shield = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.959 11.959 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const AlertTriangle = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

const WorkerSafety = () => {
    const axiosClient = useAxios();
    const [hazards, setHazards] = useState([]);
    const [safetyNotices, setSafetyNotices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSafetyData = async () => {
            try {
                const { data } = await axiosClient.get("/worker/safety");
                if (data.success) {
                    setHazards(data.hazards || []);
                    setSafetyNotices(data.safetyNotices || []);
                }
            } catch (error) {
                console.error("Error fetching worker safety data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSafetyData();
    }, [axiosClient]);

    if(isLoading) return <div className="p-8 text-center text-gray-500 font-bold animate-pulse">Loading Safety Diagnostics...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 border-b pb-4 mb-6">Site Safety Protocols</h1>

            {/* Active Safety Notices Panel */}
            <div className="bg-white rounded-xl border border-blue-200 overflow-hidden shadow-sm">
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-bold text-blue-900">Active Safety Notices</h2>
                </div>
                <div className="p-6">
                    {safetyNotices.length === 0 ? (
                        <p className="text-gray-500 italic text-sm">There are no active safety notices pertaining to your assigned sites at this moment.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {safetyNotices.map((notice) => (
                                <div key={notice._id} className="p-4 border border-blue-100 rounded-lg bg-white relative">
                                    <h3 className="font-semibold text-gray-900">{notice.reason}</h3>
                                    <div className="text-sm text-gray-500 mt-2 space-y-1">
                                        <p><span className="font-medium">Project:</span> {notice.projectId?.name}</p>
                                        <p><span className="font-medium">Location:</span> {notice.location || 'Site-wide'}</p>
                                        <p><span className="font-medium">Issued By:</span> {notice.issuedBy?.name}</p>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">Active</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Open Hazards Panel */}
            <div className="bg-white rounded-xl border border-orange-200 overflow-hidden shadow-sm">
                <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <h2 className="text-lg font-bold text-orange-900">Active Hazards & Controls</h2>
                </div>
                <div className="p-6">
                    {hazards.length === 0 ? (
                        <p className="text-gray-500 italic text-sm">There are no open hazard reports impacting your assigned zones currently.</p>
                    ) : (
                        <div className="space-y-4">
                            {hazards.map((hazard) => (
                                <div key={hazard._id} className="p-5 border border-orange-100 rounded-lg bg-orange-50/30 flex flex-col md:flex-row gap-4 justify-between items-start">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-gray-900 text-lg">{hazard.title}</h3>
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${hazard.status === 'Controlled' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-800'}`}>
                                                {hazard.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 text-sm max-w-2xl">{hazard.description}</p>
                                        
                                        <div className="mt-4 pt-4 border-t border-orange-200/50">
                                            <p className="text-sm font-semibold text-orange-900 mb-1">Required Safety Controls:</p>
                                            <p className="text-sm text-gray-800 bg-white p-3 rounded-md border border-orange-100">{hazard.controlActions}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default WorkerSafety;
