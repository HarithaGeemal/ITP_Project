import React, { useState } from 'react';
import { usePMContext } from '../../context/PMContext';

const SafetyNotices = () => {
    const { safetyObservations, stopHoldNotices, projects, tasks, holdTask, updateNoticeSeverity } = usePMContext();
    const [filterProject, setFilterProject] = useState('All');
    const [activeTab, setActiveTab] = useState('observations');

    // Hold Task State
    const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
    const [holdObservation, setHoldObservation] = useState(null);
    const [holdFormData, setHoldFormData] = useState({ taskId: '', reason: '' });

    const openHoldModal = (obs) => {
        setHoldObservation(obs);
        setHoldFormData({ taskId: '', reason: '' });
        setIsHoldModalOpen(true);
    };

    const handleHoldSubmit = async (e) => {
        e.preventDefault();
        if (!holdFormData.taskId) return alert('Please select a task.');
        
        const payload = {
            projectId: holdObservation.projectId,
            taskId: holdFormData.taskId,
            reason: holdFormData.reason || `Task put on hold due to ${holdObservation.severity} safety observation: ${holdObservation.type}`,
            observationId: holdObservation.id
        };
        const res = await holdTask(payload);
        if (res?.success) {
            setIsHoldModalOpen(false);
            setHoldObservation(null);
            // Switch to notices tab to see the new hold
            setActiveTab('notices');
        }
    };

    const getProjectName = (id) => projects.find(p => p.id === id)?.name || id;

    // Stats
    const safetyStats = {
        total: safetyObservations.length,
        critical: safetyObservations.filter(o => o.severity === 'Critical').length,
        high: safetyObservations.filter(o => o.severity === 'High').length,
        open: safetyObservations.filter(o => o.status === 'Open').length,
    };

    const noticeStats = {
        total: stopHoldNotices.length,
        active: stopHoldNotices.filter(n => n.status === 'Active').length,
        lifted: stopHoldNotices.filter(n => n.status === 'Lifted').length,
    };

    const filteredObservations = safetyObservations
        .filter(o => filterProject === 'All' || o.projectId === filterProject);

    const filteredNotices = stopHoldNotices
        .filter(n => filterProject === 'All' || n.projectId === filterProject);

    const typeColors = {
        'Unsafe Condition': 'bg-red-100 text-red-800 border-red-200',
        'Unsafe Act': 'bg-orange-100 text-orange-800 border-orange-200',
        Environmental: 'bg-blue-100 text-blue-800 border-blue-200',
        Hazard: 'bg-red-100 text-red-800 border-red-200',
        'Near Miss': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'Best Practice': 'bg-green-100 text-green-800 border-green-200',
        Other: 'bg-gray-100 text-gray-600 border-gray-200',
    };

    const severityDot = {
        Critical: 'bg-purple-600',
        High: 'bg-red-500',
        Medium: 'bg-yellow-500',
        Low: 'bg-green-500',
    };

    return (
        <div className="p-6 bg-concrete-light min-h-full space-y-8">
            {/* Header — read only */}
            <div>
                <h1 className="text-2xl font-bold text-steel-blue">Safety & Notices</h1>
                <p className="text-sm text-concrete mt-1">
                    {safetyStats.total} observations, {noticeStats.active} active notices
                </p>
                <p className="text-xs text-gray-400 italic mt-0.5">
                    Safety observations and notices are managed by the Safety Officer. This is a read-only view.
                </p>
            </div>

            {/* Combined Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                    { label: 'Observations', value: safetyStats.total, color: 'border-steel-blue text-steel-blue' },
                    { label: 'Critical', value: safetyStats.critical, color: 'border-purple-500 text-purple-600' },
                    { label: 'High Sev.', value: safetyStats.high, color: 'border-red-400 text-red-600' },
                    { label: 'Open', value: safetyStats.open, color: 'border-orange-400 text-orange-600' },
                    { label: 'Notices', value: noticeStats.total, color: 'border-gray-400 text-gray-600' },
                    { label: 'Active', value: noticeStats.active, color: 'border-red-500 text-red-600' },
                    { label: 'Lifted', value: noticeStats.lifted, color: 'border-green-400 text-green-600' },
                ].map(s => (
                    <div key={s.label} className={`bg-white rounded-lg p-3 border-l-4 ${s.color} shadow-sm`}>
                        <p className="text-xs text-concrete uppercase font-medium">{s.label}</p>
                        <p className={`text-xl font-bold ${s.color.split(' ')[1]}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs + Project Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('observations')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'observations' ? 'bg-steel-blue text-white shadow' : 'bg-white text-concrete border border-concrete-light hover:border-steel-blue'}`}>
                        🔍 Observations ({safetyStats.total})
                    </button>
                    <button onClick={() => setActiveTab('notices')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'notices' ? 'bg-red-600 text-white shadow' : 'bg-white text-concrete border border-concrete-light hover:border-red-500'}`}>
                        ⚠️ Stop/Hold Notices ({noticeStats.total})
                    </button>
                </div>
                <div className="flex gap-2 flex-wrap ml-auto">
                    <button onClick={() => setFilterProject('All')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${filterProject === 'All' ? 'bg-steel-blue text-white border-steel-blue' : 'bg-white text-concrete border-concrete-light hover:border-steel-blue'}`}>
                        All Projects
                    </button>
                    {projects.map(p => (
                        <button key={p.id} onClick={() => setFilterProject(p.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition truncate max-w-[150px] ${filterProject === p.id ? 'bg-steel-blue text-white border-steel-blue' : 'bg-white text-concrete border-concrete-light hover:border-steel-blue'}`}>
                            {p.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* ===== Observations Tab ===== */}
            {activeTab === 'observations' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredObservations.map(obs => (
                        <div key={obs.id} className="bg-white rounded-xl shadow-sm border border-concrete-light p-5 flex flex-col hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${severityDot[obs.severity] || 'bg-gray-400'}`} title={`${obs.severity} severity`} />
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${typeColors[obs.type] || typeColors.Other}`}>{obs.type}</span>
                                </div>
                                <span className="text-xs text-concrete font-medium">{obs.date}</span>
                            </div>

                            <p className="text-xs text-blue-600 font-medium mb-1">{obs.projectName || getProjectName(obs.projectId)}</p>
                            {obs.location && <p className="text-xs text-gray-500 mb-2">📍 {obs.location}</p>}
                            <p className="text-sm text-gray-800 flex-1 mb-3">{obs.description || obs.title}</p>

                            {obs.actionTaken && obs.actionTaken !== obs.description && (
                                <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 mb-3 border border-gray-100">
                                    <span className="font-semibold text-gray-700">Notes: </span>{obs.actionTaken}
                                </div>
                            )}

                            <div className="flex justify-between items-center text-sm pt-2 border-t border-concrete-light">
                                <span className="text-gray-500 text-xs">Observer: <span className="font-medium text-gray-700">{obs.observer}</span></span>
                                <span className={`text-xs font-semibold ${obs.status === 'Resolved' || obs.status === 'Closed' ? 'text-green-600' : 'text-orange-500'}`}>{obs.status}</span>
                            </div>

                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-concrete">
                                    Severity: <span className={`font-bold ${obs.severity === 'Critical' ? 'text-purple-600' : obs.severity === 'High' ? 'text-red-600' : obs.severity === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>{obs.severity}</span>
                                </span>
                                {(obs.severity === 'High' || obs.severity === 'Critical') && obs.status !== 'Resolved' && obs.status !== 'Closed' && (
                                    <button onClick={() => openHoldModal(obs)} className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition">
                                        Hold Task
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredObservations.length === 0 && (
                        <div className="col-span-3 text-center py-12 text-concrete">
                            <p className="text-lg font-medium">No safety observations recorded.</p>
                            <p className="text-sm mt-1">Safety observations are submitted by the Safety Officer.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ===== Stop/Hold Notices Tab ===== */}
            {activeTab === 'notices' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNotices.map(notice => (
                        <div key={notice.id} className={`bg-white rounded-xl shadow-sm border border-concrete-light border-l-4 ${notice.status === 'Active' ? 'border-l-red-500' : 'border-l-green-500'} p-5 flex flex-col hover:shadow-md transition-shadow`}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-base">{notice.affectedArea || notice.location || 'Project Area'}</h3>
                                </div>
                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full shrink-0 ${notice.status === 'Active' ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-green-100 text-green-800'}`}>{notice.status}</span>
                            </div>

                            <p className="text-xs text-blue-600 font-medium mb-3">{getProjectName(notice.projectId)}</p>

                            <div className="text-sm text-gray-700 mb-3 bg-red-50 p-3 rounded-lg border border-red-100">
                                <strong className="text-red-800">Reason: </strong>{notice.reason}
                            </div>

                            {/* Severity Control — PM can change this */}
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-xs font-semibold text-gray-600">Severity:</span>
                                {notice.status === 'Active' ? (
                                    <select
                                        value={notice.severity || 'High'}
                                        onChange={(e) => updateNoticeSeverity(notice.id, e.target.value)}
                                        className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border cursor-pointer focus:ring-2 focus:outline-none ${
                                            (notice.severity || 'High') === 'Critical' ? 'bg-purple-100 text-purple-800 border-purple-300 focus:ring-purple-300' :
                                            (notice.severity || 'High') === 'High' ? 'bg-red-100 text-red-800 border-red-300 focus:ring-red-300' :
                                            (notice.severity || 'High') === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-300 focus:ring-yellow-300' :
                                            'bg-green-100 text-green-800 border-green-300 focus:ring-green-300'
                                        }`}
                                    >
                                        <option value="Critical">Critical</option>
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                ) : (
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                                        (notice.severity || 'High') === 'Critical' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                                        (notice.severity || 'High') === 'High' ? 'bg-red-100 text-red-800 border-red-300' :
                                        (notice.severity || 'High') === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                        'bg-green-100 text-green-800 border-green-300'
                                    }`}>{notice.severity || 'High'}</span>
                                )}
                            </div>

                            {notice.resolution && (
                                <div className="text-xs text-gray-600 mb-3 bg-green-50 p-3 rounded-lg border border-green-100">
                                    <strong className="text-green-800">Resolution: </strong>{notice.resolution}
                                </div>
                            )}

                            <div className="text-xs text-gray-500 space-y-1 mt-auto pt-3 border-t border-concrete-light">
                                <p>Issued by <span className="font-medium text-gray-700">{notice.issuedBy}</span> on {notice.dateIssued || notice.createdAt?.split('T')[0]}</p>
                                {notice.dateLifted && <p>Lifted on <span className="font-medium text-green-700">{notice.dateLifted}</span></p>}
                            </div>
                        </div>
                    ))}
                    {filteredNotices.length === 0 && (
                        <div className="col-span-3 text-center py-12 text-concrete">
                            <p className="text-lg font-medium">No stop/hold notices issued.</p>
                            <p className="text-sm mt-1">Notices are managed by the Safety Officer.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Hold Task Modal */}
            {isHoldModalOpen && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-red-50">
                            <h3 className="text-lg font-semibold text-red-800">Issue Stop/Hold Notice</h3>
                            <button onClick={() => setIsHoldModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleHoldSubmit} className="p-6 space-y-4">
                            <p className="text-sm text-gray-600 mb-2">You are blocking a task due to a {holdObservation?.severity} severity observation in {getProjectName(holdObservation?.projectId)}.</p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Task to Hold *</label>
                                <select 
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    value={holdFormData.taskId} 
                                    onChange={(e) => setHoldFormData({ ...holdFormData, taskId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Select a Task --</option>
                                    {tasks.filter(t => t.projectId === holdObservation?.projectId && t.status !== 'Completed' && t.status !== 'On Hold' && t.status !== 'Cancelled').map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Hold</label>
                                <textarea 
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    rows="3"
                                    placeholder="Explanation for holding this task..."
                                    value={holdFormData.reason}
                                    onChange={(e) => setHoldFormData({ ...holdFormData, reason: e.target.value })}
                                />
                            </div>
                        </form>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
                            <button type="button" onClick={() => setIsHoldModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium text-sm">Cancel</button>
                            <button type="button" onClick={handleHoldSubmit} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium text-sm shadow">Confirm Hold</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SafetyNotices;
