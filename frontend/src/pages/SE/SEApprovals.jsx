import React, { useState } from 'react';
import { useSEContext } from '../../context/SEContext';

const SEApprovals = () => {
    const { 
        subtaskApprovals, approveSubtask, fetchSubtaskApprovals,
        pendingTimesheets, approveTimesheet, rejectTimesheet 
    } = useSEContext();
    const [submittingId, setSubmittingId] = useState(null);
    const [activeTab, setActiveTab] = useState('subtasks');

    const handleApproveSubtask = async (task) => {
        const note = prompt("Optional: Leave an approval note for your records");
        if (note === null) return;
        
        try {
            setSubmittingId(task.id);
            await approveSubtask(task.projectId._id || task.projectId, task.id, note || "Approved by Site Engineer");
            alert("Subtask successfully marked as Completed.");
        } catch (error) {
            console.error(error);
        } finally {
            setSubmittingId(null);
        }
    };

    const handleRejectSubtask = async (task) => {
        alert("Reject function will be mapped to task updater to revert completion request.");
    };

    const handleApproveTimesheet = async (ts) => {
        const note = prompt("Optional: Add a note");
        if (note === null) return;
        try {
            setSubmittingId(ts._id);
            await approveTimesheet(ts._id, note || "Approved");
            alert("Timesheet approved.");
        } catch (error) {
            console.error(error);
        } finally {
            setSubmittingId(null);
        }
    };

    const handleRejectTimesheet = async (ts) => {
        const reason = prompt("Reason for rejection:");
        if (reason === null) return;
        try {
            setSubmittingId(ts._id);
            await rejectTimesheet(ts._id, reason || "Rejected by Site Engineer");
            alert("Timesheet rejected.");
        } catch (error) {
            console.error(error);
        } finally {
            setSubmittingId(null);
        }
    };

    const tabs = [
        { key: 'subtasks', label: 'Subtask Completions', count: subtaskApprovals.length },
        { key: 'timesheets', label: 'Worker Timesheets', count: pendingTimesheets.length },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6 border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">Approvals Pipeline</h1>
                <p className="text-sm text-gray-500 mt-1">Review subtask completions and worker timesheets from your field teams.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                            activeTab === tab.key
                                ? 'bg-steel-blue text-white shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {tab.label}
                        {tab.count > 0 && (
                            <span className={`text-xs rounded-full px-2 py-0.5 font-bold ${
                                activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                            }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Subtask Approvals Tab */}
            {activeTab === 'subtasks' && (
                <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                    {subtaskApprovals.length === 0 ? (
                        <div className="p-16 text-center text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900">Inbox Zero</h3>
                            <p className="mt-1">There are no pending subtasks awaiting your approval.</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtask Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Task</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {subtaskApprovals.map((task) => (
                                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-900">{task.name}</div>
                                            <div className="text-xs text-gray-500">{task.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-700 font-medium">{task.parentTaskId?.name || 'Unknown Reference'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-700">{task.projectId?.name || 'Unknown Project'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {task.completionRequestedBy?.name || 'Unknown User'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex justify-center gap-3">
                                                <button 
                                                    onClick={() => handleApproveSubtask(task)}
                                                    disabled={submittingId === task.id}
                                                    className="text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded disabled:opacity-50 shadow-sm"
                                                >
                                                    {submittingId === task.id ? 'Approving...' : 'Approve'}
                                                </button>
                                                <button 
                                                    onClick={() => handleRejectSubtask(task)}
                                                    disabled={submittingId === task.id}
                                                    className="text-red-600 hover:text-white hover:bg-red-600 px-3 py-1.5 rounded border border-red-600 disabled:opacity-50 transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Timesheets Tab */}
            {activeTab === 'timesheets' && (
                <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                    {pendingTimesheets.length === 0 ? (
                        <div className="p-16 text-center text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900">No Pending Timesheets</h3>
                            <p className="mt-1">All worker timesheets have been reviewed.</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pendingTimesheets.map((ts) => (
                                    <tr key={ts._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">{ts.userId?.name || 'Unknown Worker'}</div>
                                            <div className="text-xs text-gray-400">{ts.userId?.email || ''}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {ts.projectId?.name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                            {new Date(ts.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold text-steel-blue">{ts.hoursWorked}h</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                            {ts.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex justify-center gap-3">
                                                <button 
                                                    onClick={() => handleApproveTimesheet(ts)}
                                                    disabled={submittingId === ts._id}
                                                    className="text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded disabled:opacity-50 shadow-sm"
                                                >
                                                    {submittingId === ts._id ? '...' : 'Approve'}
                                                </button>
                                                <button 
                                                    onClick={() => handleRejectTimesheet(ts)}
                                                    disabled={submittingId === ts._id}
                                                    className="text-red-600 hover:text-white hover:bg-red-600 px-3 py-1.5 rounded border border-red-600 disabled:opacity-50 transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default SEApprovals;
