import React, { useState, useEffect, useCallback } from 'react';
import { usePMContext } from '../../context/PMContext';
import useAxios from '../../hooks/useAxios';

const ToolsEquipment = () => {
    const { projects, tasks } = usePMContext();
    const axiosClient = useAxios();

    const [selectedProject, setSelectedProject] = useState('');
    const [storeReports, setStoreReports] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchProjectData = useCallback(async (projectId) => {
        if (!projectId) {
            setStoreReports([]);
            return;
        }
        setLoading(true);
        try {
            const { data } = await axiosClient.get(`/projects/${projectId}/store-reports`);
            if (data.success) {
                setStoreReports(data.reports);
            }
        } catch (error) {
            console.error("Error fetching project store reports:", error);
        } finally {
            setLoading(false);
        }
    }, [axiosClient]);

    useEffect(() => {
        if (projects.length > 0 && !selectedProject) {
            setSelectedProject(projects[0].id);
        }
    }, [projects, selectedProject]);

    useEffect(() => {
        if (selectedProject) fetchProjectData(selectedProject);
    }, [selectedProject, fetchProjectData]);



    return (
        <div className="p-6 bg-concrete-light min-h-full">
            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-steel-blue">Tools & Equipment Management</h1>
                    <p className="text-sm text-concrete mt-1">Manage project inventory, checkouts, and returns.</p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Project:</label>
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-steel-blue"
                    >
                        <option value="" disabled>Select a Project</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-steel-blue"></div></div>
            ) : !selectedProject ? (
                <div className="bg-white rounded-xl shadow-sm border border-concrete-light p-12 text-center text-gray-500">
                    Please select a project to view tools and checkouts.
                </div>
            ) : (
                <div className="space-y-8">

                    {/* STORE REPORTS SECTION */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Store Keeper Reports</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {storeReports.map(r => {
                                const itemName = r.type === 'Material' ? (r.materialItemId?.name || 'Unknown Material') : (r.mainStorageToolId?.name || 'Unknown Tool');
                                const isReturned = r.status === 'Returned';
                                return (
                                    <div key={r._id} className="bg-white rounded-xl shadow-sm border border-concrete-light p-5 flex flex-col hover:shadow-md transition-shadow">
                                        {/* Header */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex flex-col">
                                                <span className={`w-max px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded-full mb-2 ${r.type === 'Material' ? 'bg-orange-100 text-orange-800' : 'bg-steel-blue/10 text-steel-blue'}`}>
                                                    {r.type === 'Material' ? '🧱 Material' : '🔧 Tool'}
                                                </span>
                                                <h3 className="font-bold text-gray-800 text-sm pr-2 leading-tight">{itemName}</h3>
                                            </div>
                                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full shrink-0 border ${isReturned ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                                {r.status}
                                            </span>
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-2.5 mt-2 mb-4">
                                            <div className="flex justify-between text-xs text-gray-600 border-b border-gray-50 pb-1">
                                                <span className="font-medium text-concrete">Task</span>
                                                <span className="font-semibold text-right max-w-[60%] truncate" title={r.taskId?.name || '-'}>{r.taskId?.name || '-'}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-600 border-b border-gray-50 pb-1">
                                                <span className="font-medium text-concrete">Issued To</span>
                                                <span className="font-semibold">{r.requestedBy?.name || 'Unknown User'}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-600 pb-1">
                                                <span className="font-medium text-concrete">Quantity</span>
                                                <span className="font-bold text-gray-800">{r.issuedQuantity}</span>
                                            </div>
                                        </div>

                                        {/* Footer / Dates */}
                                        <div className="flex justify-between pt-3 mt-auto border-t border-concrete-light text-xs">
                                            <div className="flex flex-col">
                                                <span className="text-concrete mb-0.5">Issued Date</span>
                                                <span className="font-bold text-gray-700">{new Date(r.issuedDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex flex-col text-right">
                                                <span className="text-concrete mb-0.5">Return Date</span>
                                                <span className={`font-bold ${r.returnDate ? 'text-gray-700' : 'text-gray-400'}`}>
                                                    {r.returnDate ? new Date(r.returnDate).toLocaleDateString() : '—'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {storeReports.length === 0 && (
                                <div className="col-span-full text-center py-12 text-concrete bg-white rounded-xl border border-dashed border-concrete-light">
                                    <p className="text-sm font-medium">No store reports available for this project.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ToolsEquipment;
