import React, { useState } from 'react';
import { usePMContext } from '../../context/PMContext';

const statusColors = {
    Active: 'bg-green-100 text-green-800',
    'On Leave': 'bg-yellow-100 text-yellow-800',
    Inactive: 'bg-red-100 text-red-800',
};

const tradeIcons = {
    Plumber: '🔧',
    Electrician: '⚡',
    Carpenter: '🪚',
    Painter: '🖌️',
    Welder: '🔥',
    Mason: '🧱',
    Operator: '⚙️',
    'General Laborer': '🪛',
    Foreman: '👷',
    Supervisor: '🧑‍💼',
    Other: '👤',
};

const TRADES = ['Plumber', 'Electrician', 'Carpenter', 'Painter', 'Welder', 'Mason', 'Operator', 'General Laborer', 'Foreman', 'Supervisor', 'Other'];

const Workers = () => {
    const { workers, projects, availableUsers, addWorker, updateWorker, deleteWorker } = usePMContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentWorker, setCurrentWorker] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterProject, setFilterProject] = useState('All');

    // Filter available workers from context
    const availableSystemWorkers = availableUsers.filter(u => u.role === "WORKER");

    const [formData, setFormData] = useState({
        projectId: '', userId: '', name: '', trade: 'General Laborer', phone: '', nic: '', status: 'Active'
    });

    const stats = {
        total: workers.length,
        active: workers.filter(w => w.status === 'Active').length,
        onLeave: workers.filter(w => w.status === 'On Leave').length,
        inactive: workers.filter(w => w.status === 'Inactive').length,
    };

    const filtered = workers.filter(w => {
        const matchStatus = filterStatus === 'All' || w.status === filterStatus;
        const matchProject = filterProject === 'All' || w.projectId === filterProject;
        return matchStatus && matchProject;
    });

    const openModal = (worker = null) => {
        if (worker) {
            setCurrentWorker(worker);
            setFormData({
                projectId: worker.projectId || '',
                userId: worker.userId || '',
                name: worker.name || '',
                trade: worker.trade || 'General Laborer',
                phone: worker.phone || '',
                nic: worker.nic || '',
                status: worker.status || 'Active',
            });
        } else {
            setCurrentWorker(null);
            setFormData({
                projectId: projects[0]?.id || '',
                userId: '', name: '', trade: 'General Laborer', phone: '', nic: '', status: 'Active'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => { setIsModalOpen(false); setCurrentWorker(null); };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // If selecting a registered user, auto-populate details but allow override
        if (name === "userId" && value) {
            const selectedUser = availableSystemWorkers.find(u => u.id === value);
            if (selectedUser) {
                setFormData(prev => ({
                    ...prev,
                    userId: value,
                    name: selectedUser.name
                }));
                return;
            }
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validations
        const phoneRegex = /^[0-9]{10}$/;
        if (formData.phone && !phoneRegex.test(formData.phone)) {
            return alert('Validation Error: Phone number must be exactly 10 digits.');
        }

        const nicRegex = /^([0-9]{9}[xXvV]|[0-9]{12})$/;
        if (formData.nic && !nicRegex.test(formData.nic)) {
            return alert('Validation Error: NIC must be 9 digits followed by V/v/X/x or exactly 12 digits.');
        }

        if (currentWorker) updateWorker(currentWorker.id, formData);
        else addWorker(formData);
        closeModal();
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to remove this worker?')) deleteWorker(id);
    };

    return (
        <div className="p-6 bg-concrete-light min-h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-steel-blue">Worker Management</h1>
                    <p className="text-sm text-concrete mt-1">{stats.total} workers on roster &mdash; {stats.active} active</p>
                </div>
                <button onClick={() => openModal()} className="bg-steel-blue text-white px-4 py-2 rounded shadow hover:bg-steel-blue/90 transition flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Add New Worker
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Workforce', value: stats.total, color: 'border-steel-blue text-steel-blue' },
                    { label: 'Active', value: stats.active, color: 'border-green-400 text-green-600' },
                    { label: 'On Leave', value: stats.onLeave, color: 'border-yellow-400 text-yellow-600' },
                    { label: 'Inactive', value: stats.inactive, color: 'border-red-400 text-red-600' },
                ].map(s => (
                    <div key={s.label} className={`bg-white rounded-lg p-4 border-l-4 ${s.color} shadow-sm`}>
                        <p className="text-xs text-concrete uppercase font-medium">{s.label}</p>
                        <p className={`text-2xl font-bold ${s.color.split(' ')[1]}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3 mb-6 items-center">
                <div className="flex gap-2 flex-wrap">
                    {['All', 'Active', 'On Leave', 'Inactive'].map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${filterStatus === s ? 'bg-steel-blue text-white border-steel-blue' : 'bg-white text-concrete border-concrete-light hover:border-steel-blue hover:text-steel-blue'}`}>
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

            {/* Worker Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map(worker => (
                    <div key={worker.id} className="bg-white rounded-xl shadow-sm border border-concrete-light p-5 flex flex-col hover:shadow-md transition-shadow">
                        {/* Avatar + Name */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-12 w-12 rounded-full bg-steel-blue/10 text-steel-blue flex items-center justify-center text-xl font-bold shrink-0">
                                {(worker.name || '?').split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-base font-bold text-gray-800 truncate">{worker.name}</h2>
                                <span className="text-xs text-concrete font-mono">{worker.id}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-600 font-medium">{tradeIcons[worker.trade] || '👤'} {worker.trade}</span>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[worker.status] || 'bg-gray-100 text-gray-600'}`}>{worker.status}</span>
                        </div>

                        <div className="space-y-1.5 text-sm text-gray-600 flex-1">
                            {worker.projectName && (
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 shrink-0 text-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    <span className="text-blue-600 font-medium">{worker.projectName}</span>
                                </div>
                            )}
                            {worker.phone && (
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 shrink-0 text-concrete" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    <span>{worker.phone}</span>
                                </div>
                            )}
                            {worker.nic && (
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 shrink-0 text-concrete" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                                    <span>NIC: {worker.nic}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-concrete-light flex justify-end space-x-3">
                            <button onClick={() => openModal(worker)} className="text-steel-blue hover:text-steel-blue/80 text-sm font-medium">Edit</button>
                            <button onClick={() => handleDelete(worker.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-4 text-center py-16 text-concrete">
                        <p className="text-lg font-medium">No workers found.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">{currentWorker ? 'Edit Worker' : 'Add New Worker'}</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                                <select name="projectId" value={formData.projectId} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" disabled={!!currentWorker}>
                                    <option value="">Select Project</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            {!currentWorker && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Registered Worker</label>
                                    <select name="userId" value={formData.userId} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2">
                                        <option value="">-- Manual Entry (Unregistered) --</option>
                                        {availableSystemWorkers.map(w => (
                                            <option key={w.id} value={w.id}>{w.name} ({w.email})</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Select a registered worker account to link it automatically.</p>
                                </div>
                            )}
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" readOnly={!!formData.userId} /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Trade / Specialty</label>
                                <select name="trade" value={formData.trade} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2">
                                    {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label><input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Required if manual entry" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">NIC Number</label><input type="text" name="nic" value={formData.nic} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Optional" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2">
                                    <option value="Active">Active</option>
                                    <option value="On Leave">On Leave</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </form>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
                            <button type="button" onClick={closeModal} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
                            <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-steel-blue text-white rounded hover:bg-steel-blue/90 font-medium">Save Worker</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Workers;
