import React, { useState } from 'react';
import { useSEContext } from '../../context/SEContext';

const SEDailyReports = () => {
    const { dailyReports, addDailyReport, updateDailyReport, deleteDailyReport, projects, tasks } = useSEContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentReport, setCurrentReport] = useState(null);
    const [filterProject, setFilterProject] = useState('All');

    const [formData, setFormData] = useState({
        projectId: '', date: '', summary: '', workCompleted: '', weather: '',
        notes: '', delaysOrRisks: ''
    });

    const stats = {
        total: dailyReports.length,
        projects: [...new Set(dailyReports.map(r => r.projectId))].length,
        latest: dailyReports.sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.date || '—',
    };

    const getProjectName = (id) => projects.find(p => p.id === id)?.name || id;

    const filtered = dailyReports
        .filter(r => filterProject === 'All' || r.projectId === filterProject)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const openModal = (report = null) => {
        if (report) {
            setCurrentReport(report);
            setFormData({
                projectId: report.projectId,
                date: report.date,
                summary: report.summary || '',
                workCompleted: report.workCompleted || '',
                weather: report.weather || '',
                notes: report.notes || '',
                delaysOrRisks: report.delaysOrRisks || '',
            });
        } else {
            setCurrentReport(null);
            setFormData({
                projectId: projects[0]?.id || '',
                date: new Date().toISOString().split('T')[0],
                summary: '', workCompleted: '', weather: '', notes: '', delaysOrRisks: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => { setIsModalOpen(false); setCurrentReport(null); };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation 5: Date cannot be in the future
        if (formData.date) {
            const selectedDate = new Date(formData.date);
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            if (selectedDate > today) {
                return alert('Validation Error: Daily report date cannot be in the future.');
            }
        }

        if (currentReport) updateDailyReport(currentReport.id, formData);
        else addDailyReport(formData);
        closeModal();
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this report?')) deleteDailyReport(id);
    };

    const weatherIcon = (weather = '') => {
        if (weather.toLowerCase().includes('rain')) return '🌧️';
        if (weather.toLowerCase().includes('cloud') || weather.toLowerCase().includes('overcast')) return '☁️';
        if (weather.toLowerCase().includes('sun') || weather.toLowerCase().includes('clear')) return '☀️';
        return '🌤️';
    };

    return (
        <div className="p-6 bg-concrete-light min-h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-emerald-800">Daily Reports</h1>
                    <p className="text-sm text-concrete mt-1">{stats.total} reports across {stats.projects} projects — latest: {stats.latest}</p>
                </div>
                <button onClick={() => openModal()} className="bg-emerald-600 text-white px-4 py-2 rounded shadow hover:bg-emerald-700 transition flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    New Daily Report
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Total Reports', value: stats.total, color: 'border-emerald-500 text-emerald-700' },
                    { label: 'Projects Covered', value: stats.projects, color: 'border-blue-400 text-blue-600' },
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
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${filterProject === 'All' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-concrete border-concrete-light hover:border-emerald-500'}`}>
                    All Projects
                </button>
                {projects.map(p => (
                    <button key={p.id} onClick={() => setFilterProject(p.id)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition truncate max-w-[200px] ${filterProject === p.id ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-concrete border-concrete-light hover:border-emerald-500'}`}>
                        {p.name}
                    </button>
                ))}
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(report => (
                    <div key={report.id} className="bg-white rounded-xl shadow-sm border border-concrete-light p-5 flex flex-col hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-emerald-50 text-emerald-700 rounded-lg p-2.5 text-center min-w-[52px]">
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

                        {report.weather && (
                            <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 mb-3">
                                <span className="text-lg">{weatherIcon(report.weather)}</span>
                                <span className="text-sm text-blue-800 font-medium">{report.weather}</span>
                            </div>
                        )}

                        <div className="mb-3">
                            <span className="text-xs text-concrete uppercase font-medium block mb-1">Executive Summary</span>
                            <p className="text-sm text-gray-800 font-medium line-clamp-2">{report.summary}</p>
                        </div>

                        <div className="mb-3">
                            <span className="text-xs text-concrete uppercase font-medium block mb-1">Detailed Work Completed</span>
                            <p className="text-sm text-gray-700 line-clamp-3">{report.workCompleted}</p>
                        </div>

                        {report.delaysOrRisks && (
                            <div className="mb-3">
                                <span className="text-xs text-red-600 uppercase font-medium block mb-1">Delays / Risks</span>
                                <p className="text-xs text-gray-600 bg-red-50 p-2 rounded">{report.delaysOrRisks}</p>
                            </div>
                        )}

                        {report.notes && (
                            <div className="mb-3">
                                <span className="text-xs text-concrete uppercase font-medium block mb-1">Next Steps</span>
                                <p className="text-xs text-gray-600">{report.notes}</p>
                            </div>
                        )}

                        <div className="mt-auto pt-3 border-t border-concrete-light flex justify-end space-x-3">
                            <button onClick={() => openModal(report)} className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">Edit</button>
                            <button onClick={() => handleDelete(report.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-3 text-center py-16 text-concrete">
                        <p className="text-lg font-medium">No reports yet.</p>
                        <p className="text-sm mt-2">Click "New Daily Report" to create your first one.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-emerald-50">
                            <h3 className="text-lg font-semibold text-emerald-800">{currentReport ? 'Edit Report' : 'New Daily Report'}</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                                    <select name="projectId" value={formData.projectId} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2">
                                        <option value="">Select Project</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Weather Condition</label>
                                    <input type="text" name="weather" placeholder="e.g. Clear, 28°C" value={formData.weather} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Executive Summary *</label>
                                <textarea name="summary" value={formData.summary} onChange={handleChange} rows="2" required className="w-full border border-gray-300 rounded px-3 py-2 font-medium" placeholder="Brief executive summary of the day's progress..." />
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Detailed Work Completed *</label>
                                <textarea name="workCompleted" value={formData.workCompleted} onChange={handleChange} rows="4" required className="w-full border border-gray-300 rounded px-3 py-2" placeholder="List the specific tasks and work completed today..." />
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Delays / Risks</label>
                                <textarea name="delaysOrRisks" value={formData.delaysOrRisks} onChange={handleChange} rows="2" className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Any delays, blockers, or risks encountered..." />
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Planned Next Steps</label>
                                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" className="w-full border border-gray-300 rounded px-3 py-2" placeholder="What's planned for tomorrow..." />
                            </div>
                        </form>
                        <div className="px-6 py-4 border-t bg-emerald-50 flex justify-end space-x-3">
                            <button type="button" onClick={closeModal} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
                            <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-medium">
                                {currentReport ? 'Update Report' : 'Submit Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SEDailyReports;
