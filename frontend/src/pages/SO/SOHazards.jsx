import React, { useState } from 'react';
import { useSOContext } from '../../context/SOContext';

// Exact enums from backend model: hazardReport.js
const statusOptions = ['Open', 'Controlled', 'Closed'];

const statusColors = {
    'Open': 'bg-red-100 text-red-800 border-red-300',
    'Controlled': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Closed': 'bg-gray-100 text-gray-600 border-gray-300',
};

const SOHazards = () => {
    const { activeProjectId, hazardReports, createHazard, updateHazard, deleteHazard } = useSOContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentHazard, setCurrentHazard] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Fields from hazardReport.js model: title, description, controlActions, dueDate, status
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        controlActions: '',
        dueDate: '',
        status: 'Open'
    });

    const openModal = (hazard = null) => {
        if (hazard) {
            setCurrentHazard(hazard);
            setFormData({
                title: hazard.title || '',
                description: hazard.description || '',
                controlActions: hazard.controlActions || '',
                dueDate: hazard.dueDate ? new Date(hazard.dueDate).toISOString().split('T')[0] : '',
                status: hazard.status || 'Open'
            });
        } else {
            setCurrentHazard(null);
            setFormData({ title: '', description: '', controlActions: '', dueDate: '', status: 'Open' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => { setIsModalOpen(false); setCurrentHazard(null); };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        if (!formData.title.trim() || !formData.description.trim() || !formData.controlActions.trim()) {
            return alert('Title, Description, and Control Actions are required.');
        }
        setSubmitting(true);
        try {
            const payload = { ...formData };
            if (!payload.dueDate) delete payload.dueDate;

            if (currentHazard) await updateHazard(activeProjectId, currentHazard.id, payload);
            else await createHazard(activeProjectId, payload);
            closeModal();
        } catch (error) {
            const msg = error?.response?.data?.message || 'Failed to save hazard report.';
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        const deleteReason = prompt('Enter reason for deletion:');
        if (!deleteReason) return;
        try { await deleteHazard(activeProjectId, id, deleteReason); }
        catch (e) { alert('Failed to delete.'); }
    };

    if (!activeProjectId) return <div className="p-12 text-center text-gray-500">Please select a project.</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Hazard Reports</h1>
                    <p className="text-sm text-gray-500 mt-1">Identify and track workplace hazards with control actions.</p>
                </div>
                <button onClick={() => openModal()} className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 transition font-medium">
                    + Report Hazard
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hazardReports.map(hazard => (
                    <div key={hazard.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-base font-bold text-gray-800 pr-2">{hazard.title}</h3>
                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium border whitespace-nowrap ${statusColors[hazard.status]}`}>
                                {hazard.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{hazard.description}</p>
                        <div className="bg-orange-50 border border-orange-100 rounded p-3 mb-3">
                            <p className="text-xs font-bold text-orange-700 mb-1">Control Actions:</p>
                            <p className="text-sm text-orange-800">{hazard.controlActions}</p>
                        </div>
                        {hazard.dueDate && (
                            <p className="text-xs text-gray-500 mb-2"><strong>Due:</strong> {new Date(hazard.dueDate).toLocaleDateString()}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-auto">Reported by: {hazard.reportedBy?.name || 'Unknown'}</p>
                        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={() => openModal(hazard)} className="text-sm font-medium text-blue-600 hover:underline">Edit</button>
                            <button onClick={() => handleDelete(hazard.id)} className="text-sm font-medium text-red-500 hover:underline">Delete</button>
                        </div>
                    </div>
                ))}
                {hazardReports.length === 0 && (
                    <div className="col-span-3 text-center py-16 bg-white border border-gray-200 rounded-xl">
                        <p className="text-lg font-medium text-gray-500">No hazard reports submitted.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">{currentHazard ? 'Edit Hazard Report' : 'Report Hazard'}</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-red-500 focus:border-red-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" required className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-red-500 focus:border-red-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Control Actions <span className="text-red-500">*</span></label>
                                <textarea name="controlActions" value={formData.controlActions} onChange={handleChange} rows="3" required placeholder="Describe actions taken to control this hazard..." className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-red-500 focus:border-red-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                    <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2">
                                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        </form>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                            <button type="button" onClick={closeModal} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
                            <button type="button" onClick={handleSubmit} disabled={submitting} className={`px-4 py-2 text-white rounded font-medium ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>{submitting ? 'Saving...' : 'Save Report'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SOHazards;
