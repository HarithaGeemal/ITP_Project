import React from 'react';
import { useSEContext } from '../../context/SEContext';
import { Link } from 'react-router-dom';

const SEDashboard = () => {
    const { dashboardMetrics, assignedTasks, subtaskApprovals } = useSEContext();

    if (!dashboardMetrics) {
        return (
            <div className="flex justify-center items-center h-full p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    const { activeTasks, pendingSubtaskApprovals, openSafetyNotices, recentMaterialRequests } = dashboardMetrics;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="mb-2">
                <h1 className="text-2xl font-bold text-gray-900">Site Engineer Overview</h1>
                <p className="text-sm text-gray-500 mt-1">Real-time telemetry for your active projects and task delegation queues.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Active Tasks</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-1">{activeTasks}</h3>
                    </div>
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-orange-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-sm font-semibold text-orange-600 uppercase tracking-widest">Pending Approvals</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-1">{pendingSubtaskApprovals}</h3>
                    </div>
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Material Requests</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-1">{recentMaterialRequests}</h3>
                    </div>
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-sm font-semibold text-red-600 uppercase tracking-widest">Project Safety</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-1">{openSafetyNotices}</h3>
                    </div>
                    <div className="p-3 bg-red-100 text-red-600 rounded-full">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Approvals Need Attention */}
                <div className="col-span-1 lg:col-span-2 bg-white rounded-xl shadow border border-gray-200 p-5">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-lg font-bold text-gray-800">Action Required: Subtasks</h3>
                        <Link to="/se/approvals" className="text-sm text-steel-blue hover:underline font-medium">View Inbox &rarr;</Link>
                    </div>
                    {subtaskApprovals.length === 0 ? (
                        <p className="text-gray-500 italic text-sm py-4">No subtasks currently awaiting your approval.</p>
                    ) : (
                        <ul className="space-y-3">
                            {subtaskApprovals.slice(0, 4).map(sub => (
                                <li key={sub.id} className="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-100">
                                    <div>
                                        <p className="font-semibold text-sm text-gray-800">{sub.name}</p>
                                        <p className="text-xs text-gray-500">Requested by: {sub.completionRequestedBy?.name || 'Unknown'}</p>
                                    </div>
                                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded">Needs Approval</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Quick Deploy assignedTasks */}
                <div className="col-span-1 bg-white rounded-xl shadow border border-gray-200 p-5">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-lg font-bold text-gray-800">Your Base Tasks</h3>
                        <Link to="/se/tasks" className="text-sm text-steel-blue hover:underline font-medium">Map Subtasks &rarr;</Link>
                    </div>
                    {assignedTasks.length === 0 ? (
                        <p className="text-gray-500 italic text-sm py-4">No tasks assigned to you currently.</p>
                    ) : (
                        <ul className="space-y-3">
                            {assignedTasks.filter(t => !t.parentTaskId).slice(0, 5).map(task => (
                                <li key={task.id} className="flex flex-col bg-gray-50 p-3 rounded border border-gray-100">
                                    <div className="flex justify-between">
                                        <p className="font-semibold text-sm text-gray-800 truncate">{task.name}</p>
                                        <span className="text-xs font-bold text-gray-500">{task.projectId?.name || 'Unknown'}</span>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-400">
                                        Workers: {task.assignedWorkers?.length || 0}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SEDashboard;
