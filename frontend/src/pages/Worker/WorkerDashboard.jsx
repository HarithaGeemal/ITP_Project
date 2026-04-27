import React from 'react';
import { useWorkerContext } from '../../context/WorkerContext';

const Briefcase = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const ListTodo = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const Activity = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;

const WorkerDashboard = () => {
    const { stats, assignedTasks, assignedSubtasks, isLoading } = useWorkerContext();

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center p-6 text-slate-500">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                    <p className="font-medium animate-pulse">Loading workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 bg-slate-50/50 min-h-full">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Worker Dashboard</h1>
                    <p className="text-slate-500 mt-2 font-medium">Welcome to your workspace. Here is an overview of your active assignments.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Active Projects</p>
                            <p className="text-4xl font-black text-slate-800">{stats.projectsCount}</p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                            <Briefcase className="w-7 h-7" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Main Tasks</p>
                            <p className="text-4xl font-black text-slate-800">{stats.tasksCount}</p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                            <ListTodo className="w-7 h-7" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Subtasks</p>
                            <p className="text-4xl font-black text-slate-800">{stats.subtasksCount}</p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-violet-50 flex items-center justify-center text-violet-500">
                            <Activity className="w-7 h-7" />
                        </div>
                    </div>
                </div>

                {/* Recent Assignments Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Subtasks */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">Recent Action Items</h3>
                        </div>
                        <div className="p-2 flex-grow">
                            {assignedSubtasks.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">No active subtasks assigned.</div>
                            ) : (
                                <ul className="divide-y divide-slate-50">
                                    {assignedSubtasks.slice(0, 5).map(sub => (
                                        <li key={sub._id} className="p-4 hover:bg-slate-50 rounded-xl transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-slate-800">{sub.name}</p>
                                                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{sub.description}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                                            {sub.projectId?.name || 'Project'}
                                                        </span>
                                                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                                                            sub.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                            {sub.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Main Tasks */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">Associated Main Tasks</h3>
                        </div>
                        <div className="p-2 flex-grow">
                            {assignedTasks.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">No main tasks assigned.</div>
                            ) : (
                                <ul className="divide-y divide-slate-50">
                                    {assignedTasks.slice(0, 5).map(task => (
                                        <li key={task._id} className="p-4 hover:bg-slate-50 rounded-xl transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-slate-800">{task.name}</p>
                                                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{task.description}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                                            {task.projectId?.name || 'Project'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WorkerDashboard;
