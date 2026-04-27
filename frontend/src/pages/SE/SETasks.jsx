import React, { useState, useEffect } from 'react';
import { useSEContext } from '../../context/SEContext';

const priorityColors = {
    Critical: 'bg-red-100 text-red-800 border-red-300',
    High: 'bg-orange-100 text-orange-800 border-orange-300',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Low: 'bg-green-100 text-green-800 border-green-300',
};

const statusColors = {
    'In Progress': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
    'Blocked': 'bg-red-100 text-red-800',
    'Not Started': 'bg-gray-100 text-gray-700',
    'Under Review': 'bg-purple-100 text-purple-800',
};

const SETasks = () => {
    const { assignedTasks, createSubtask, updateSubtask, deleteSubtask, requestMainTaskCompletion, createPTW } = useSEContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [activeParentTask, setActiveParentTask] = useState(null);

    const [isPtwModalOpen, setIsPtwModalOpen] = useState(false);
    const [activeSubtask, setActiveSubtask] = useState(null);
    const [ptwFormData, setPtwFormData] = useState({
        permitType: 'Hot Work', validUntil: '', notes: ''
    });

    const [formData, setFormData] = useState({
        name: '', description: '', assignedWorkers: [],
        startDate: '', endDate: '', status: 'Not Started', priority: 'Medium'
    });

    // Toast notification state
    const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 6000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Grouping
    const mainTasks = assignedTasks.filter(t => !t.parentTaskId);
    const getSubtasks = (parentId) => assignedTasks.filter(t => (t.parentTaskId?._id || t.parentTaskId) === parentId);

    const openSubtaskModal = (parent, subtask = null) => {
        setActiveParentTask(parent);
        if (subtask) {
            setIsEditMode(true);
            setActiveSubtask(subtask);
            setFormData({
                name: subtask.name, 
                description: subtask.description, 
                assignedWorkers: subtask.assignedWorkers?.map(w => typeof w === 'object' ? w._id : w) || [],
                startDate: subtask.startDate ? new Date(subtask.startDate).toISOString().split('T')[0] : '', 
                endDate: subtask.endDate ? new Date(subtask.endDate).toISOString().split('T')[0] : '', 
                status: subtask.status || 'Not Started', priority: subtask.priority || 'Medium'
            });
        } else {
            setIsEditMode(false);
            setActiveSubtask(null);
            setFormData({
                name: '', description: '', assignedWorkers: [],
                startDate: parent.startDate ? new Date(parent.startDate).toISOString().split('T')[0] : '', 
                endDate: parent.endDate ? new Date(parent.endDate).toISOString().split('T')[0] : '', 
                status: 'Not Started', priority: 'Medium'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setActiveParentTask(null);
        setActiveSubtask(null);
        setIsEditMode(false);
    };

    const openPtwModal = (subtask) => {
        setActiveSubtask(subtask);
        setPtwFormData({ permitType: 'Hot Work', validUntil: '', notes: '' });
        setIsPtwModalOpen(true);
    };

    const closePtwModal = () => {
        setIsPtwModalOpen(false);
        setActiveSubtask(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePtwChange = (e) => {
        const { name, value } = e.target;
        setPtwFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (e) => {
        const value = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, assignedWorkers: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await updateSubtask(activeParentTask.projectId, activeParentTask.id, activeSubtask.id, formData);
                alert("Subtask successfully updated.");
            } else {
                await createSubtask(activeParentTask.projectId, activeParentTask.id, formData);
                alert("Subtask successfully delegated.");
            }
            closeModal();
        } catch (error) {
            // Error is handled in context
            console.error(isEditMode ? "Update failed" : "Delegation failed");
        }
    };

    const handleDeleteSubtask = async (projectId, parentTaskId, subtaskId) => {
        if (window.confirm("Are you sure you want to delete this subtask?")) {
            try {
                await deleteSubtask(projectId, parentTaskId, subtaskId);
                alert("Subtask deleted successfully.");
            } catch (err) {
                console.error("Deletion failed");
            }
        }
    };

    const handlePtwSubmit = async (e) => {
        e.preventDefault();
        try {
            await createPTW(activeSubtask.projectId, { ...ptwFormData, taskId: activeSubtask.id });
            closePtwModal();
            alert("Permit to Work requested successfully.");
        } catch (error) {
            console.error(error);
        }
    };

    const handleCompleteMain = async (task) => {
        if (window.confirm("Are you sure you want to mark this task as completed?")) {
            try {
                await requestMainTaskCompletion(task.projectId, task.id);
                setToast({ type: 'success', message: 'Task marked as completed successfully!' });
            } catch (err) {
                const msg = err?.response?.data?.message || err?.message || "Failed to mark task as completed.";
                setToast({ type: 'error', message: msg });
            }
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto relative">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 max-w-md animate-slide-in-right`}>
                    <div className={`rounded-xl shadow-2xl border p-4 flex items-start gap-3 ${
                        toast.type === 'success' 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                    }`}>
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                            toast.type === 'success' 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-red-100 text-red-600'
                        }`}>
                            {toast.type === 'success' ? '✓' : '🛑'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold ${
                                toast.type === 'success' ? 'text-green-800' : 'text-red-800'
                            }`}>
                                {toast.type === 'success' ? 'Success' : 'Action Blocked'}
                            </p>
                            <p className={`text-sm mt-1 ${
                                toast.type === 'success' ? 'text-green-700' : 'text-red-700'
                            }`}>
                                {toast.message}
                            </p>
                        </div>
                        <button 
                            onClick={() => setToast(null)} 
                            className={`flex-shrink-0 text-lg font-bold leading-none hover:opacity-70 ${
                                toast.type === 'success' ? 'text-green-400' : 'text-red-400'
                            }`}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Assigned Tasks</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your delegated Main Tasks and branch out Subtasks to your workers.</p>
                </div>
            </div>

            <div className="space-y-6">
                {mainTasks.map(mainTask => {
                    const subtasks = getSubtasks(mainTask.id);
                    return (
                        <div key={mainTask.id} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                            {/* Main Task Header */}
                            <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-gray-800">{mainTask.name}</h3>
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[mainTask.status] || 'bg-gray-100 text-gray-700'}`}>{mainTask.status}</span>
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded border ${priorityColors[mainTask.priority] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>{mainTask.priority}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{mainTask.description}</p>
                                    
                                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                                        <div><span className="font-semibold text-gray-700">Project:</span> {mainTask.projectName}</div>
                                        <div><span className="font-semibold text-gray-700">Timeline:</span> {new Date(mainTask.startDate).toLocaleDateString()} → {new Date(mainTask.endDate).toLocaleDateString()}</div>
                                        <div><span className="font-semibold text-gray-700">Your Base Workers:</span> {mainTask.assignedWorkers?.map(w => w.name).join(', ') || 'None Assigned'}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {!mainTask.completionRequested && mainTask.status !== "Completed" && (() => {
                                        const allSubtasksCompleted = subtasks.length === 0 || subtasks.every(s => s.status === 'Completed');
                                        const anySubtaskPendingPTW = subtasks.some(s => s.ptw && s.ptw.status !== 'Approved');
                                        const canComplete = allSubtasksCompleted && !anySubtaskPendingPTW;
                                        const tooltipMsg = !allSubtasksCompleted 
                                            ? "All subtasks must be completed first." 
                                            : anySubtaskPendingPTW ? "Some subtasks have pending PTWs." : "";
                                        
                                        return (
                                            <button 
                                                title={tooltipMsg}
                                                disabled={!canComplete}
                                                onClick={() => handleCompleteMain(mainTask)} 
                                                className={`px-3 py-1.5 rounded text-sm font-medium shadow-sm transition-colors ${
                                                    canComplete ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                }`}
                                            >
                                                Mark as Completed
                                            </button>
                                        );
                                    })()}
                                    {mainTask.completionRequested && mainTask.status !== "Completed" && (
                                        <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded text-sm font-medium border border-yellow-200">
                                            Awaiting PM Approval
                                        </span>
                                    )}
                                    {mainTask.status !== "Completed" && !mainTask.completionRequested && (
                                        <button onClick={() => openSubtaskModal(mainTask)} className="bg-steel-blue text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-steel-blue/90 shadow-sm">
                                            + Delegate Subtask
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Subtasks Section */}
                            {subtasks.length > 0 ? (
                                <div className="p-4 bg-white">
                                    {/* Overall Subtask Progress */}
                                    {(() => {
                                        const completed = subtasks.filter(s => s.status === 'Completed').length;
                                        const total = subtasks.length;
                                        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                                        return (
                                            <div className="mb-4 px-2">
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Subtasks Pipeline</h4>
                                                    <span className="text-xs font-bold text-gray-600">{completed}/{total} completed ({pct}%)</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className={`h-2 rounded-full transition-all duration-500 ${pct === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                        {subtasks.map(sub => (
                                            <div key={sub.id} className="border border-gray-200 rounded p-3 bg-gray-50 hover:bg-white transition-colors group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h5 className="font-semibold text-gray-800 text-sm">{sub.name}</h5>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${statusColors[sub.status] || 'bg-gray-100 text-gray-700'}`}>{sub.status}</span>
                                                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => openSubtaskModal(mainTask, sub)} className="text-blue-500 hover:text-blue-700 p-1" title="Edit">
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                            </button>
                                                            <button onClick={() => handleDeleteSubtask(mainTask.projectId, mainTask.id, sub.id)} className="text-red-500 hover:text-red-700 p-1" title="Delete">
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200">
                                                    <span className="truncate max-w-[200px]">Workers: {sub.assignedWorkers?.map(w => w.name).join(', ') || 'Unassigned'}</span>
                                                    <div className="flex gap-2 items-center">
                                                        {sub.completionRequested && !sub.completionApprovedAt && (
                                                            <span className="text-orange-600 font-medium whitespace-nowrap">Needs Your Approval</span>
                                                        )}
                                                        {sub.ptw ? (
                                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded border whitespace-nowrap ${
                                                                sub.ptw.status === 'Approved' ? 'bg-green-100 text-green-800 border-green-300' :
                                                                sub.ptw.status === 'Denied' ? 'bg-red-100 text-red-800 border-red-300' :
                                                                sub.ptw.status === 'Revoked' ? 'bg-gray-800 text-gray-100 border-gray-900' :
                                                                'bg-yellow-100 text-yellow-800 border-yellow-300'
                                                            }`}>
                                                                PTW: {sub.ptw.status}
                                                            </span>
                                                        ) : (
                                                            <button onClick={() => openPtwModal(sub)} className="text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded transition-colors text-xs whitespace-nowrap shadow-sm">
                                                                + Request PTW
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-white text-sm text-gray-400 italic ml-2">No subtasks delegated yet.</div>
                            )}
                        </div>
                    );
                })}

                {mainTasks.length === 0 && (
                    <div className="text-center py-16 text-gray-500 bg-white rounded-xl shadow border border-gray-200">
                        <p className="text-lg font-medium">No main tasks have been assigned to you yet.</p>
                    </div>
                )}
            </div>

            {/* Subtask Modal */}
            {isModalOpen && activeParentTask && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">{isEditMode ? 'Edit Subtask' : 'Delegate Subtask'}</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="bg-blue-50 text-blue-800 p-3 rounded text-sm mb-2 border border-blue-100">
                                <span className="font-semibold">Parent Task:</span> {activeParentTask.name}
                            </div>
                            
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Subtask Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                            </div>
                            
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="2" required className="w-full border border-gray-300 rounded px-3 py-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Workers (Hold Ctrl/Cmd to select multiple)</label>
                                <select 
                                    name="assignedWorkers" multiple value={formData.assignedWorkers} onChange={handleMultiSelectChange} 
                                    className="w-full border border-gray-300 rounded px-3 py-2 h-24"
                                    required
                                >
                                    {activeParentTask.assignedWorkers?.map(w => (
                                        <option key={w._id} value={w._id}>{w.name} — {w.trade}</option>
                                    ))}
                                    {(!activeParentTask.assignedWorkers || activeParentTask.assignedWorkers.length === 0) && (
                                        <option value="" disabled>No workers available on the parent task</option>
                                    )}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">You can only assign workers that have been natively allocated to the parent task.</p>
                            </div>
                            
                        </form>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
                            <button type="button" onClick={closeModal} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
                            <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-steel-blue text-white rounded hover:bg-steel-blue/90 font-medium">{isEditMode ? 'Save Changes' : 'Deploy Subtask'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Request PTW Modal */}
            {isPtwModalOpen && activeSubtask && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">Request Permit to Work</h3>
                            <button onClick={closePtwModal} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handlePtwSubmit} className="p-6 space-y-4">
                            <div className="bg-blue-50 text-blue-800 p-3 rounded text-sm mb-2 border border-blue-100">
                                <span className="font-semibold">For Subtask:</span> {activeSubtask.name}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Permit Type</label>
                                <select 
                                    name="permitType" value={ptwFormData.permitType} onChange={handlePtwChange} 
                                    className="w-full border border-gray-300 rounded px-3 py-2" required
                                >
                                    <option value="Hot Work">Hot Work</option>
                                    <option value="Confined Space">Confined Space</option>
                                    <option value="Working at Heights">Working at Heights</option>
                                    <option value="Excavation">Excavation</option>
                                    <option value="General">General</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                                <input type="datetime-local" name="validUntil" value={ptwFormData.validUntil} onChange={handlePtwChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Description of Work</label>
                                <textarea name="notes" value={ptwFormData.notes} onChange={handlePtwChange} rows="3" required className="w-full border border-gray-300 rounded px-3 py-2 whitespace-pre-wrap" placeholder="Describe the safety precautions and work scope..." />
                            </div>
                        </form>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
                            <button type="button" onClick={closePtwModal} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
                            <button type="button" onClick={handlePtwSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition">Submit Request</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SETasks;
