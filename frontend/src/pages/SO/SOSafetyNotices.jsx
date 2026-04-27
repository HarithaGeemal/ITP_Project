import React, { useState } from 'react';
import { useSOContext } from '../../context/SOContext';

const SOSafetyNotices = () => {
    const { activeProjectId, safetyNotices, tasks, fetchSafetyNotices, createNotice, updateNotice, deleteNotice } = useSOContext();
    const [filterStatus, setFilterStatus] = useState('All');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingNoticeId, setEditingNoticeId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const emptyForm = { taskId: '', location: '', reason: '', status: 'Active' };
    const [formData, setFormData] = useState(emptyForm);

    const openCreate = () => { setFormData(emptyForm); setIsCreateOpen(true); };
    const closeCreate = () => setIsCreateOpen(false);

    const openEdit = (notice) => {
        setFormData({
            taskId: notice.taskId?._id || notice.taskId?.id || notice.taskId || '',
            location: notice.location || '',
            reason: notice.reason || '',
            status: notice.status || 'Active'
        });
        setEditingNoticeId(notice.id);
        setIsEditOpen(true);
    };
    const closeEdit = () => { setIsEditOpen(false); setEditingNoticeId(null); };

    const handleFormChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        try {
            const payload = { ...formData };
            if (!payload.taskId) delete payload.taskId;
            if (!payload.location) delete payload.location;
            delete payload.status; // Creation is always Active by default
            await createNotice(activeProjectId, payload);
            closeCreate();
        } catch (error) {
            alert('Failed to issue Safety Notice: ' + (error?.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        try {
            const payload = { ...formData };
            if (!payload.taskId) delete payload.taskId;
            if (!payload.location) delete payload.location;
            await updateNotice(activeProjectId, editingNoticeId, payload);
            closeEdit();
        } catch (error) {
            alert('Failed to update Safety Notice: ' + (error?.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleLiftNotice = async (noticeId) => {
        if (!window.confirm("Are you sure you want to lift this Safety Notice?")) return;
        try {
            await updateNotice(activeProjectId, noticeId, { status: 'Lifted' });
        } catch (error) {
            alert('Failed to lift Safety Notice: ' + (error?.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (noticeId) => {
        const deleteReason = prompt("Please enter a reason for deleting this Safety Notice:");
        if (!deleteReason) return;
        try {
            await deleteNotice(activeProjectId, noticeId, deleteReason);
        } catch (error) {
            alert('Failed to delete Safety Notice: ' + (error?.response?.data?.message || error.message));
        }
    };

    if (!activeProjectId) {
        return <div className="p-12 text-center text-gray-500 font-medium">Please select a project from the top navigation to view Safety Notices.</div>;
    }

    const filteredNotices = filterStatus === 'All' 
        ? safetyNotices 
        : safetyNotices.filter(n => n.status === filterStatus);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Safety Notices (Stop Work)</h1>
                    <p className="text-sm text-gray-500 mt-1">Issue and track formal stop-work or hazard-alert notices.</p>
                </div>
                <button onClick={openCreate} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium shadow transition">
                    + Issue Notice
                </button>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
                {['All', 'Active', 'Lifted'].map(status => (
                    <button 
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                            filterStatus === status 
                                ? 'bg-red-600 text-white border-red-600' 
                                : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredNotices.map(notice => (
                    <div key={notice.id} className={`bg-white rounded-xl shadow border p-5 transition hover:shadow-md ${notice.status === 'Active' ? 'border-red-200' : 'border-gray-200 opacity-80'}`}>
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    {notice.status === 'Active' ? '🛑' : '✅'} Safety Notice
                                </h3>
                                <p className="text-sm text-gray-500 mt-1 font-medium italic">"{notice.reason}"</p>
                            </div>
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${notice.status === 'Active' ? 'bg-red-100 text-red-800 border-red-300 animate-pulse' : 'bg-green-100 text-green-800 border-green-300'}`}>
                                {notice.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-3 rounded-lg text-sm text-gray-600 mb-4 border border-gray-100">
                            <div>
                                <span className="block font-semibold text-gray-800 mb-0.5">Location</span>
                                {notice.location || 'N/A'}
                            </div>
                            <div>
                                <span className="block font-semibold text-gray-800 mb-0.5">Linked Task</span>
                                {notice.taskId?.name || 'N/A'}
                            </div>
                            <div>
                                <span className="block font-semibold text-gray-800 mb-0.5">Issued By</span>
                                {notice.issuedBy?.name} <span className="text-xs text-gray-400 block">{new Date(notice.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span className="block font-semibold text-gray-800 mb-0.5">Lifted By</span>
                                {notice.status === 'Lifted' ? (
                                    <>{notice.liftedBy?.name} <span className="text-xs text-gray-400 block">{new Date(notice.liftedAt).toLocaleDateString()}</span></>
                                ) : (
                                    <span className="text-gray-400 italic">—</span>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                            {notice.status === 'Active' && (
                                <button onClick={() => handleLiftNotice(notice.id)} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition shadow-sm">
                                    ✓ Lift Notice
                                </button>
                            )}
                            <button onClick={() => openEdit(notice)} className="px-3 py-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded text-sm font-medium transition">
                                Edit
                            </button>
                            <button onClick={() => handleDelete(notice.id)} className="px-3 py-1.5 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded text-sm font-medium transition">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
                
                {filteredNotices.length === 0 && (
                    <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-xl">
                        <p className="text-3xl mb-3">📢</p>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">No Safety Notices</h3>
                        <p className="text-gray-500">There are no {filterStatus !== 'All' ? filterStatus.toLowerCase() : ''} safety notices on this project.</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
                        <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">🛑 Issue Safety Notice</h3>
                            <button onClick={closeCreate} className="text-red-400 hover:text-red-600 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Reason / Hazard Description <span className="text-red-500">*</span></label>
                                <textarea name="reason" value={formData.reason} onChange={handleFormChange} required rows="3" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition" placeholder="Describe the immediate danger or policy violation..."></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Location (Optional)</label>
                                    <input type="text" name="location" value={formData.location} onChange={handleFormChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition" placeholder="e.g. Scaffolding B" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Link to Task (Optional)</label>
                                    <select name="taskId" value={formData.taskId} onChange={handleFormChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition">
                                        <option value="">— None —</option>
                                        {tasks.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </form>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button type="button" onClick={closeCreate} className="px-4 py-2 text-gray-600 hover:bg-gray-200 font-medium rounded-lg transition">Cancel</button>
                            <button type="button" onClick={handleCreate} disabled={submitting} className={`px-4 py-2 text-white font-medium rounded-lg shadow transition ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>{submitting ? 'Issuing...' : 'Issue Notice'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
                        <div className="bg-blue-50 border-b border-blue-100 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2">✏️ Update Safety Notice</h3>
                            <button onClick={closeEdit} className="text-blue-400 hover:text-blue-600 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleEdit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                                <select name="status" value={formData.status} onChange={handleFormChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                                    <option value="Active">Active</option>
                                    <option value="Lifted">Lifted</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Reason / Hazard Description <span className="text-red-500">*</span></label>
                                <textarea name="reason" value={formData.reason} onChange={handleFormChange} required rows="3" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="Describe the immediate danger or policy violation..."></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Location (Optional)</label>
                                    <input type="text" name="location" value={formData.location} onChange={handleFormChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="e.g. Scaffolding B" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Link to Task (Optional)</label>
                                    <select name="taskId" value={formData.taskId} onChange={handleFormChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                                        <option value="">— None —</option>
                                        {tasks.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </form>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button type="button" onClick={closeEdit} className="px-4 py-2 text-gray-600 hover:bg-gray-200 font-medium rounded-lg transition">Cancel</button>
                            <button type="button" onClick={handleEdit} disabled={submitting} className={`px-4 py-2 text-white font-medium rounded-lg shadow transition ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>{submitting ? 'Saving...' : 'Save Changes'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SOSafetyNotices;
