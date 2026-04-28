import React, { useState, useEffect, useCallback } from 'react';
import { useSEContext } from '../../context/SEContext';
import useAxios from '../../hooks/useAxios';

const statusColors = {
    'Active': 'bg-red-100 text-red-800 border-red-300',
    'Lifted': 'bg-green-100 text-green-800 border-green-300',
};

const SESafetyNotices = () => {
    const { projects } = useSEContext();
    const axiosClient = useAxios();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, Active, Lifted

    const fetchAllNotices = useCallback(async () => {
        setLoading(true);
        try {
            const allNotices = [];
            for (const project of projects) {
                const pId = project._id || project.id;
                try {
                    const { data } = await axiosClient.get(`/projects/${pId}/safety-notices`);
                    if (data.success) {
                        allNotices.push(...data.notices.map(n => ({
                            ...n,
                            projectName: project.name || 'Unknown',
                        })));
                    }
                } catch (err) {
                    console.error(`Failed to fetch notices for project ${pId}`, err);
                }
            }
            // Sort by date descending
            allNotices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setNotices(allNotices);
        } finally {
            setLoading(false);
        }
    }, [projects, axiosClient]);

    useEffect(() => {
        if (projects.length > 0) fetchAllNotices();
    }, [projects, fetchAllNotices]);

    const filteredNotices = filter === 'all' ? notices : notices.filter(n => n.status === filter);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Safety Notices</h1>
                    <p className="text-sm text-gray-500 mt-1">Safety notices and hazard warnings issued by the Safety Officer across your assigned projects.</p>
                </div>
                <div className="flex gap-2">
                    {['all', 'Active', 'Lifted'].map(f => (
                        <button 
                            key={f} 
                            onClick={() => setFilter(f)} 
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${filter === f ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {f === 'all' ? 'All' : f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-500">Loading safety notices...</div>
            ) : filteredNotices.length === 0 ? (
                <div className="bg-white rounded-xl shadow border border-gray-200 p-16 text-center text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900">No Safety Notices</h3>
                    <p className="mt-1">No safety notices have been issued for your projects.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredNotices.map(notice => (
                        <div key={notice._id} className={`bg-white rounded-xl shadow border overflow-hidden ${notice.status === 'Active' ? 'border-red-200' : 'border-green-200'}`}>
                            <div className={`px-1 py-0.5 ${notice.status === 'Active' ? 'bg-red-500' : 'bg-green-500'}`} />
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${statusColors[notice.status]}`}>
                                            {notice.status === 'Active' ? '⚠️ ACTIVE' : '✅ LIFTED'}
                                        </span>
                                        <span className="text-xs text-gray-500">{notice.projectName}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">{new Date(notice.createdAt).toLocaleString()}</span>
                                </div>
                                
                                <p className="text-gray-800 font-medium mb-3">{notice.reason}</p>
                                
                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                                    {notice.location && (
                                        <div><span className="font-semibold text-gray-700">Location:</span> {notice.location}</div>
                                    )}
                                    {notice.taskId && (
                                        <div><span className="font-semibold text-gray-700">Related Task:</span> {notice.taskId?.name || 'Unknown'}</div>
                                    )}
                                    <div><span className="font-semibold text-gray-700">Issued By:</span> {notice.issuedBy?.name || 'Unknown'}</div>
                                    {notice.liftedBy && (
                                        <div><span className="font-semibold text-gray-700">Lifted By:</span> {notice.liftedBy?.name || 'Unknown'} on {new Date(notice.liftedAt).toLocaleDateString()}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SESafetyNotices;
