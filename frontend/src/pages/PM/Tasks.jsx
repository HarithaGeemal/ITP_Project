import React, { useState, useEffect } from 'react';
import { usePMContext } from '../../context/PMContext';
import useAxios from '../../hooks/useAxios';

const priorityColors = {
    Critical: 'bg-red-100 text-red-800 border-red-300',
    High: 'bg-orange-100 text-orange-800 border-orange-300',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Low: 'bg-green-100 text-green-800 border-green-300',
};

const statusColors = {
    'In Progress': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
    'Blocked': 'bg-red-100 text-red-800',
    'To Do': 'bg-gray-100 text-gray-700',
};

const Tasks = () => {
    const { tasks, addTask, updateTask, deleteTask, projects, workers } = usePMContext();
    const axiosClient = useAxios();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [currentTask, setCurrentTask] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterProject, setFilterProject] = useState('All');
    const [projectMembers, setProjectMembers] = useState([]);
    const [formErrors, setFormErrors] = useState({});

    const [formData, setFormData] = useState({
        projectId: '', name: '', description: '', assignedTo: [],
        assignedSiteEngineers: [], assignedStoreKeepers: [],
        startDate: '', endDate: '', status: 'To Do', priority: 'Medium'
    });

    // Get the selected project's timeline for display and validation
    const selectedProject = projects.find(p => p.id === formData.projectId);

    useEffect(() => {
        const fetchMembers = async () => {
            if (!formData.projectId) {
                setProjectMembers([]);
                return;
            }
            try {
                const { data } = await axiosClient.get(`/projects/${formData.projectId}`);
                if (data.success && data.project.members) {
                    setProjectMembers(data.project.members);
                }
            } catch (error) {
                console.error("Error fetching project members:", error);
            }
        };
        fetchMembers();
    }, [formData.projectId, axiosClient]);

    // Stats from dummy data
    const stats = {
        total: tasks.length,
        toDo: tasks.filter(t => t.status === 'To Do').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        completed: tasks.filter(t => t.status === 'Completed').length,
        blocked: tasks.filter(t => t.status === 'Blocked').length,
        critical: tasks.filter(t => t.priority === 'Critical').length,
    };

    // helpers
    const getProjectName = (id) => projects.find(p => p.id === id)?.name || id;
    const getWorkerNames = (ids) => {
        if (!ids || ids.length === 0) return 'Unassigned';
        return ids.map(id => workers.find(w => w.id === id)?.name || id).join(', ');
    };

    // filter
    const filtered = tasks.filter(t => {
        const matchStatus = filterStatus === 'All' || t.status === filterStatus;
        const matchProject = filterProject === 'All' || t.projectId === filterProject;
        return matchStatus && matchProject;
    });

    const openModal = (task = null) => {
        setFormErrors({});
        if (task) {
            setCurrentTask(task);
            setFormData({
                ...task,
                assignedTo: task.assignedTo || [],
                assignedSiteEngineers: task.assignedSiteEngineers || [],
                assignedStoreKeepers: task.assignedStoreKeepers || []
            });
        } else {
            setCurrentTask(null);
            setFormData({
                projectId: projects[0]?.id || '', name: '', description: '',
                assignedTo: [], assignedSiteEngineers: [], assignedStoreKeepers: [],
                startDate: '', endDate: '', status: 'To Do', priority: 'Medium'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => { setIsModalOpen(false); setCurrentTask(null); setFormErrors({}); };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'projectId' && formData.projectId !== value) {
            setFormData(prev => ({ ...prev, [name]: value, assignedTo: [], assignedSiteEngineers: [], assignedStoreKeepers: [] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleMultiSelectChange = (e) => {
        const value = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, assignedTo: value }));
    };

    const handleSEChange = (e) => {
        const value = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, assignedSiteEngineers: value }));
    };

    const handleSKChange = (e) => {
        const value = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, assignedStoreKeepers: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormErrors({});
        const errors = {};

        // Frontend validations
        if (formData.assignedTo && formData.assignedTo.length > 0) {
            const invalidWorkers = formData.assignedTo.some(workerId => {
                const w = workers.find(work => work.id === workerId);
                return w && w.projectId !== formData.projectId;
            });
            if (invalidWorkers) {
                errors.assignedTo = 'One or more assigned workers do not belong to the selected project.';
            }
        }

        if (formData.name && formData.name.trim().length < 3) {
            errors.name = 'Task Name must be at least 3 characters long.';
        }

        if (formData.startDate && formData.endDate) {
            if (new Date(formData.endDate) < new Date(formData.startDate)) {
                errors.endDate = 'End Date cannot be before the Start Date.';
            }
        }

        // Validate task dates are within project timeline
        if (selectedProject) {
            const projStart = new Date(selectedProject.startDate);
            const projEnd = new Date(selectedProject.estimatedEndDate);
            if (formData.startDate && new Date(formData.startDate) < projStart) {
                errors.startDate = `Start Date is before the project start date (${selectedProject.startDate}).`;
            }
            if (formData.startDate && new Date(formData.startDate) > projEnd) {
                errors.startDate = `Start Date is after the project end date (${selectedProject.estimatedEndDate}).`;
            }
            if (formData.endDate && new Date(formData.endDate) > projEnd) {
                errors.endDate = `End Date is after the project end date (${selectedProject.estimatedEndDate}).`;
            }
            if (formData.endDate && new Date(formData.endDate) < projStart) {
                errors.endDate = `End Date is before the project start date (${selectedProject.startDate}).`;
            }
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        let backendError;
        if (currentTask) {
            backendError = await updateTask(currentTask.id, formData);
        } else {
            backendError = await addTask(formData);
        }

        if (backendError) {
            setFormErrors({ _general: backendError });
            return;
        }
        closeModal();
    };

    const handleDeleteRequest = (id) => {
        setTaskToDelete(id);
    };

    const confirmDelete = () => {
        if (taskToDelete) {
            deleteTask(taskToDelete);
            setTaskToDelete(null);
        }
    };

    // Inline error component
    const FieldError = ({ field }) => {
        const error = formErrors[field];
        if (!error) return null;
        return <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
            {error}
        </p>;
    };

    return (
        <div className="p-6 bg-concrete-light min-h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-steel-blue">Task Management</h1>
                    <p className="text-sm text-concrete mt-1">{stats.total} tasks &mdash; {stats.inProgress} in progress, {stats.blocked} blocked</p>
                </div>
                <button onClick={() => openModal()} className="bg-steel-blue text-white px-4 py-2 rounded shadow hover:bg-steel-blue/90 transition flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Add New Task
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-6">
                {[
                    { label: 'Total', value: stats.total, color: 'border-steel-blue text-steel-blue' },
                    { label: 'To Do', value: stats.toDo, color: 'border-gray-400 text-gray-600' },
                    { label: 'In Progress', value: stats.inProgress, color: 'border-blue-400 text-blue-600' },
                    { label: 'Completed', value: stats.completed, color: 'border-green-400 text-green-600' },
                    { label: 'Blocked', value: stats.blocked, color: 'border-red-400 text-red-600' },
                    { label: 'Critical', value: stats.critical, color: 'border-orange-400 text-orange-600' },
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
                    {['All', 'To Do', 'In Progress', 'Blocked', 'Completed'].map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${filterStatus === s ? 'bg-steel-blue text-white border-steel-blue' : 'bg-white text-concrete border-concrete-light hover:border-steel-blue hover:text-steel-blue'}`}>
                            {s}
                        </button>
                    ))}
                </div>
                <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
                    className="ml-auto border border-concrete-light rounded px-3 py-1.5 text-sm text-concrete bg-white focus:outline-none focus:border-steel-blue">
                    <option value="All">All Projects</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>

            {/* Task Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(task => (
                    <div key={task.id} className="bg-white rounded-xl shadow-sm border border-concrete-light p-5 flex flex-col hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 pr-2">
                                <span className="text-xs text-concrete font-mono">{task.id}</span>
                                <h2 className="text-base font-bold text-gray-800 mt-0.5">{task.name}</h2>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full shrink-0 ${statusColors[task.status] || 'bg-gray-100 text-gray-700'}`}>{task.status}</span>
                        </div>

                        <p className="text-xs text-blue-600 font-medium mb-2">{getProjectName(task.projectId)}</p>
                        <p className="text-sm text-gray-500 flex-1 mb-4 line-clamp-2">{task.description}</p>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400 text-xs">Timeline</span>
                                <span className="text-gray-700 text-xs font-medium">{task.startDate} → {task.endDate}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-xs">Priority</span>
                                <span className={`px-2 py-0.5 text-xs font-bold rounded border ${priorityColors[task.priority] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>{task.priority}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 text-xs block mb-1">Assignees</span>
                                <div className="text-xs bg-gray-50 border border-gray-100 p-2 rounded text-gray-700">{getWorkerNames(task.assignedTo)}</div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-concrete-light flex justify-end space-x-3">
                            <button onClick={() => openModal(task)} className="text-steel-blue hover:text-steel-blue/80 text-sm font-medium">Edit</button>
                            <button onClick={() => handleDeleteRequest(task.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-3 text-center py-16 text-concrete">
                        <p className="text-lg font-medium">No tasks match the current filters.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">{currentTask ? 'Edit Task' : 'Add New Task'}</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>

                        {/* General backend error */}
                        {formErrors._general && (
                            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                                {formErrors._general}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className={`w-full border rounded px-3 py-2 ${formErrors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                                    <FieldError field="name" />
                                </div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                                    <select name="projectId" value={formData.projectId} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2">
                                        <option value="">Select Project</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                {/* Project Timeline Info Banner */}
                                {selectedProject && (
                                    <div className="col-span-1 md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
                                        <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <div className="text-sm">
                                            <span className="font-semibold text-blue-800">Project Timeline:</span>
                                            <span className="text-blue-700 ml-2">{selectedProject.startDate} → {selectedProject.estimatedEndDate}</span>
                                            <p className="text-xs text-blue-500 mt-0.5">Task dates must fall within this range.</p>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className={`w-full border rounded px-3 py-2 ${formErrors.startDate ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                                    <FieldError field="startDate" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className={`w-full border rounded px-3 py-2 ${formErrors.endDate ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                                    <FieldError field="endDate" />
                                </div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2">
                                        <option value="To Do">To Do</option><option value="In Progress">In Progress</option><option value="Blocked">Blocked</option><option value="Completed">Completed</option>
                                    </select>
                                </div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select name="priority" value={formData.priority} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2">
                                        <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="2" required className="w-full border border-gray-300 rounded px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Workers</label>
                                <select
                                    name="assignedTo" multiple value={formData.assignedTo} onChange={handleMultiSelectChange}
                                    className={`w-full border rounded px-3 py-2 h-20 ${formErrors.assignedTo ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} disabled={!formData.projectId}
                                >
                                    {workers.filter(w => w.projectId === formData.projectId).map(w => <option key={w.id} value={w.id}>{w.name} — {w.trade}</option>)}
                                </select>
                                {!formData.projectId && <p className="text-xs text-gray-400 mt-1">Select a project first.</p>}
                                <FieldError field="assignedTo" />
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Assign Site Engineers</label>
                                <select
                                    name="assignedSiteEngineers" multiple value={formData.assignedSiteEngineers} onChange={handleSEChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2 h-20" disabled={!formData.projectId}
                                >
                                    {projectMembers.filter(m => m.role === 'SITE_ENGINEER').map((m, i) => (
                                        <option key={`${m.userId?._id}-${i}`} value={String(m.userId?._id)}>{m.userId?.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Assign Store Keepers</label>
                                <select
                                    name="assignedStoreKeepers" multiple value={formData.assignedStoreKeepers} onChange={handleSKChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2 h-20" disabled={!formData.projectId}
                                >
                                    {projectMembers.filter(m => m.role === 'STORE_KEEPER').map((m, i) => (
                                        <option key={`${m.userId?._id}-${i}`} value={String(m.userId?._id)}>{m.userId?.name}</option>
                                    ))}
                                </select>
                            </div>
                        </form>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
                            <button type="button" onClick={closeModal} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
                            <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-steel-blue text-white rounded hover:bg-steel-blue/90 font-medium">Save Task</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {taskToDelete && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Task</h3>
                        <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
                        <div className="flex justify-center space-x-3">
                            <button onClick={() => setTaskToDelete(null)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium w-full">Cancel</button>
                            <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium w-full">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;
