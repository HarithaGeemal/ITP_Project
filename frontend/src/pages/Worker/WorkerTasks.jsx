import React, { useState } from 'react';
import { useWorkerContext } from '../../context/WorkerContext';

const Layers = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
const Calendar = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const Briefcase = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;

const WorkerTasks = () => {
    const { assignedTasks, assignedSubtasks, isLoading, requestSubtaskCompletion, startSubtask } = useWorkerContext();
    const [activeTab, setActiveTab] = useState('subtasks');

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading tasks...</div>;
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="p-6 md:p-8 bg-slate-50/50 min-h-full">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Tasks</h1>
                        <p className="text-slate-500 mt-2 font-medium">Review your assigned work across all active projects.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl w-max">
                    <button 
                        onClick={() => setActiveTab('subtasks')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                            activeTab === 'subtasks' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Action Items ({assignedSubtasks.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('tasks')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                            activeTab === 'tasks' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Main Tasks ({assignedTasks.length})
                    </button>
                </div>

                {/* View Container */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    
                    {activeTab === 'subtasks' && (
                        <div className="divide-y divide-slate-100">
                            {assignedSubtasks.length === 0 ? (
                                <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                                    <Layers className="w-12 h-12 text-slate-300 mb-4" />
                                    <p className="text-lg font-bold text-slate-700">No Action Items</p>
                                    <p>You have no pending subtasks assigned at the moment.</p>
                                </div>
                            ) : (
                                assignedSubtasks.map(sub => (
                                    <div key={sub._id} className="p-6 hover:bg-slate-50 transition-colors group">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            <div className="space-y-2 flex-grow">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-bold text-slate-800">{sub.name}</h3>
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wide ${
                                                        sub.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                                                        sub.status === 'Review' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {sub.status}
                                                    </span>
                                                </div>
                                                <p className="text-slate-600 leading-relaxed text-sm max-w-3xl">{sub.description}</p>
                                                
                                                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-2">
                                                    <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                                                        <Briefcase className="w-3.5 h-3.5" />
                                                        {sub.projectId?.name || 'Project'}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        Due: {formatDate(sub.endDate)}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Action Button Section */}
                                            <div className="flex-shrink-0 mt-4 md:mt-0 flex flex-col items-end gap-2">
                                                {sub.ptw && (
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded border ${
                                                        sub.ptw.status === 'Approved' ? 'bg-green-100 text-green-800 border-green-300' :
                                                        sub.ptw.status === 'Denied' ? 'bg-red-100 text-red-800 border-red-300' :
                                                        'bg-yellow-100 text-yellow-800 border-yellow-300'
                                                    }`}>
                                                        PTW: {sub.ptw.status}
                                                    </span>
                                                )}
                                                
                                                {sub.completionRequested ? (
                                                    <div className="px-4 py-2 bg-amber-50 text-amber-700 text-sm font-bold rounded-lg border border-amber-200">
                                                        Pending SE Review
                                                    </div>
                                                ) : sub.status === 'Completed' ? (
                                                    <div className="px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-lg border border-emerald-200">
                                                        Completed
                                                    </div>
                                                ) : sub.status === 'In Progress' ? (
                                                    <button 
                                                        onClick={() => {
                                                            if(window.confirm("Submit completion request to Site Engineer?")) {
                                                                requestSubtaskCompletion(sub._id)
                                                                    .catch(err => alert(err.response?.data?.message || "Failed to request completion"));
                                                            }
                                                        }}
                                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
                                                    >
                                                        Request Completion
                                                    </button>
                                                ) : sub.status === 'Not Started' || sub.status === 'Pending' ? (() => {
                                                    const canStart = sub.ptw && sub.ptw.status === 'Approved';
                                                    return (
                                                        <button 
                                                            onClick={() => {
                                                                if(window.confirm("Start work on this subtask?")) {
                                                                    startSubtask(sub._id).catch(err => alert(err.response?.data?.message || "Failed to start subtask"));
                                                                }
                                                            }}
                                                            disabled={!canStart}
                                                            title={canStart ? "Start work" : "A Permit to Work must be requested and approved by the Safety Officer before you can start."}
                                                            className={`px-4 py-2 text-white text-sm font-bold rounded-lg shadow-sm transition-colors ${
                                                                canStart ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                                                            }`}
                                                        >
                                                            Start Work
                                                        </button>
                                                    );
                                                })() : null}
                                            </div>

                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'tasks' && (
                        <div className="divide-y divide-slate-100">
                            {assignedTasks.length === 0 ? (
                                <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                                    <Layers className="w-12 h-12 text-slate-300 mb-4" />
                                    <p className="text-lg font-bold text-slate-700">No Main Tasks</p>
                                    <p>You have no main tasks associated with your profile.</p>
                                </div>
                            ) : (
                                assignedTasks.map(task => (
                                    <div key={task._id} className="p-6 hover:bg-slate-50 transition-colors group">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            <div className="space-y-2 flex-grow">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-bold text-slate-800">{task.name}</h3>
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wide ${
                                                        task.priority === 'High' || task.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                                                        'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {task.priority || 'Normal'} Priority
                                                    </span>
                                                </div>
                                                <p className="text-slate-600 leading-relaxed text-sm max-w-3xl">{task.description}</p>
                                                
                                                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-2">
                                                    <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                                                        <Briefcase className="w-3.5 h-3.5" />
                                                        {task.projectId?.name || 'Project'}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        Due: {formatDate(task.endDate)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default WorkerTasks;
