import React, { useState } from 'react';
import { useSOContext } from '../../context/SOContext';

const typeColors = {
    'Unsafe Condition': 'bg-orange-100 text-orange-800',
    'Unsafe Act': 'bg-red-100 text-red-800',
    'Environmental': 'bg-green-100 text-green-800',
    'Other': 'bg-gray-100 text-gray-800',
};

const severityColors = {
    Low: 'bg-green-100 text-green-800 border-green-300',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    High: 'bg-orange-100 text-orange-800 border-orange-300',
    Critical: 'bg-red-100 text-red-800 border-red-300',
};

const SOObservations = () => {
    const { activeProjectId, safetyObservations, tasks, createObservation, updateObservation, deleteObservation } = useSOContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentObservation, setCurrentObservation] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '', type: 'Unsafe Condition', severity: 'Medium', location: '',
        dueDate: '', status: 'Open', notes: '', taskId: ''
    });

    const openModal = (observation = null) => {
        if (observation) {
            setCurrentObservation(observation);
            setFormData({
                title: observation.title,
                type: observation.type,
                severity: observation.severity,
                location: observation.location,
                dueDate: observation.dueDate ? new Date(observation.dueDate).toISOString().split('T')[0] : '',
                status: observation.status,
                notes: observation.notes || '',
                taskId: observation.taskId?._id || observation.taskId || ''
            });
        } else {
            setCurrentObservation(null);
            setFormData({
                title: '', type: 'Unsafe Condition', severity: 'Medium', location: '',
                dueDate: '', status: 'Open', notes: '', taskId: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentObservation(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        try {
            const payload = { ...formData };
            if (!payload.taskId) delete payload.taskId;
            if (!payload.dueDate) delete payload.dueDate;

            if (currentObservation) {
                await updateObservation(activeProjectId, currentObservation.id, payload);
            } else {
                await createObservation(activeProjectId, payload);
            }
            closeModal();
            alert(`Observation ${currentObservation ? 'updated' : 'created'} successfully.`);
        } catch (error) {
            console.error(error);
            alert('Failed to save observation: ' + (error.response?.data?.message || 'Check connection.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        const reason = prompt("Enter deletion reason:");
        if (reason) {
            try {
                await deleteObservation(activeProjectId, id, reason);
                alert('Observation deleted.');
            } catch (error) {
                alert('Failed to delete observation.');
            }
        }
    };

    if (!activeProjectId) {
        return (
            <div className="flex justify-center items-center h-full p-12">
                <div className="text-gray-500 font-medium">Please select a project to view observations.</div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Safety Observations</h1>
                    <p className="text-sm text-gray-500 mt-1">Record and manage safety conditions on site.</p>
                </div>
                <button onClick={() => openModal()} className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 transition font-medium">
                    + New Observation
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {safetyObservations.map(obs => (
                    <div key={obs.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{obs.title}</h3>
                                <p className="text-xs text-gray-500">Reported by: {obs.reportedBy?.name || 'Unknown'}</p>
                            </div>
                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium border ${severityColors[obs.severity]}`}>{obs.severity}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                            <span className={`px-2 py-0.5 text-xs rounded font-medium ${typeColors[obs.type] || typeColors['Other']}`}>{obs.type}</span>
                            <span className={`px-2 py-0.5 text-xs rounded font-medium ${obs.status === 'Open' ? 'bg-red-100 text-red-800' : obs.status === 'Closed' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-800'}`}>
                                {obs.status}
                            </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-2 truncate"><strong>Location:</strong> {obs.location}</p>
                        {obs.taskId && (
                            <p className="text-sm text-gray-600 mb-2"><strong>Task:</strong> <span className="text-steel-blue font-medium">{obs.taskId?.name || 'Linked Task'}</span></p>
                        )}
                        {obs.dueDate && <p className="text-sm text-gray-600 mb-2 truncate"><strong>Due:</strong> {new Date(obs.dueDate).toLocaleDateString()}</p>}
                        
                        <p className="text-xs text-gray-500 line-clamp-2 mt-2 flex-grow">{obs.notes}</p>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={() => openModal(obs)} className="text-sm font-medium text-steel-blue hover:underline">Edit</button>
                            <button onClick={() => handleDelete(obs.id)} className="text-sm font-medium text-red-500 hover:underline">Delete</button>
                        </div>
                    </div>
                ))}

                {safetyObservations.length === 0 && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-white border border-gray-200 rounded-xl">
                        <p className="text-lg font-medium text-gray-500">No safety observations logged.</p>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">{currentObservation ? 'Edit Observation' : 'New Observation'}</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select name="type" value={formData.type} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2">
                                        <option value="Unsafe Condition">Unsafe Condition</option>
                                        <option value="Unsafe Act">Unsafe Act</option>
                                        <option value="Environmental">Environmental</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                                    <select name="severity" value={formData.severity} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2">
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Related Task (Optional)</label>
                                <select name="taskId" value={formData.taskId} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2">
                                    <option value="">-- No specific task --</option>
                                    {tasks.filter(t => t.status !== 'Completed' && t.status !== 'Cancelled').map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                    <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2">
                                        <option value="Open">Open</option>
                                        <option value="Resolved">Resolved</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                </div>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="w-full border border-gray-300 rounded px-3 py-2" />
                            </div>
                        </form>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                            <button type="button" onClick={closeModal} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
                            <button type="button" onClick={handleSubmit} disabled={submitting} className={`px-4 py-2 text-white rounded font-medium ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>{submitting ? 'Saving...' : 'Save Observation'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SOObservations;
