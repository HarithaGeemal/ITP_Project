import React, { useState } from 'react';
import { useSKContext } from '../../context/SKContext';

const statusBadge = {
    'Pending': 'bg-amber-100 text-amber-800',
    'Approved': 'bg-green-100 text-green-800',
    'Denied': 'bg-red-100 text-red-800',
};

const SKRequests = () => {
    const { pendingRequests, allRequests, fetchAllRequests, issueItem, denyRequest, materials, tools } = useSKContext();

    const [viewMode, setViewMode] = useState('pending'); // 'pending' or 'all'
    const [processing, setProcessing] = useState(null);
    const [denyModal, setDenyModal] = useState(null);
    const [denyNotes, setDenyNotes] = useState('');
    const [issueError, setIssueError] = useState('');

    const requests = viewMode === 'pending' ? pendingRequests : allRequests;

    // Group requests by taskId and requestedBy
    const groupedRequestsMap = requests.reduce((acc, req) => {
        const key = `${req.taskId?._id || req.taskId}-${req.requestedBy?._id || req.requestedBy}-${req.status}`;
        if (!acc[key]) {
            acc[key] = {
                id: key, // grouping id
                projectId: req.projectId,
                taskId: req.taskId,
                requestedBy: req.requestedBy,
                status: req.status,
                createdAt: req.createdAt,
                notes: req.notes,
                items: []
            };
        }
        acc[key].items.push(req);
        if (req.notes && !acc[key].notes) acc[key].notes = req.notes; // Keep first available notes
        return acc;
    }, {});

    const groupedRequests = Object.values(groupedRequestsMap).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const handleViewAll = () => {
        setViewMode('all');
        fetchAllRequests();
    };

    const handleApprove = async (group) => {
        setProcessing(group.id);
        setIssueError('');
        try {
            for (const req of group.items) {
                const requestType = req.requestType || 'Material';
                let payload = {
                    type: requestType,
                    projectId: req.projectId?._id || req.projectId,
                    taskId: req.taskId?._id || req.taskId,
                    materialRequestId: req._id || req.id,
                    requestedBy: req.requestedBy?._id || req.requestedBy,
                    issuedQuantity: req.requestedQuantity || 1,
                };

                if (requestType === 'Material') {
                    if (req.materialItemId) {
                        payload.materialItemId = req.materialItemId._id || req.materialItemId;
                    }
                } else {
                    const matchingTool = tools.find(t =>
                        t.name === (req.toolId?.name || '') || t._id === (req.toolId?._id || req.toolId)
                    );
                    if (matchingTool) {
                        payload.mainStorageToolId = matchingTool._id || matchingTool.id;
                        payload.conditionAtIssue = matchingTool.condition || 'Good';
                    } else if (req.toolId) {
                        payload.materialItemId = req.toolId._id || req.toolId;
                    }
                }

                await issueItem(payload);
            }
        } catch (error) {
            setIssueError(error?.response?.data?.message || error.message || 'Failed to issue item.');
        } finally {
            setProcessing(null);
        }
    };

    const handleDeny = async () => {
        if (!denyModal) return;
        try {
            // Deny all requests in the group
            for (const req of denyModal.items) {
                await denyRequest(req.id || req._id, denyNotes);
            }
            setDenyModal(null);
            setDenyNotes('');
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to deny request.');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Material & Tool Requests</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Review and process incoming requests from site engineers.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setViewMode('pending')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${viewMode === 'pending' ? 'bg-steel-blue text-white border-steel-blue' : 'bg-white text-gray-600 border-gray-200 hover:border-steel-blue/50'}`}>
                        📋 Pending ({pendingRequests.length})
                    </button>
                    <button onClick={handleViewAll}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${viewMode === 'all' ? 'bg-steel-blue text-white border-steel-blue' : 'bg-white text-gray-600 border-gray-200 hover:border-steel-blue/50'}`}>
                        📂 All Requests
                    </button>
                </div>
            </div>

            {issueError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm font-medium flex items-center gap-2">
                    <span>⚠️</span> {issueError}
                </div>
            )}

            {/* Requests List */}
            <div className="space-y-4">
                {groupedRequests.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                        <p className="text-4xl mb-3">{viewMode === 'pending' ? '✅' : '📋'}</p>
                        <p className="text-gray-500 font-medium">{viewMode === 'pending' ? 'No pending requests. All caught up!' : 'No requests found.'}</p>
                    </div>
                )}

                {groupedRequests.map(group => {
                    return (
                        <div key={group.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            {/* Request Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="bg-steel-blue/10 text-steel-blue w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm">
                                        {(group.requestedBy?.name || 'U')[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">
                                            {group.requestedBy?.name || 'Unknown User'}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {group.projectId?.name || 'Unknown Project'}
                                            {group.taskId?.name ? ` · Task: ${group.taskId.name}` : ''}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusBadge[group.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {group.status}
                                    </span>
                                    <span className="text-xs text-gray-400">{new Date(group.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* Request Items */}
                            <div className="px-5 py-4">
                                <p className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-wider">Requested Items</p>
                                <div className="space-y-2">
                                    {group.items.map((item, idx) => {
                                        const itemName = item.materialItemId?.name || item.toolId?.name || 'Unknown Item';
                                        const itemCode = item.materialItemId?.code || item.toolId?.code || '';
                                        const available = item.materialItemId?.currentStock ?? item.toolId?.quantity ?? '?';
                                        const reqType = item.requestType || 'Material';

                                        return (
                                            <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">{reqType === 'Tool' ? '🔧' : '🧱'}</span>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800">{itemName}</p>
                                                        <p className="text-xs text-gray-400">{itemCode ? `Code: ${itemCode} · ` : ''}{reqType}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-gray-700">Qty: {item.requestedQuantity}</p>
                                                    <p className="text-xs text-gray-400">Available: {available}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {group.notes && (
                                    <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2">
                                        <p className="text-xs text-blue-700"><strong>Notes:</strong> {group.notes}</p>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            {group.status === 'Pending' && (
                                <div className="flex justify-end gap-3 px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                                    <button onClick={() => { setDenyModal(group); setDenyNotes(''); }}
                                        className="px-4 py-2 rounded-lg text-sm font-bold border border-red-300 text-red-700 hover:bg-red-50 transition">
                                        ✕ Deny
                                    </button>
                                    <button onClick={() => handleApprove(group)} disabled={processing === group.id}
                                        className="px-5 py-2 rounded-lg text-sm font-bold bg-steel-blue text-white hover:bg-steel-blue/90 shadow transition disabled:opacity-50 disabled:cursor-not-allowed">
                                        {processing === group.id ? 'Processing...' : '✓ Approve & Issue'}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Deny Modal */}
            {denyModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Deny Request</h3>
                        <p className="text-sm text-gray-500 mb-4">Provide a reason for denying this request (optional).</p>
                        <textarea value={denyNotes} onChange={(e) => setDenyNotes(e.target.value)} rows={3}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                            placeholder="Reason for denial..." />
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => setDenyModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm">Cancel</button>
                            <button onClick={handleDeny} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm shadow">Deny Request</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SKRequests;
