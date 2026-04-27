import React, { useState } from 'react';
import { useSOContext } from '../../context/SOContext';

// Fields from safetyIncident.js model:
// incidentDate (required), incidentType (required), location (required), description (required),
// severity (required), injuryReported, affectedPersons, immediateActionTaken, followUpAction,
// status (Open|Under Investigation|Resolved|Closed), requiresImmediateAttention

const INCIDENT_TYPES = ['Near Miss', 'Injury', 'Equipment Accident', 'Fire Hazard', 'Unsafe Act', 'Other'];
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['Open', 'Under Investigation', 'Resolved', 'Closed'];

const severityColors = {
    'Low': 'bg-green-100 text-green-800 border-green-300',
    'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'High': 'bg-orange-100 text-orange-800 border-orange-300',
    'Critical': 'bg-red-100 text-red-800 border-red-300',
};

const statusColors = {
    'Open': 'bg-red-100 text-red-800',
    'Under Investigation': 'bg-yellow-100 text-yellow-800',
    'Resolved': 'bg-blue-100 text-blue-800',
    'Closed': 'bg-gray-100 text-gray-600',
};

const SOIncidents = () => {
    const { activeProjectId, safetyIncidents, createIncident, updateIncident, deleteIncident } = useSOContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentIncident, setCurrentIncident] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const emptyForm = {
        incidentDate: new Date().toISOString().split('T')[0],
        incidentType: 'Near Miss',
        location: '',
        description: '',
        severity: 'Medium',
        injuryReported: false,
        affectedPersons: 0,
        immediateActionTaken: '',
        followUpAction: '',
        status: 'Open',
        requiresImmediateAttention: false
    };

    const [formData, setFormData] = useState(emptyForm);

    const openModal = (incident = null) => {
        if (incident) {
            setCurrentIncident(incident);
            setFormData({
                incidentDate: incident.incidentDate ? new Date(incident.incidentDate).toISOString().split('T')[0] : '',
                incidentType: incident.incidentType,
                location: incident.location,
                description: incident.description,
                severity: incident.severity,
                injuryReported: incident.injuryReported || false,
                affectedPersons: incident.affectedPersons || 0,
                immediateActionTaken: incident.immediateActionTaken || '',
                followUpAction: incident.followUpAction || '',
                status: incident.status,
                requiresImmediateAttention: incident.requiresImmediateAttention || false
            });
        } else {
            setCurrentIncident(null);
            setFormData(emptyForm);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => { setIsModalOpen(false); setCurrentIncident(null); };

    const handleChange = (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData(prev => ({ ...prev, [e.target.name]: val }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        if (!formData.incidentDate || !formData.incidentType || !formData.location.trim() || !formData.description.trim() || !formData.severity) {
            return alert('Date, Type, Location, Description, and Severity are required.');
        }
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                affectedPersons: Number(formData.affectedPersons) || 0,
            };
            if (currentIncident) await updateIncident(activeProjectId, currentIncident.id, payload);
            else await createIncident(activeProjectId, payload);
            closeModal();
        } catch (error) {
            const msg = error?.response?.data?.message || 'Failed to save incident.';
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        const deleteReason = prompt('Enter reason for deletion:');
        if (!deleteReason) return;
        try { await deleteIncident(activeProjectId, id, deleteReason); }
        catch (e) { alert('Failed to delete.'); }
    };

    if (!activeProjectId) return <div className="p-12 text-center text-gray-500">Please select a project.</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Safety Incidents</h1>
                    <p className="text-sm text-gray-500 mt-1">Track and manage all safety incidents on site.</p>
                </div>
                <button onClick={() => openModal()} className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 transition font-medium">
                    + Log Incident
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {safetyIncidents.map(inc => (
                    <div key={inc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col hover:shadow-md transition-shadow relative">
                        {inc.requiresImmediateAttention && (
                            <div className="absolute top-0 right-0 bg-red-600 text-white text-xs px-3 py-1 font-bold rounded-bl-lg">⚠ URGENT</div>
                        )}
                        <div className="flex justify-between items-start mb-3 pr-16">
                            <div>
                                <h3 className="text-base font-bold text-gray-800">{inc.incidentType}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {new Date(inc.incidentDate).toLocaleDateString()} — {inc.location}
                                </p>
                            </div>
                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium border ml-2 ${severityColors[inc.severity]}`}>{inc.severity}</span>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{inc.description}</p>

                        <div className="grid grid-cols-3 gap-2 text-xs bg-gray-50 p-2 rounded border border-gray-100 mb-3">
                            <div><span className="font-semibold text-gray-700 block">Status</span>
                                <span className={`px-1.5 py-0.5 rounded font-medium ${statusColors[inc.status]}`}>{inc.status}</span>
                            </div>
                            <div><span className="font-semibold text-gray-700 block">Injury</span>{inc.injuryReported ? 'Yes' : 'No'}</div>
                            <div><span className="font-semibold text-gray-700 block">Affected</span>{inc.affectedPersons || 0} persons</div>
                        </div>

                        {inc.immediateActionTaken && (
                            <div className="mb-2">
                                <p className="text-xs font-bold text-gray-600">Immediate Action:</p>
                                <p className="text-xs text-gray-500">{inc.immediateActionTaken}</p>
                            </div>
                        )}
                        {inc.followUpAction && (
                            <div className="mb-2">
                                <p className="text-xs font-bold text-gray-600">Follow-up:</p>
                                <p className="text-xs text-gray-500">{inc.followUpAction}</p>
                            </div>
                        )}

                        <p className="text-xs text-gray-400 mt-auto">Reported by: {inc.reportedBy?.name || 'Unknown'}</p>

                        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={() => openModal(inc)} className="text-sm font-medium text-blue-600 hover:underline">Edit</button>
                            <button onClick={() => handleDelete(inc.id)} className="text-sm font-medium text-red-500 hover:underline">Delete</button>
                        </div>
                    </div>
                ))}
                {safetyIncidents.length === 0 && (
                    <div className="col-span-2 text-center py-16 bg-white border border-gray-200 rounded-xl">
                        <p className="text-lg font-medium text-gray-500">No incidents logged.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">{currentIncident ? 'Edit Incident' : 'Log Incident'}</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                                    <input type="date" name="incidentDate" value={formData.incidentDate} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Incident Type <span className="text-red-500">*</span></label>
                                    <select name="incidentType" value={formData.incidentType} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2">
                                        {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location <span className="text-red-500">*</span></label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="2" required className="w-full border border-gray-300 rounded px-3 py-2" />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Severity <span className="text-red-500">*</span></label>
                                    <select name="severity" value={formData.severity} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2">
                                        {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2">
                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Affected Persons</label>
                                    <input type="number" name="affectedPersons" value={formData.affectedPersons} onChange={handleChange} min="0" className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Immediate Action Taken</label>
                                <textarea name="immediateActionTaken" value={formData.immediateActionTaken} onChange={handleChange} rows="2" className="w-full border border-gray-300 rounded px-3 py-2" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Follow-Up Action</label>
                                <textarea name="followUpAction" value={formData.followUpAction} onChange={handleChange} rows="2" className="w-full border border-gray-300 rounded px-3 py-2" />
                            </div>

                            <div className="flex gap-6 bg-gray-50 border border-gray-200 p-3 rounded">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                                    <input type="checkbox" name="injuryReported" checked={formData.injuryReported} onChange={handleChange} className="rounded text-red-600" />
                                    Injury Reported
                                </label>
                                <label className="flex items-center gap-2 text-sm font-medium text-red-700 cursor-pointer">
                                    <input type="checkbox" name="requiresImmediateAttention" checked={formData.requiresImmediateAttention} onChange={handleChange} className="rounded text-red-600" />
                                    Requires Immediate Attention
                                </label>
                            </div>
                        </form>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                            <button type="button" onClick={closeModal} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
                            <button type="button" onClick={handleSubmit} disabled={submitting} className={`px-4 py-2 text-white rounded font-medium ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>{submitting ? 'Saving...' : 'Save Incident'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SOIncidents;
