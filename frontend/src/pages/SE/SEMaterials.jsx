import React, { useState, useEffect } from 'react';
import { useSEContext } from '../../context/SEContext';
import useAxios from '../../hooks/useAxios';

const statusColors = {
    'Pending SE Approval': 'bg-orange-100 text-orange-800 border-orange-200',
    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Approved': 'bg-blue-100 text-blue-800 border-blue-200',
    'Partially Fulfilled': 'bg-purple-100 text-purple-800 border-purple-200',
    'Fulfilled': 'bg-green-100 text-green-800 border-green-200',
    'Denied': 'bg-red-100 text-red-800 border-red-200',
    'Rejected': 'bg-red-100 text-red-800 border-red-200',
};

const SEMaterials = () => {
    const { materialRequests, fetchMaterialRequests, assignedTasks } = useSEContext();
    const axiosClient = useAxios();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [globalMaterials, setGlobalMaterials] = useState([]);
    const [projectTools, setProjectTools] = useState([]);
    
    // Form State
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState([{ requestType: 'Material', itemId: '', quantityRequested: 1 }]);

    // Comment State
    const [expandedRequestId, setExpandedRequestId] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);

    const loadCatalog = async () => {
        try {
            const { data } = await axiosClient.get("/materials/items");
            if (data.success) {
                setGlobalMaterials(data.items);
            }
        } catch (error) {
            console.error("Failed to load global material catalog", error);
        }
    };

    useEffect(() => {
        loadCatalog();
    }, []);

    // When Task changes, fetch the project's tools
    useEffect(() => {
        if (!selectedTaskId) {
            setProjectTools([]);
            return;
        }
        
        const task = assignedTasks.find(t => t.id === selectedTaskId) || assignedTasks.find(t => t._id === selectedTaskId);
        if (task && task.projectId) {
            const pId = typeof task.projectId === 'object' ? (task.projectId._id || task.projectId.id) : task.projectId;
            axiosClient.get(`/projects/${pId}/tools`).then(({ data }) => {
                if(data.success) setProjectTools(data.tools || []);
            }).catch(err => {
                console.error("Failed to load tools for project", err);
                setProjectTools([]);
            });
        }
    }, [selectedTaskId, assignedTasks]);

    const handleAddItem = () => {
        setItems([...items, { requestType: 'Material', itemId: '', quantityRequested: 1 }]);
    };

    const handleRemoveItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        
        // Reset itemId if switching types
        if (field === 'requestType') {
            newItems[index].itemId = '';
        }
        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTaskId) {
            alert("Please select a Target Task.");
            return;
        }

        const validItems = items.filter(i => i.itemId && i.quantityRequested > 0);
        if (validItems.length === 0) {
            alert("Please add at least one valid resource to request.");
            return;
        }

        const task = assignedTasks.find(t => t.id === selectedTaskId) || assignedTasks.find(t => t._id === selectedTaskId);
        const pId = typeof task.projectId === 'object' ? (task.projectId._id || task.projectId.id) : task.projectId;

        try {
            const { data } = await axiosClient.post(`/projects/${pId}/material-requests`, {
                taskId: selectedTaskId,
                items: validItems,
                notes
            });
            if (data.success) {
                alert("Resource request submitted to Store Keeper successfully!");
                await fetchMaterialRequests();
                setIsModalOpen(false);
                setSelectedTaskId('');
                setNotes('');
                setItems([{ requestType: 'Material', itemId: '', quantityRequested: 1 }]);
            }
        } catch (error) {
            console.error("Failed to submit request", error);
            const msg = error.response?.data?.message || "Failed to submit request";
            alert(msg);
        }
    };

    const handleAddComment = async (requestItem) => {
        if (!commentText.trim()) return;
        
        const pId = typeof requestItem.projectId === 'object' ? (requestItem.projectId._id || requestItem.projectId) : requestItem.projectId;
        const reqId = requestItem._id || requestItem.id;

        setCommentLoading(true);
        try {
            const { data } = await axiosClient.post(`/projects/${pId}/material-requests/${reqId}/comments`, {
                text: commentText.trim()
            });
            if (data.success) {
                setCommentText('');
                await fetchMaterialRequests();
            }
        } catch (error) {
            console.error("Failed to add comment", error);
            alert(error.response?.data?.message || "Failed to add comment");
        } finally {
            setCommentLoading(false);
        }
    };

    const handleSEApproveWorkerRequest = async (requestItem) => {
        const pId = typeof requestItem.projectId === 'object' ? (requestItem.projectId._id || requestItem.projectId) : requestItem.projectId;
        const reqId = requestItem._id || requestItem.id;
        
        try {
            const { data } = await axiosClient.patch(`/projects/${pId}/material-requests/${reqId}/se-approve`);
            if (data.success) {
                alert("Request explicitly authorized and forwarded to Store Keeper.");
                await fetchMaterialRequests();
            }
        } catch (error) {
            console.error("Failed to approve worker request", error);
            alert(error.response?.data?.message || "Failed to approve request.");
        }
    };

    const handleSEDenyWorkerRequest = async (requestItem) => {
        const reason = prompt("Reason for denying this request (optional):");
        if (reason === null) return;
        
        const pId = typeof requestItem.projectId === 'object' ? (requestItem.projectId._id || requestItem.projectId) : requestItem.projectId;
        const reqId = requestItem._id || requestItem.id;
        
        try {
            const { data } = await axiosClient.patch(`/projects/${pId}/material-requests/${reqId}/se-deny`, { reason });
            if (data.success) {
                alert("Request has been denied.");
                await fetchMaterialRequests();
            }
        } catch (error) {
            console.error("Failed to deny worker request", error);
            alert(error.response?.data?.message || "Failed to deny request.");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Resource Requests</h1>
                    <p className="text-sm text-gray-500 mt-1">Submit material and tool requisitions to the Store Keeper and track fulfillment status.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-steel-blue hover:bg-steel-blue/90 text-white px-4 py-2 rounded shadow-sm font-medium transition-colors"
                >
                    + New Request
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                {materialRequests.length === 0 ? (
                    <div className="p-16 text-center text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900">No Requests Found</h3>
                        <p className="mt-1">You haven't requested any resources yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {materialRequests.map((req) => {
                            const isExpanded = expandedRequestId === (req._id || req.id);
                            const comments = req.comments || [];
                            return (
                                <div key={req.id || req._id} className="hover:bg-gray-50/50 transition-colors">
                                    {/* Main Row */}
                                    <div className="flex items-center justify-between px-6 py-4">
                                        <div className="flex items-center gap-8 flex-1 min-w-0">
                                            <div className="text-sm text-gray-500 w-24 shrink-0">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="w-32 shrink-0">
                                                <div className="text-sm font-bold text-gray-800">{req.taskId?.name || req.taskName || 'Unknown Task'}</div>
                                            </div>
                                            <div className="text-sm text-gray-600 flex-1 min-w-0">
                                                {req.materialItemId ? (
                                                    <div>
                                                        <span className="font-semibold text-blue-700">[Material]</span> {req.materialItemId?.name || 'Unknown'} - {req.requestedQuantity} {req.materialItemId?.unit || 'units'}
                                                    </div>
                                                ) : req.toolId ? (
                                                    <div>
                                                        <span className="font-semibold text-orange-700">[Tool]</span> {req.toolId?.name || 'Unknown'} - {req.requestedQuantity} units
                                                    </div>
                                                ) : (
                                                    <div>Unknown Resource - {req.requestedQuantity}</div>
                                                )}
                                                {req.notes && <p className="mt-1 text-xs text-gray-500 italic">Note: {req.notes}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0 ml-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[req.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                                                {req.status}
                                            </span>
                                            {req.status === "Pending SE Approval" && (
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleSEApproveWorkerRequest(req)}
                                                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded shadow-sm transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleSEDenyWorkerRequest(req)}
                                                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded shadow-sm transition-colors"
                                                    >
                                                        Deny
                                                    </button>
                                                </div>
                                            )}
                                            <button 
                                                onClick={() => setExpandedRequestId(isExpanded ? null : (req._id || req.id))}
                                                className="text-gray-400 hover:text-steel-blue transition-colors p-1"
                                                title="Comments"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                {comments.length > 0 && (
                                                    <span className="absolute -mt-7 ml-3 bg-steel-blue text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{comments.length}</span>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Comments Section */}
                                    {isExpanded && (
                                        <div className="px-6 pb-4 bg-gray-50/80 border-t border-gray-100">
                                            <div className="pt-3">
                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Comments</h4>
                                                
                                                {comments.length === 0 ? (
                                                    <p className="text-sm text-gray-400 italic mb-3">No comments yet.</p>
                                                ) : (
                                                    <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                                                        {comments.map((c, idx) => (
                                                            <div key={idx} className="bg-white rounded p-3 border border-gray-200 shadow-sm">
                                                                <div className="flex justify-between items-start">
                                                                    <span className="text-sm font-semibold text-gray-800">{c.createdBy?.name || 'Unknown'}</span>
                                                                    <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mt-1">{c.text}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Add Comment Form */}
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="text"
                                                        value={expandedRequestId === (req._id || req.id) ? commentText : ''}
                                                        onChange={(e) => setCommentText(e.target.value)}
                                                        placeholder="Write a comment..."
                                                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-steel-blue focus:border-steel-blue"
                                                        onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(req); }}}
                                                    />
                                                    <button 
                                                        onClick={() => handleAddComment(req)}
                                                        disabled={commentLoading || !commentText.trim()}
                                                        className="bg-steel-blue text-white px-4 py-2 rounded text-sm font-medium hover:bg-steel-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        {commentLoading ? '...' : 'Send'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Request Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">New Resource Request</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Task Allocation</label>
                                    <select 
                                        value={selectedTaskId} 
                                        onChange={(e) => setSelectedTaskId(e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                                        required
                                    >
                                        <option value="" disabled>Select the task requiring resources...</option>
                                        {assignedTasks.filter(t => !t.parentTaskId).map(t => (
                                            <option key={t.id || t._id} value={t.id || t._id}>{t.name} (Project: {t.projectId?.name || t.projectName || 'Unknown'})</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest">Required Resources</label>
                                        <button type="button" onClick={handleAddItem} className="text-steel-blue text-sm font-semibold hover:underline bg-white px-3 py-1 border rounded shadow-sm">
                                            + Add Another Item
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {items.map((item, index) => (
                                            <div key={index} className="flex gap-3 items-center bg-white p-3 rounded border border-gray-200 shadow-sm">
                                                <select
                                                    value={item.requestType}
                                                    onChange={(e) => handleItemChange(index, 'requestType', e.target.value)}
                                                    className="w-32 border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 font-medium"
                                                >
                                                    <option value="Material">Material</option>
                                                    <option value="Tool">Tool</option>
                                                </select>
                                                
                                                <select
                                                    value={item.itemId}
                                                    onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                                                    className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-sm"
                                                    required
                                                >
                                                    <option value="" disabled>Select {item.requestType.toLowerCase()}...</option>
                                                    {item.requestType === 'Material' && globalMaterials.map(m => (
                                                        <option key={m._id} value={m._id}>{m.name} ({m.unit}) - Stock: {m.currentStock ?? m.totalStock ?? 'N/A'}</option>
                                                    ))}
                                                    {item.requestType === 'Tool' && projectTools.map(t => (
                                                        <option key={t._id} value={t._id}>{t.name} ({t.condition}) - Qty: {t.availableQuantity}/{t.totalQuantity}</option>
                                                    ))}
                                                    {item.requestType === 'Tool' && projectTools.length === 0 && (
                                                        <option value="" disabled>No tools registered for this project</option>
                                                    )}
                                                </select>

                                                <input
                                                    type="number" min="1"
                                                    value={item.quantityRequested}
                                                    onChange={(e) => handleItemChange(index, 'quantityRequested', Number(e.target.value))}
                                                    className="w-24 border border-gray-300 rounded px-3 py-2 text-sm"
                                                    placeholder="Qty"
                                                    required
                                                />
                                                {items.length > 1 && (
                                                    <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 p-2">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                                    <textarea 
                                        value={notes} 
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows="2" 
                                        placeholder="Reason for request, urgency, etc."
                                        className="w-full border border-gray-300 rounded px-3 py-2" 
                                    />
                                </div>
                            </div>
                        </form>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
                            <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-steel-blue text-white rounded hover:bg-steel-blue/90 font-medium">Submit Request</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SEMaterials;
