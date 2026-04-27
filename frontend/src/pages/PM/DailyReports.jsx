import React, { useState } from 'react';
import { usePMContext } from '../../context/PMContext';

const DailyReports = () => {
    const { dailyReports, projects, tasks } = usePMContext();
    const [filterProject, setFilterProject] = useState('All');
    const [filterTask, setFilterTask] = useState('All');
    const [expandedId, setExpandedId] = useState(null);

    // Stats
    const stats = {
        total: dailyReports.length,
        totalWorkers: dailyReports.reduce((sum, r) => sum + (Number(r.workerCount) || 0), 0),
        projects: [...new Set(dailyReports.map(r => r.projectId))].length,
        latest: dailyReports.sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.date || '—',
    };

    const getProjectName = (id) => projects.find(p => p.id === id)?.name || id;

    // Filter by project and task
    const filtered = dailyReports
        .filter(r => filterProject === 'All' || r.projectId === filterProject)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const weatherIcon = (weather = '') => {
        if (weather.toLowerCase().includes('rain')) return '🌧️';
        if (weather.toLowerCase().includes('cloud') || weather.toLowerCase().includes('overcast')) return '☁️';
        if (weather.toLowerCase().includes('sun') || weather.toLowerCase().includes('clear')) return '☀️';
        return '🌤️';
    };

    return (
        <div className="p-6 bg-concrete-light min-h-full">
            {/* Header — no Add button for PM */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-steel-blue">Daily Log & Reports</h1>
                    <p className="text-sm text-concrete mt-1">{stats.total} reports across {stats.projects} projects — latest: {stats.latest}</p>
                    <p className="text-xs text-gray-400 mt-0.5 italic">Reports are submitted by Site Engineers. This is a read-only view.</p>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Reports', value: stats.total, color: 'border-steel-blue text-steel-blue' },
                    { label: 'Projects Covered', value: stats.projects, color: 'border-blue-400 text-blue-600' },
                    { label: 'Worker Logs', value: stats.totalWorkers, color: 'border-green-400 text-green-600' },
                    { label: 'Latest Report', value: stats.latest, color: 'border-amber text-amber' },
                ].map(s => (
                    <div key={s.label} className={`bg-white rounded-lg p-4 border-l-4 ${s.color} shadow-sm`}>
                        <p className="text-xs text-concrete uppercase font-medium">{s.label}</p>
                        <p className={`text-xl font-bold ${s.color.split(' ')[1]} mt-1`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Project Filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
                <button onClick={() => setFilterProject('All')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${filterProject === 'All' ? 'bg-steel-blue text-white border-steel-blue' : 'bg-white text-concrete border-concrete-light hover:border-steel-blue hover:text-steel-blue'}`}>
                    All Projects
                </button>
                {projects.map(p => (
                    <button key={p.id} onClick={() => setFilterProject(p.id)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition truncate max-w-[200px] ${filterProject === p.id ? 'bg-steel-blue text-white border-steel-blue' : 'bg-white text-concrete border-concrete-light hover:border-steel-blue hover:text-steel-blue'}`}>
                        {p.name}
                    </button>
                ))}
            </div>

            {/* Reports Grid — read-only cards with expandable details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                {filtered.map((report, index) => {
                    const reportKey = `report-${index}`;
                    return (
                    <div key={reportKey} className="bg-white rounded-xl shadow-sm border border-concrete-light p-5 flex flex-col hover:shadow-md transition-shadow cursor-pointer"
                         onClick={() => setExpandedId(expandedId === reportKey ? null : reportKey)}>
                        {/* Date Header */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-steel-blue/10 text-steel-blue rounded-lg p-2.5 text-center min-w-[52px]">
                                <div className="text-xs font-bold uppercase">
                                    {new Date(report.date).toLocaleString('default', { month: 'short' })}
                                </div>
                                <div className="text-2xl font-bold leading-none">
                                    {new Date(report.date).getDate()}
                                </div>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-800">{getProjectName(report.projectId)}</p>
                                <p className="text-xs text-concrete">by {report.submittedBy}</p>
                            </div>
                        </div>

                        {/* Weather */}
                        {report.weather && (
                            <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 mb-3">
                                <span className="text-lg">{weatherIcon(report.weather)}</span>
                                <span className="text-sm text-blue-800 font-medium">{report.weather}</span>
                            </div>
                        )}

                        {/* Work Completed */}
                        <div className="mb-3">
                            <span className="text-xs text-concrete uppercase font-medium block mb-1">Work Completed</span>
                            <p className={`text-sm text-gray-700 ${expandedId === reportKey ? '' : 'line-clamp-3'}`}>{report.workCompleted}</p>
                        </div>

                        {/* Expanded Details */}
                        {expandedId === reportKey && (
                            <div className="space-y-3 border-t border-concrete-light pt-3 mt-1">
                                {report.delaysOrRisks && (
                                    <div>
                                        <span className="text-xs text-red-600 uppercase font-medium block mb-1">Delays / Risks</span>
                                        <p className="text-sm text-gray-700 bg-red-50 p-2 rounded">{report.delaysOrRisks}</p>
                                    </div>
                                )}
                                {report.notes && (
                                    <div>
                                        <span className="text-xs text-concrete uppercase font-medium block mb-1">Planned Next Steps</span>
                                        <p className="text-sm text-gray-600">{report.notes}</p>
                                    </div>
                                )}
                                {report.materialsUsed && (
                                    <div>
                                        <span className="text-xs text-concrete uppercase font-medium block mb-1">Materials Used</span>
                                        <p className="text-xs text-gray-600">{report.materialsUsed}</p>
                                    </div>
                                )}
                                {report.equipmentOnSite && report.equipmentOnSite.length > 0 && (
                                    <div>
                                        <span className="text-xs text-concrete uppercase font-medium block mb-1">Equipment On Site</span>
                                        <div className="flex flex-wrap gap-1">
                                            {report.equipmentOnSite.map((eq, i) => (
                                                <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">{eq}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex justify-between pt-3 mt-auto border-t border-concrete-light text-xs">
                            <span className="text-concrete">👷 {report.workerCount || 0} workers</span>
                            <span className="text-steel-blue font-medium">{expandedId === reportKey ? 'Click to collapse ▲' : 'Click to expand ▼'}</span>
                        </div>
                    </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="col-span-3 text-center py-16 text-concrete">
                        <p className="text-lg font-medium">No reports found for this project.</p>
                        <p className="text-sm mt-2">Daily reports are submitted by Site Engineers.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyReports;
