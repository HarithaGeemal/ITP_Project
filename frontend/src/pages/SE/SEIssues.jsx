import React, { useState, useEffect, useCallback } from 'react';
import { useSEContext } from '../../context/SEContext';
import useAxios from '../../hooks/useAxios';

const priorityColors = {
    Critical: 'bg-red-100 text-red-800 border-red-300',
    High: 'bg-orange-100 text-orange-800 border-orange-300',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Low: 'bg-green-100 text-green-800 border-green-300',
};

const statusColors = {
    'Open': 'bg-red-100 text-red-800',
    'Assigned': 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    'Resolved': 'bg-emerald-100 text-emerald-800',
    'Closed': 'bg-gray-200 text-gray-600',
};

const typeOptions = ['Defect', 'Safety', 'Material Shortage', 'Design Request', 'Other'];
const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

const SEIssues = () => {
    const { projects, assignedTasks } = useSEContext();
    const axiosClient = useAxios();

    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIssue, setEditingIssue] = useState(null);
    const [filter, setFilter] = useState('all');

    const [formData, setFormData] = useState({
        title: '', description: '', type: 'Defect', priority: 'Medium',
        severity: 'Medium', reportedLocation: '', taskId: '', projectId: ''
    });

    const fetchAllIssues = useCallback(async () => {
        setLoading(true);
        try {
            const allIssues = [];
            for (const project of projects) {
                const pId = project._id || project.id;
                try {
                    const { data } = await axiosClient.get(`/projects/${pId}/issues`);
                    if (data.success) {
                        allIssues.push(...data.issues.map(i => ({
                            ...i, id: i._id,
                            projectName: project.name || 'Unknown',
                            projectIdStr: pId,
                        })));
                    }
                } catch (err) {
                    console.error(`Failed to fetch issues for project ${pId}`, err);
                }
            }
            allIssues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setIssues(allIssues);
        } finally {
            setLoading(false);
        }
    }, [projects, axiosClient]);

    useEffect(() => {
        if (projects.length > 0) fetchAllIssues();
    }, [projects, fetchAllIssues]);

    const mainTasks = assignedTasks.filter(t => !t.parentTaskId);

    const openCreateModal = () => {
        setEditingIssue(null);
        setFormData({
            title: '', description: '', type: 'Defect', priority: 'Medium',
            severity: 'Medium', reportedLocation: '', taskId: '', projectId: projects[0]?._id || projects[0]?.id || ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (issue) => {
        setEditingIssue(issue);
        setFormData({
            title: issue.title || '',
            description: issue.description || '',
            type: issue.type || 'Defect',
            priority: issue.priority || 'Medium',
            severity: issue.severity || 'Medium',
            reportedLocation: issue.reportedLocation || '',
            taskId: issue.taskId?._id || issue.taskId || '',
            projectId: issue.projectIdStr || '',
        });
        setIsModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const pId = formData.projectId;
        if (!pId) { alert('Please select a project.'); return; }

        const payload = {
            title: formData.title,
            description: formData.description,
            type: formData.type,
            priority: 'Medium', // Default priority, PM can change it later
            severity: formData.severity,
            reportedLocation: formData.reportedLocation || undefined,
            taskId: formData.taskId || undefined,
        };

        try {
            if (editingIssue) {
                const { data } = await axiosClient.put(`/projects/${pId}/issues/${editingIssue._id}`, payload);
                if (data.success) {
                    alert('Issue updated successfully.');
                    await fetchAllIssues();
                    setIsModalOpen(false);
                }
            } else {
                const { data } = await axiosClient.post(`/projects/${pId}/issues`, payload);
                if (data.success) {
                    alert('Issue reported successfully. It will appear in the PM Dashboard.');
                    await fetchAllIssues();
                    setIsModalOpen(false);
                }
            }
        } catch (error) {
            console.error('Issue submission failed', error);
            alert(error.response?.data?.message || 'Failed to submit issue');
        }
    };

    const handleDelete = async (issueId, projectId) => {
        if (!window.confirm("Are you sure you want to delete this issue?")) return;
        try {
            const { data } = await axiosClient.delete(`/projects/${projectId}/issues/${issueId}`);
            if (data.success) {
                alert("Issue deleted successfully");
                await fetchAllIssues();
            }
        } catch (error) {
            alert(error.response?.data?.message || "Failed to delete issue");
        }
    };

    const filteredIssues = filter === 'all' ? issues : issues.filter(i => i.status === filter);

    // Get tasks for selected project
    const projectTasks = formData.projectId
        ? mainTasks.filter(t => {
            const tPid = typeof t.projectId === 'object' ? (t.projectId._id || t.projectId) : t.projectId;
            return tPid === formData.projectId;
          })
        : [];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Issue Reporting</h1>
                    <p className="text-sm text-gray-500 mt-1">Report defects, safety hazards, and other on-site issues. All reports are visible to the Project Manager.</p>
                </div>
                <button onClick={openCreateModal} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow-sm font-medium transition-colors">
                    + Report Issue
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {['all', 'Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${filter === f ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {f === 'all' ? 'All' : f}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-500">Loading issues...</div>
            ) : filteredIssues.length === 0 ? (
                <div className="bg-white rounded-xl shadow border border-gray-200 p-16 text-center text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900">No Issues Found</h3>
                    <p className="mt-1">{filter === 'all' ? 'No issues have been reported yet.' : `No issues with status "${filter}".`}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredIssues.map(issue => (
                        <div key={issue._id} className="bg-white rounded-xl shadow border border-gray-200 p-5 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0 mr-4">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <h3 className="text-base font-bold text-gray-800">{issue.title}</h3>
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[issue.status] || 'bg-gray-100 text-gray-700'}`}>{issue.status}</span>
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded border ${priorityColors[issue.priority] || 'bg-gray-100'}`}>{issue.priority}</span>
                                        <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded font-medium">{issue.type}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{issue.description}</p>
                                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
                                        <div><span className="font-semibold text-gray-700">Project:</span> {issue.projectName}</div>
                                        {issue.taskId?.name && <div><span className="font-semibold text-gray-700">Task:</span> {issue.taskId.name}</div>}
                                        {issue.reportedLocation && <div><span className="font-semibold text-gray-700">Location:</span> {issue.reportedLocation}</div>}
                                        <div><span className="font-semibold text-gray-700">Reported:</span> {new Date(issue.createdAt).toLocaleDateString()}</div>
                                        {issue.assignedTo?.name && <div><span className="font-semibold text-gray-700">Assigned To:</span> {issue.assignedTo.name}</div>}
                                        {issue.resolutionNote && <div><span className="font-semibold text-gray-700">Resolution:</span> {issue.resolutionNote}</div>}
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    {(issue.status === 'Open' || issue.status === 'Assigned') && (
                                        <>
                                            <button onClick={() => openEditModal(issue)} className="text-steel-blue hover:bg-steel-blue/10 px-3 py-1.5 rounded text-sm font-medium transition-colors border border-steel-blue/30">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(issue._id, issue.projectIdStr)} className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded text-sm font-medium transition-colors border border-red-200">
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Issue Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">{editingIssue ? 'Edit Issue' : 'Report New Issue'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            {!editingIssue && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                                    <select name="projectId" value={formData.projectId} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 bg-white">
                                        <option value="" disabled>Select project...</option>
                                        {projects.map(p => (
                                            <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Title</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Brief description of the issue" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" required className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Provide full details about the issue..." />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select name="type" value={formData.type} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 bg-white">
                                        {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                                    <select name="severity" value={formData.severity} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 bg-white">
                                        {priorityOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>



                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reported Location</label>
                                <input type="text" name="reportedLocation" value={formData.reportedLocation} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g., Building A - Level 3, Zone C" />
                            </div>

                            {!editingIssue && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Related Task (Optional)</label>
                                    <select name="taskId" value={formData.taskId} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 bg-white">
                                        <option value="">None — General Issue</option>
                                        {projectTasks.map(t => (
                                            <option key={t.id || t._id} value={t.id || t._id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </form>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
                            <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium">
                                {editingIssue ? 'Save Changes' : 'Submit Issue Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SEIssues;
