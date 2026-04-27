import React, { useState } from 'react';
import { usePMContext } from '../../context/PMContext';

const priorityColors = {
    Critical: 'bg-red-100 text-red-800 border-red-200',
    High: 'bg-orange-100 text-orange-800 border-orange-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Low: 'bg-green-100 text-green-800 border-green-200',
};

const statusColors = {
    Open: 'bg-red-100 text-red-800',
    Assigned: 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-indigo-100 text-indigo-800',
    Resolved: 'bg-green-100 text-green-800',
    Closed: 'bg-gray-200 text-gray-600',
};

const leftBorderColor = {
    Critical: 'border-l-red-500',
    High: 'border-l-orange-400',
    Medium: 'border-l-yellow-400',
    Low: 'border-l-green-400',
};

const Issues = () => {
    const { issues, assignIssue, resolveIssue, closeIssue, updateIssue, updateIssueStatus, projects, availableUsers } = usePMContext();
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPriority, setFilterPriority] = useState('All');

    // Action modals
    const [actionType, setActionType] = useState(null); // 'update' | 'assign' | 'resolve' | 'close'
    const [actionIssue, setActionIssue] = useState(null);
    const [assignTo, setAssignTo] = useState('');
    const [resolutionNote, setResolutionNote] = useState('');
    const [updateData, setUpdateData] = useState({ priority: 'Medium', status: 'Open' });

    const stats = {
        total: issues.length,
        open: issues.filter(i => i.status === 'Open').length,
        assigned: issues.filter(i => i.status === 'Assigned').length,
        inProg: issues.filter(i => i.status === 'In Progress' || i.status === 'Assigned').length,
        resolved: issues.filter(i => i.status === 'Resolved').length,
        closed: issues.filter(i => i.status === 'Closed').length,
        critical: issues.filter(i => i.priority === 'Critical').length,
    };

    const getProjectName = (id) => projects.find(p => p.id === id)?.name || id;

    const filtered = issues.filter(i => {
        const matchStatus = filterStatus === 'All' || i.status === filterStatus;
        const matchPriority = filterPriority === 'All' || i.priority === filterPriority;
        return matchStatus && matchPriority;
    });

    const openAction = (type, issue) => {
        setActionType(type);
        setActionIssue(issue);
        setAssignTo('');
        setResolutionNote('');
        if (type === 'update') {
            setUpdateData({ priority: issue.priority || 'Medium', status: issue.status || 'Open' });
        }
    };

    const closeAction = () => {
        setActionType(null);
        setActionIssue(null);
    };

    const handleAction = async () => {
        if (!actionIssue) return;
        try {
            if (actionType === 'update') {
                if (updateData.status !== actionIssue.status) {
                    await updateIssueStatus(actionIssue.id, updateData.status);
                }
            } else if (actionType === 'assign') {
                if (!assignTo) return alert('Please select a user to assign.');
                await assignIssue(actionIssue.id, assignTo);
            } else if (actionType === 'resolve') {
                await resolveIssue(actionIssue.id, resolutionNote || 'Resolved by PM.');
            } else if (actionType === 'close') {
                await closeIssue(actionIssue.id);
            }
            closeAction();
        } catch (error) {
            alert(error?.message || 'Action failed');
        }
    };

    // Determine which actions are available based on the issue status
    const getAvailableActions = (status) => {
        switch (status) {
            case 'Open': return ['update', 'assign'];
            case 'Assigned': return ['update', 'assign']; // Re-assign
            case 'In Progress': return ['update', 'resolve'];
            case 'Resolved': return ['update', 'close'];
            case 'Closed': return ['update'];
            default: return ['update'];
        }
    };

    const actionLabel = {
        update: 'Edit Status',
        assign: 'Assign',
        resolve: 'Resolve',
        close: 'Close',
    };

    const actionBtnColor = {
        update: 'text-indigo-600 hover:bg-indigo-50 border-indigo-200',
        assign: 'text-blue-600 hover:bg-blue-50 border-blue-200',
        resolve: 'text-emerald-600 hover:bg-emerald-50 border-emerald-200',
        close: 'text-gray-600 hover:bg-gray-100 border-gray-200',
    };

    return (
        <div className="p-6 bg-concrete-light min-h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-steel-blue">Issues & Defect Tracking</h1>
                    <p className="text-sm text-concrete mt-1">{stats.open} open issues &mdash; {stats.critical} critical. Issues are reported by Site Engineers.</p>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-6">
                {[
                    { label: 'Total', value: stats.total, color: 'border-steel-blue text-steel-blue' },
                    { label: 'Open', value: stats.open, color: 'border-red-400 text-red-600' },
                    { label: 'Assigned', value: stats.assigned, color: 'border-blue-400 text-blue-600' },
                    { label: 'Resolved', value: stats.resolved, color: 'border-green-400 text-green-600' },
                    { label: 'Closed', value: stats.closed, color: 'border-gray-400 text-gray-500' },
                    { label: 'Critical', value: stats.critical, color: 'border-red-600 text-red-700' },
                ].map(s => (
                    <div key={s.label} className={`bg-white rounded-lg p-3 border-l-4 ${s.color} shadow-sm`}>
                        <p className="text-xs text-concrete uppercase font-medium">{s.label}</p>
                        <p className={`text-2xl font-bold ${s.color.split(' ')[1]}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6 items-center">
                <div className="flex gap-2 flex-wrap">
                    {['All', 'Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'].map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${filterStatus === s ? 'bg-steel-blue text-white border-steel-blue' : 'bg-white text-concrete border-concrete-light hover:border-steel-blue hover:text-steel-blue'}`}>
                            {s}
                        </button>
                    ))}
                </div>
                <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                    className="ml-auto border border-concrete-light rounded px-3 py-1.5 text-sm text-concrete bg-white focus:outline-none focus:border-steel-blue">
                    <option value="All">All Priorities</option>
                    {['Critical', 'High', 'Medium', 'Low'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>

            {/* Issues Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(issue => {
                    const actions = getAvailableActions(issue.status);
                    return (
                    <div key={issue.id} className={`bg-white rounded-xl shadow-sm border-l-4 ${leftBorderColor[issue.priority] || 'border-l-gray-300'} border border-concrete-light p-5 flex flex-col hover:shadow-md transition-shadow`}>
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 pr-2">
                                <h2 className="text-base font-bold text-gray-800 mt-0.5">{issue.title}</h2>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full shrink-0 ${statusColors[issue.status] || 'bg-gray-100 text-gray-600'}`}>{issue.status}</span>
                        </div>

                        <p className="text-xs text-blue-600 font-medium mb-1">
                            {getProjectName(issue.projectId)}
                            {issue.taskName && <span className="text-gray-500"> &middot; Task: <span className="text-indigo-600">{issue.taskName}</span></span>}
                            {issue.reportedLocation && <span className="text-gray-500"> &middot; Location: <span className="text-gray-700">{issue.reportedLocation}</span></span>}
                        </p>
                        <p className="text-sm text-gray-500 flex-1 mb-3 line-clamp-3">{issue.description}</p>

                        <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400 text-xs">Reported By</span>
                                <span className="text-gray-700 font-medium text-xs">{issue.reportedBy}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400 text-xs">Date</span>
                                <span className="text-gray-700 text-xs">{issue.reportedDate}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-xs">Priority</span>
                                <span className={`px-2 py-0.5 text-xs font-bold rounded border ${priorityColors[issue.priority] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>{issue.priority}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-xs">Type</span>
                                <span className="text-xs text-indigo-600 font-medium">{issue.type || 'Other'}</span>
                            </div>
                            {issue.assignedTo && (
                                <div className="flex justify-between">
                                    <span className="text-gray-400 text-xs">Assigned To</span>
                                    <span className="text-gray-700 text-xs font-medium">{typeof issue.assignedTo === 'object' ? issue.assignedTo.name : issue.assignedTo}</span>
                                </div>
                            )}
                            {issue.resolutionNote && (
                                <div className="flex justify-between">
                                    <span className="text-gray-400 text-xs">Resolution</span>
                                    <span className="text-gray-700 text-xs font-medium truncate max-w-[120px]">{issue.resolutionNote}</span>
                                </div>
                            )}
                        </div>

                        {/* PM Action Buttons - Status Workflow Only */}
                        {actions.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-concrete-light flex justify-end space-x-2">
                                {actions.map(action => (
                                    <button key={action} onClick={() => openAction(action, issue)}
                                        className={`text-xs font-semibold px-3 py-1.5 rounded border transition ${actionBtnColor[action]}`}>
                                        {actionLabel[action]}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="col-span-3 text-center py-16 text-concrete">
                        <p className="text-lg font-medium">No issues match the current filters.</p>
                    </div>
                )}
            </div>

            {/* Action Modal */}
            {actionType && actionIssue && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50  flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {actionType === 'update' && 'Update Status'}
                                {actionType === 'assign' && 'Assign Issue'}
                                {actionType === 'resolve' && 'Resolve Issue'}
                                {actionType === 'close' && 'Close Issue'}
                            </h3>
                            <button onClick={closeAction} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-sm font-bold text-gray-800">{actionIssue.title}</p>
                                <p className="text-xs text-gray-500 mt-1">{getProjectName(actionIssue.projectId)} &bull; {actionIssue.priority} Priority</p>
                            </div>

                            {actionType === 'update' && (
                                <div className="space-y-3 pt-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select value={updateData.status} onChange={(e) => setUpdateData({...updateData, status: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-indigo-500">
                                            {['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {actionType === 'assign' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                                    <select value={assignTo} onChange={(e) => setAssignTo(e.target.value)} required
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white">
                                        <option value="">-- Select User --</option>
                                        {availableUsers.map(u => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.role}) — {u.status}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {actionType === 'resolve' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Note</label>
                                    <textarea value={resolutionNote} onChange={(e) => setResolutionNote(e.target.value)}
                                        rows="3" placeholder="Describe how the issue was resolved..."
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                                </div>
                            )}

                            {actionType === 'close' && (
                                <p className="text-sm text-gray-600">This will permanently close the issue. Only resolved issues can be closed.</p>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
                            <button type="button" onClick={closeAction} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium text-sm">Cancel</button>
                            <button type="button" onClick={handleAction}
                                className={`px-4 py-2 text-white rounded font-medium text-sm shadow ${
                                    actionType === 'update' ? 'bg-indigo-600 hover:bg-indigo-700' :
                                    actionType === 'assign' ? 'bg-blue-600 hover:bg-blue-700' :
                                    actionType === 'resolve' ? 'bg-emerald-600 hover:bg-emerald-700' :
                                    'bg-gray-600 hover:bg-gray-700'
                                }`}>
                                {actionType === 'update' && 'Save Changes'}
                                {actionType === 'assign' && 'Assign Issue'}
                                {actionType === 'resolve' && 'Mark as Resolved'}
                                {actionType === 'close' && 'Close Issue'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Issues;
