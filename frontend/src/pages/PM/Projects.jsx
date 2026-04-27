import React, { useState } from 'react';
import { usePMContext } from '../../context/PMContext';

const statusColors = {
    'Active': 'bg-blue-100 text-blue-800',
    'Planning': 'bg-yellow-100 text-yellow-800',
    'Completed': 'bg-green-100 text-green-800',
    'On Hold': 'bg-gray-100 text-gray-800',
};

const Projects = () => {
    const { projects, addProject, updateProject, deleteProject, availableUsers } = usePMContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [currentProject, setCurrentProject] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');
    const [formErrors, setFormErrors] = useState({});

    const [formData, setFormData] = useState({
        name: '', location: '', startDate: '', estimatedEndDate: '',
        budget: '', status: 'Planning', plannedBudget: '',
        clientName: '', projectCode: '', description: '',
        assignedSiteEngineers: [], assignedStoreKeepers: [],
        assignedSafetyOfficers: []
    });

    // Stats derived from dummy data
    const stats = {
        total: projects.length,
        inProgress: projects.filter(p => p.status === 'Active').length,
        planning: projects.filter(p => p.status === 'Planning').length,
        completed: projects.filter(p => p.status === 'Completed').length,
        onHold: projects.filter(p => p.status === 'On Hold').length,
        avgProgress: projects.length
            ? Math.round(projects.reduce((s, p) => s + (p.progress || 0), 0) / projects.length)
            : 0,
    };

    const filtered = filterStatus === 'All'
        ? projects
        : projects.filter(p => p.status === filterStatus);

    const openModal = (project = null) => {
        setFormErrors({});
        if (project) {
            setCurrentProject(project);
            setFormData({
                ...project,
                assignedSiteEngineers: project.assignedSiteEngineers || [],
                assignedStoreKeepers: project.assignedStoreKeepers || [],
                assignedSafetyOfficers: project.assignedSafetyOfficers || []
            });
        }
        else {
            setCurrentProject(null);
            setFormData({ name: '', location: '', startDate: '', estimatedEndDate: '', budget: '', status: 'Planning', plannedBudget: '', clientName: '', projectCode: '', description: '', assignedSiteEngineers: [], assignedStoreKeepers: [], assignedSafetyOfficers: [] });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => { setIsModalOpen(false); setCurrentProject(null); setFormErrors({}); };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field when user types
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleToggleAssignment = (field, userId) => {
        setFormData(prev => {
            const current = prev[field] || [];
            const exists = current.includes(userId);
            return {
                ...prev,
                [field]: exists
                    ? current.filter(id => id !== userId)
                    : [...current, userId]
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormErrors({});
        const errors = {};

        // Frontend validations
        const codeRegex = /^[A-Za-z0-9-_]+$/;
        if (formData.projectCode && !codeRegex.test(formData.projectCode)) {
            errors.projectCode = 'Project Code must be alphanumeric (dashes and underscores allowed, no spaces).';
        }

        if (formData.startDate && formData.estimatedEndDate) {
            if (new Date(formData.estimatedEndDate) <= new Date(formData.startDate)) {
                errors.estimatedEndDate = 'Estimated End Date must be after the Start Date.';
            }
        }
        if (formData.budget && Number(formData.budget) < 0) {
            errors.budget = 'Budget cannot be negative.';
        }
        if (formData.plannedBudget && Number(formData.plannedBudget) < 0) {
            errors.plannedBudget = 'Planned Budget cannot be negative.';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        let backendError;
        if (currentProject) {
            backendError = await updateProject(currentProject.id, formData);
        } else {
            backendError = await addProject(formData);
        }

        if (backendError) {
            setFormErrors({ _general: backendError });
            return;
        }
        closeModal();
    };

    const handleDeleteRequest = (id) => {
        setProjectToDelete(id);
    };

    const confirmDelete = () => {
        if (projectToDelete) {
            deleteProject(projectToDelete);
            setProjectToDelete(null);
        }
    };

    // Inline error component
    const FieldError = ({ field }) => {
        const error = formErrors[field];
        if (!error) return null;
        return <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
        </p>;
    };

    return (
        <div className="p-6 bg-concrete-light min-h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-steel-blue">Projects Management</h1>
                    <p className="text-sm text-concrete mt-1">{stats.total} projects total &mdash; {stats.inProgress} active</p>
                </div>
                <button onClick={() => openModal()} className="bg-steel-blue text-white px-4 py-2 rounded shadow hover:bg-steel-blue/90 transition flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Add New Project
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                {[
                    { label: 'Total', value: stats.total, color: 'border-steel-blue text-steel-blue' },
                    { label: 'Active', value: stats.inProgress, color: 'border-blue-400 text-blue-600' },
                    { label: 'Planning', value: stats.planning, color: 'border-yellow-400 text-yellow-600' },
                    { label: 'Completed', value: stats.completed, color: 'border-green-400 text-green-600' },
                    { label: 'On Hold', value: stats.onHold, color: 'border-gray-400 text-gray-600' },
                    { label: 'Avg Progress', value: `${stats.avgProgress}%`, color: 'border-amber text-amber' },
                ].map(s => (
                    <div key={s.label} className={`bg-white rounded-lg p-4 border-l-4 ${s.color} shadow-sm`}>
                        <p className="text-xs text-concrete uppercase font-medium">{s.label}</p>
                        <p className={`text-2xl font-bold ${s.color.split(' ')[1]}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {['All', 'In Progress', 'Planning', 'Completed', 'On Hold'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${filterStatus === status ? 'bg-steel-blue text-white border-steel-blue' : 'bg-white text-concrete border-concrete-light hover:border-steel-blue hover:text-steel-blue'}`}
                    >{status}</button>
                ))}
            </div>

            {/* Project Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(project => (
                    <div key={project.id} className="bg-white rounded-xl shadow-sm border border-concrete-light p-5 flex flex-col hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <span className="text-xs text-concrete font-mono">{project.id}</span>
                                <h2 className="text-lg font-bold text-gray-800 mt-0.5">{project.name}</h2>
                            </div>
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${statusColors[project.status] || 'bg-gray-100 text-gray-700'}`}>
                                {project.status}
                            </span>
                        </div>

                        <p className="text-sm text-concrete flex items-center gap-1.5 mb-3">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {project.location}
                        </p>

                        <p className="text-xs text-gray-500 line-clamp-2 mb-4">{project.description}</p>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
                            <div>
                                <span className="text-xs text-concrete block">Manager</span>
                                <span className="font-medium text-gray-800">{project.projectManager}</span>
                            </div>
                            <div>
                                <span className="text-xs text-concrete block">Engineer</span>
                                <span className="font-medium text-gray-800">{project.siteEngineer}</span>
                            </div>
                            <div>
                                <span className="text-xs text-concrete block">Start Date</span>
                                <span className="font-medium text-gray-800">{project.startDate}</span>
                            </div>
                            <div>
                                <span className="text-xs text-concrete block">Est. End Date</span>
                                <span className="font-medium text-gray-800">{project.estimatedEndDate}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-xs text-concrete block">Budget</span>
                                <span className="font-bold text-steel-blue">${Number(project.budget).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-auto">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium text-concrete">Progress</span>
                                <span className="font-bold text-steel-blue">{project.progress}%</span>
                            </div>
                            <div className="w-full bg-concrete-light rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all ${project.progress === 100 ? 'bg-green-500' : 'bg-steel-blue'}`}
                                    style={{ width: `${project.progress}%` }}
                                />
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-concrete-light flex justify-end space-x-3">
                            <button onClick={() => openModal(project)} className="text-steel-blue hover:text-steel-blue/80 text-sm font-medium">Edit</button>
                            <button onClick={() => handleDeleteRequest(project.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-3 text-center py-16 text-concrete">
                        <p className="text-lg font-medium">No projects found for this filter.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-20 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">{currentProject ? 'Edit Project' : 'Add New Project'}</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>

                        {/* General backend error */}
                        {formErrors._general && (
                            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                {formErrors._general}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-steel-blue/30 focus:border-steel-blue outline-none" />
                                    <FieldError field="name" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-steel-blue/30 focus:border-steel-blue outline-none" />
                                    <FieldError field="location" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                    <FieldError field="startDate" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Est. End Date</label>
                                    <input type="date" name="estimatedEndDate" value={formData.estimatedEndDate} onChange={handleChange} required className={`w-full border rounded px-3 py-2 ${formErrors.estimatedEndDate ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                                    <FieldError field="estimatedEndDate" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                                    <input type="number" name="budget" value={formData.budget} onChange={handleChange} className={`w-full border rounded px-3 py-2 ${formErrors.budget ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                                    <FieldError field="budget" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Planned Budget ($)</label>
                                    <input type="number" name="plannedBudget" value={formData.plannedBudget || ''} onChange={handleChange} className={`w-full border rounded px-3 py-2 ${formErrors.plannedBudget ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} placeholder="Optional" />
                                    <FieldError field="plannedBudget" />
                                </div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-steel-blue/30 focus:border-steel-blue outline-none">
                                        <option value="Planning">Planning</option>
                                        <option value="Active">Active</option>
                                        <option value="On Hold">On Hold</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label><input type="text" name="clientName" value={formData.clientName || ''} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-steel-blue/30 focus:border-steel-blue outline-none" placeholder="Optional" /></div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Code</label>
                                    <input
                                        type="text"
                                        name="projectCode"
                                        value={formData.projectCode || ''}
                                        onChange={handleChange}
                                        disabled={!!currentProject}
                                        className={`w-full border rounded px-3 py-2 focus:ring-2 focus:ring-steel-blue/30 focus:border-steel-blue outline-none ${currentProject
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60 border-gray-200'
                                                : formErrors.projectCode ? 'border-red-400 bg-red-50' : 'border-gray-300'
                                            }`}
                                        placeholder={currentProject ? 'Cannot edit' : 'Optional'}
                                    />
                                    {currentProject && <p className="text-xs text-gray-400 mt-1 italic">Project Code cannot be changed after creation.</p>}
                                    <FieldError field="projectCode" />
                                </div>

                                <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                                    <h4 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">Team Assignments</h4>
                                    {!!currentProject && <p className="text-xs text-orange-500 mb-3">⚠ Assignments are set at creation. Edit is disabled.</p>}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Site Engineers */}
                                        <div className="border border-gray-200 rounded-lg bg-gray-50/50 p-3">
                                            <label className="block text-xs font-bold text-steel-blue uppercase tracking-wider mb-2">Site Engineers</label>
                                            <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                                {availableUsers?.filter(u => u.role === 'SITE_ENGINEER').length === 0 ? (
                                                    <p className="text-xs text-gray-400 italic">No engineers available</p>
                                                ) : availableUsers?.filter(u => u.role === 'SITE_ENGINEER').map((u, i) => (
                                                    <label key={`se-${u.id}-${i}`} className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${formData.assignedSiteEngineers.includes(String(u.id)) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100'} ${!!currentProject ? 'opacity-50 pointer-events-none' : ''}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.assignedSiteEngineers.includes(String(u.id))}
                                                            onChange={() => handleToggleAssignment('assignedSiteEngineers', String(u.id))}
                                                            disabled={!!currentProject}
                                                            className="rounded border-gray-300 text-steel-blue focus:ring-steel-blue"
                                                        />
                                                        <div className="min-w-0">
                                                            <span className="text-sm font-medium text-gray-800 block truncate">{u.name}</span>
                                                            <span className="text-[10px] text-gray-400">{u.status}</span>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Safety Officers */}
                                        <div className="border border-gray-200 rounded-lg bg-gray-50/50 p-3">
                                            <label className="block text-xs font-bold text-amber uppercase tracking-wider mb-2">Safety Officers</label>
                                            <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                                {availableUsers?.filter(u => u.role === 'SAFETY_OFFICER').length === 0 ? (
                                                    <p className="text-xs text-gray-400 italic">No officers available</p>
                                                ) : availableUsers?.filter(u => u.role === 'SAFETY_OFFICER').map((u, i) => (
                                                    <label key={`so-${u.id}-${i}`} className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${formData.assignedSafetyOfficers.includes(String(u.id)) ? 'bg-amber-50 border border-amber-200' : 'hover:bg-gray-100'} ${!!currentProject ? 'opacity-50 pointer-events-none' : ''}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.assignedSafetyOfficers.includes(String(u.id))}
                                                            onChange={() => handleToggleAssignment('assignedSafetyOfficers', String(u.id))}
                                                            disabled={!!currentProject}
                                                            className="rounded border-gray-300 text-amber focus:ring-amber"
                                                        />
                                                        <div className="min-w-0">
                                                            <span className="text-sm font-medium text-gray-800 block truncate">{u.name}</span>
                                                            <span className="text-[10px] text-gray-400">{u.status}</span>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Store Keepers */}
                                        <div className="border border-gray-200 rounded-lg bg-gray-50/50 p-3">
                                            <label className="block text-xs font-bold text-green-700 uppercase tracking-wider mb-2">Store Keepers</label>
                                            <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                                {availableUsers?.filter(u => u.role === 'STORE_KEEPER').length === 0 ? (
                                                    <p className="text-xs text-gray-400 italic">No keepers available</p>
                                                ) : availableUsers?.filter(u => u.role === 'STORE_KEEPER').map((u, i) => (
                                                    <label key={`sk-${u.id}-${i}`} className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${formData.assignedStoreKeepers.includes(String(u.id)) ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-100'} ${!!currentProject ? 'opacity-50 pointer-events-none' : ''}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.assignedStoreKeepers.includes(String(u.id))}
                                                            onChange={() => handleToggleAssignment('assignedStoreKeepers', String(u.id))}
                                                            disabled={!!currentProject}
                                                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                        />
                                                        <div className="min-w-0">
                                                            <span className="text-sm font-medium text-gray-800 block truncate">{u.name}</span>
                                                            <span className="text-[10px] text-gray-400">{u.status}</span>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" required className="w-full border border-gray-300 rounded px-3 py-2" />
                            </div>
                        </form>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
                            <button type="button" onClick={closeModal} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
                            <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-steel-blue text-white rounded hover:bg-steel-blue/90 font-medium">Save Project</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {projectToDelete && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Project</h3>
                        <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this project? This action cannot be undone.</p>
                        <div className="flex justify-center space-x-3">
                            <button onClick={() => setProjectToDelete(null)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium w-full">Cancel</button>
                            <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium w-full">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
