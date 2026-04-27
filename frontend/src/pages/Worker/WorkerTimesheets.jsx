import React, { useState, useEffect } from 'react';
import useAxios from '../../hooks/useAxios';
import { useWorkerContext } from '../../context/WorkerContext';

const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Approved': 'bg-green-100 text-green-800 border-green-200',
    'Rejected': 'bg-red-100 text-red-800 border-red-200',
};

const WorkerTimesheets = () => {
    const axiosClient = useAxios();
    const { assignedProjects } = useWorkerContext();

    const [timesheets, setTimesheets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form state
    const [formProjectId, setFormProjectId] = useState('');
    const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
    const [formHours, setFormHours] = useState(8);
    const [formDescription, setFormDescription] = useState('');

    // Derive unique projects directly from assignedProjects
    const uniqueProjects = [];
    const seenProjects = new Set();
    
    if (assignedProjects && assignedProjects.length > 0) {
        assignedProjects.forEach(p => {
            const pId = typeof p === 'object' ? (p?._id || p?.id) : p;
            const pName = typeof p === 'object' ? p?.name : 'Unknown Project';
            
            if (pId && !seenProjects.has(pId)) {
                seenProjects.add(pId);
                uniqueProjects.push({ id: pId, name: pName });
            }
        });
    }

    const fetchTimesheets = async () => {
        try {
            setLoading(true);
            const { data } = await axiosClient.get('/worker/timesheets');
            if (data.success) setTimesheets(data.timesheets);
        } catch (err) {
            console.error("Error fetching timesheets:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTimesheets(); }, []);

    const resetForm = () => {
        setEditingId(null);
        setFormProjectId('');
        setFormDate(new Date().toISOString().split('T')[0]);
        setFormHours(8);
        setFormDescription('');
    };

    const openCreate = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEdit = (ts) => {
        setEditingId(ts._id);
        setFormProjectId(typeof ts.projectId === 'object' ? (ts.projectId?._id || ts.projectId) : ts.projectId);
        setFormDate(ts.date ? new Date(ts.date).toISOString().split('T')[0] : '');
        setFormHours(ts.hoursWorked);
        setFormDescription(ts.description);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formProjectId || !formDate || !formHours || !formDescription.trim()) {
            alert("All fields are required.");
            return;
        }

        try {
            if (editingId) {
                const { data } = await axiosClient.put(`/worker/timesheets/${editingId}`, {
                    date: formDate, hoursWorked: formHours, description: formDescription
                });
                if (data.success) {
                    alert("Timesheet updated.");
                    setIsModalOpen(false);
                    resetForm();
                    fetchTimesheets();
                }
            } else {
                const { data } = await axiosClient.post('/worker/timesheets', {
                    projectId: formProjectId, date: formDate, hoursWorked: formHours, description: formDescription
                });
                if (data.success) {
                    alert("Timesheet logged successfully!");
                    setIsModalOpen(false);
                    resetForm();
                    fetchTimesheets();
                }
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to save timesheet.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this timesheet entry?")) return;
        try {
            const { data } = await axiosClient.delete(`/worker/timesheets/${id}`);
            if (data.success) {
                alert("Timesheet deleted.");
                fetchTimesheets();
            }
        } catch (err) {
            alert(err.response?.data?.message || "Cannot delete.");
        }
    };

    // Weekly summary
    const totalHoursThisWeek = timesheets
        .filter(ts => {
            const d = new Date(ts.date);
            const now = new Date();
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            weekStart.setHours(0, 0, 0, 0);
            return d >= weekStart;
        })
        .reduce((sum, ts) => sum + ts.hoursWorked, 0);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Daily Timesheets</h1>
                    <p className="text-sm text-gray-500 mt-1">Log your daily working hours against assigned projects.</p>
                </div>
                <button onClick={openCreate} className="bg-steel-blue hover:bg-steel-blue/90 text-white px-4 py-2 rounded shadow-sm font-medium transition-colors">
                    + Log Hours
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
                    <div className="text-2xl font-bold text-steel-blue">{timesheets.length}</div>
                    <div className="text-xs text-gray-500 font-medium uppercase">Total Entries</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{totalHoursThisWeek}h</div>
                    <div className="text-xs text-gray-500 font-medium uppercase">This Week</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
                    <div className="text-2xl font-bold text-amber-600">{timesheets.filter(t => t.status === 'Pending').length}</div>
                    <div className="text-xs text-gray-500 font-medium uppercase">Pending Approval</div>
                </div>
            </div>

            {/* Timesheet List */}
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-16 text-center text-gray-400 animate-pulse">Loading timesheets...</div>
                ) : timesheets.length === 0 ? (
                    <div className="p-16 text-center text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <h3 className="text-lg font-medium text-gray-900">No Timesheets</h3>
                        <p className="mt-1">Start logging your daily hours.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Project</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Hours</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {timesheets.map(ts => (
                                <tr key={ts._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-3 whitespace-nowrap text-gray-800 font-medium">
                                        {new Date(ts.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-3 text-gray-600">{ts.projectId?.name || 'Unknown'}</td>
                                    <td className="px-6 py-3 font-bold text-gray-800">{ts.hoursWorked}h</td>
                                    <td className="px-6 py-3 text-gray-600 max-w-xs truncate">{ts.description}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${statusColors[ts.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                                            {ts.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        {ts.status === 'Pending' && (
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => openEdit(ts)} className="text-steel-blue hover:text-steel-blue/80 text-xs font-medium border border-steel-blue/30 rounded px-2 py-1 hover:bg-steel-blue/5 transition-colors">
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDelete(ts._id)} className="text-red-500 hover:text-red-700 text-xs font-medium border border-red-200 rounded px-2 py-1 hover:bg-red-50 transition-colors">
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                        {ts.status === 'Approved' && (
                                            <span className="text-xs text-gray-400">Approved by {ts.approvedBy?.name || 'SE'}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">{editingId ? 'Edit Timesheet' : 'Log Daily Hours'}</h3>
                            <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {!editingId && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                                    <select value={formProjectId} onChange={(e) => setFormProjectId(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 bg-white" required>
                                        <option value="" disabled>Select project...</option>
                                        {uniqueProjects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hours Worked</label>
                                <input type="number" min="0.5" max="24" step="0.5" value={formHours} onChange={(e) => setFormHours(Number(e.target.value))} className="w-full border border-gray-300 rounded px-3 py-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Work Description</label>
                                <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows="3" placeholder="Describe what you worked on today..." className="w-full border border-gray-300 rounded px-3 py-2" required />
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-steel-blue text-white rounded hover:bg-steel-blue/90 font-medium">
                                    {editingId ? 'Update Timesheet' : 'Log Hours'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkerTimesheets;
