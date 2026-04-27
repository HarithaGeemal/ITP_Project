import React, { useState } from 'react';
import { useSOContext } from '../../context/SOContext';

// PTW model fields: taskId (required), permitType (required), status, validUntil, notes
const PERMIT_TYPES = ['Hot Work', 'Confined Space', 'Working at Heights', 'Excavation', 'General'];
const STATUSES = ['Pending', 'Approved', 'Denied', 'Revoked'];

const STATUS_STYLES = {
    'Pending':  { card: 'border-yellow-300', badge: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    'Approved': { card: 'border-green-300',  badge: 'bg-green-100 text-green-800 border-green-300' },
    'Denied':   { card: 'border-red-300',    badge: 'bg-red-100 text-red-800 border-red-300' },
    'Revoked':  { card: 'border-gray-500',   badge: 'bg-gray-800 text-white border-gray-900' },
};

const PERMIT_ICONS = {
    'Hot Work':             '🔥',
    'Confined Space':       '⚠️',
    'Working at Heights':   '🏗️',
    'Excavation':           '⛏️',
    'General':              '📋',
};

const SOPTWs = () => {
    const { activeProjectId, ptws, updatePTW, deletePTW } = useSOContext();
    const [filterStatus, setFilterStatus] = useState('All');
    const [editModal, setEditModal] = useState(null);
    const [editStatus, setEditStatus] = useState('Pending');
    const [denialReason, setDenialReason] = useState('');

    // Edit/status handlers
    const openEdit = (ptw) => { 
        setEditModal(ptw); 
        setEditStatus(ptw.status); 
        setDenialReason(ptw.status === 'Denied' ? (ptw.notes || '') : ''); 
    };
    const closeEdit = () => { setEditModal(null); setDenialReason(''); };

    const handleStatusUpdate = async () => {
        let payload = { status: editStatus };
        if (editStatus === 'Denied') {
            if (!denialReason || denialReason.trim() === '') {
                return alert('A reason is required to deny a permit.');
            }
            payload.notes = denialReason;
        }
        try { await updatePTW(activeProjectId, editModal.id, payload); closeEdit(); }
        catch (e) { alert('Failed to update: ' + (e?.response?.data?.message || e.message)); }
    };

    const handleQuickAction = async (ptw, newStatus) => {
        let payload = { status: newStatus };
        if (newStatus === 'Denied') {
            const reason = prompt('Please enter the reason for denying this permit:');
            if (!reason || reason.trim() === '') {
                alert('A reason is required to deny a permit.');
                return;
            }
            payload.notes = reason;
        }
        try { await updatePTW(activeProjectId, ptw.id, payload); }
        catch (e) { alert('Failed to update status: ' + (e?.response?.data?.message || e.message)); }
    };

    const handleDelete = async (id) => {
        const deleteReason = prompt('Enter reason for deletion:');
        if (!deleteReason) return;
        try { await deletePTW(activeProjectId, id, deleteReason); }
        catch (e) { alert('Failed to delete.'); }
    };

    if (!activeProjectId) return <div className="p-12 text-center text-gray-500">Please select a project.</div>;

    const pendingCount = ptws.filter(p => p.status === 'Pending').length;
    const filtered = filterStatus === 'All' ? ptws : ptws.filter(p => p.status === filterStatus);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Permits to Work (PTW)</h1>
                    <p className="text-sm text-gray-500 mt-1">Issue and manage permits for high-risk activities on site.</p>
                </div>
                <div className="flex items-center gap-3">
                    {pendingCount > 0 && (
                        <span className="bg-yellow-100 text-yellow-800 text-sm font-bold px-4 py-2 rounded-full border border-yellow-300 animate-pulse">
                            ⚠ {pendingCount} Pending Requests
                        </span>
                    )}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-3 mb-2">
                {['Pending', 'Approved', 'Denied', 'Revoked'].map(s => (
                    <button key={s} onClick={() => setFilterStatus(filterStatus === s ? 'All' : s)}
                        className={`p-3 rounded-lg border text-center transition cursor-pointer hover:shadow-md ${filterStatus === s ? 'ring-2 ring-red-500' : ''} ${STATUS_STYLES[s]?.card ? 'border-' + STATUS_STYLES[s].card.split('-')[1] + '-300' : 'border-gray-200'} bg-white`}>
                        <p className="text-xl font-bold text-gray-800">{ptws.filter(p => p.status === s).length}</p>
                        <p className="text-xs font-medium text-gray-500">{s}</p>
                    </button>
                ))}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap mb-2">
                {['All', ...STATUSES].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${filterStatus === s ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'}`}>
                        {s}
                    </button>
                ))}
            </div>

            {/* PTW Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filtered.map(ptw => {
                    const styles = STATUS_STYLES[ptw.status] || { card: 'border-gray-200', badge: 'bg-gray-100 text-gray-700' };
                    return (
                        <div key={ptw.id} className={`bg-white rounded-xl shadow-sm border p-5 flex flex-col hover:shadow-md transition-shadow ${styles.card}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{PERMIT_ICONS[ptw.permitType] || '📋'}</span>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-800">{ptw.permitType}</h3>
                                        {ptw.taskId?.name && <p className="text-xs text-gray-500">Task: {ptw.taskId.name}</p>}
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 text-xs rounded-full font-bold border ${styles.badge}`}>{ptw.status}</span>
                            </div>

                            <div className="text-xs text-gray-500 bg-gray-50 rounded p-2 mb-3 space-y-1">
                                <p><strong>Requested By:</strong> {ptw.requestedBy?.name || 'Unknown'}</p>
                                {ptw.validUntil && <p><strong>Valid Until:</strong> {new Date(ptw.validUntil).toLocaleDateString()}</p>}
                                {ptw.approvedBy && <p><strong>Reviewed By:</strong> {ptw.approvedBy.name} on {new Date(ptw.approvedAt).toLocaleDateString()}</p>}
                            </div>

                            {ptw.notes && <p className="text-sm text-gray-600 italic mb-3 line-clamp-2">"{ptw.notes}"</p>}

                            <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                                <div className="flex gap-2">
                                    {ptw.status === 'Pending' && (
                                        <>
                                            <button onClick={() => handleQuickAction(ptw, 'Approved')} className="text-xs bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-3 rounded">✓ Approve</button>
                                            <button onClick={() => handleQuickAction(ptw, 'Denied')} className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded">✗ Deny</button>
                                        </>
                                    )}
                                    {ptw.status === 'Approved' && (
                                        <button onClick={() => handleQuickAction(ptw, 'Revoked')} className="text-xs bg-gray-800 hover:bg-gray-900 text-white font-bold py-1.5 px-3 rounded">Revoke</button>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => openEdit(ptw)} className="text-xs font-medium text-gray-500 hover:text-gray-800 underline">Edit</button>
                                    <button onClick={() => handleDelete(ptw.id)} className="text-xs font-medium text-red-500 hover:text-red-700 underline">Delete</button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="col-span-2 text-center py-16 bg-white border border-dashed border-gray-300 rounded-xl">
                        <p className="text-2xl mb-2">📋</p>
                        <p className="text-base font-medium text-gray-500">No permits found.</p>
                        <p className="text-sm text-gray-400">Site Engineers must submit requests before you can review them.</p>
                    </div>
                )}
            </div>

            {/* End PTW Cards */}

            {/* Edit Status Modal */}
            {editModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">Update PTW Status</h3>
                            <button onClick={closeEdit} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-600">Permit Type: <strong>{editModal.permitType}</strong></p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2">
                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            {editStatus === 'Denied' && (
                                <div>
                                    <label className="block text-sm font-medium text-red-700 mb-1">Reason for Denial <span className="text-red-500">*</span></label>
                                    <textarea 
                                        value={denialReason} 
                                        onChange={e => setDenialReason(e.target.value)} 
                                        rows="3" 
                                        placeholder="Please provide a clear reason for denying this permit..." 
                                        className="w-full border border-red-300 rounded px-3 py-2 focus:ring-red-500 focus:border-red-500"
                                        required
                                    />
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                            <button onClick={closeEdit} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
                            <button onClick={handleStatusUpdate} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium">Update</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SOPTWs;
