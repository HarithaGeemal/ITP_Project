import React, { useState } from 'react';
import { usePMContext } from '../../context/PMContext';
import useAxios from '../../hooks/useAxios';
import { toast } from 'react-toastify';

const RiskAssessmentForm = () => {
    const { projects } = usePMContext();
    const axiosClient = useAxios();

    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [autoFillData, setAutoFillData] = useState(null);
    const [autoFillLoading, setAutoFillLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submissions, setSubmissions] = useState([]);

    // PM-entered fields
    const [formData, setFormData] = useState({
        equipmentUnits: '',
        materialCostUSD: '',
        startConstraint: '',
        resourceConstraintScore: 0.5,
        siteConstraintScore: 0.5,
        dependencyCount: '',
    });

    // Fetch auto-fill data when project is selected
    const handleProjectSelect = async (projectId) => {
        setSelectedProjectId(projectId);
        setAutoFillData(null);

        if (!projectId) return;

        setAutoFillLoading(true);
        try {
            const { data } = await axiosClient.get(`/risk-assessments/autofill/${projectId}`);
            if (data.success) {
                setAutoFillData(data.autoFill);
                // Pre-fill material cost from project budget
                setFormData(prev => ({
                    ...prev,
                    materialCostUSD: data.autoFill.budget || '',
                }));
            }
        } catch (err) {
            toast.error('Failed to load project data');
            console.error(err);
        } finally {
            setAutoFillLoading(false);
        }
    };

    // Fetch existing submissions for this project
    const fetchSubmissions = async (projectId) => {
        try {
            const { data } = await axiosClient.get(`/risk-assessments/project/${projectId}`);
            if (data.success) setSubmissions(data.assessments);
        } catch (err) { console.error(err); }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProjectId || !autoFillData) {
            toast.error('Please select a project first');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                projectId: selectedProjectId,
                projectTimeline: autoFillData.projectTimeline,
                labourCount: autoFillData.labourCount,
                averageWeather: autoFillData.averageWeather,
                equipmentUnits: parseInt(formData.equipmentUnits) || 1,
                materialCostUSD: parseFloat(formData.materialCostUSD) || 0,
                startConstraint: parseInt(formData.startConstraint) || 0,
                resourceConstraintScore: parseFloat(formData.resourceConstraintScore),
                siteConstraintScore: parseFloat(formData.siteConstraintScore),
                dependencyCount: parseInt(formData.dependencyCount) || 0,
            };

            const { data } = await axiosClient.post('/risk-assessments', payload);
            if (data.success) {
                toast.success('Risk assessment submitted successfully!');
                // Reset form
                setFormData({
                    equipmentUnits: '',
                    materialCostUSD: '',
                    startConstraint: '',
                    resourceConstraintScore: 0.5,
                    siteConstraintScore: 0.5,
                    dependencyCount: '',
                });
                await fetchSubmissions(selectedProjectId);
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            toast.error('Failed to submit: ' + msg);
        } finally {
            setSubmitting(false);
        }
    };

    // Load submissions when project changes
    React.useEffect(() => {
        if (selectedProjectId) fetchSubmissions(selectedProjectId);
        else setSubmissions([]);
    }, [selectedProjectId]);

    return (
        <div className="p-6 min-h-full">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-steel-blue">Risk Assessment</h1>
                <p className="text-concrete mt-1">Submit risk assessment data for your projects. The Admin will run the ML analysis.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left — Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-concrete-light p-6">
                        {/* Project Selector */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Project</label>
                            <select
                                value={selectedProjectId}
                                onChange={(e) => handleProjectSelect(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-steel-blue/20 focus:border-steel-blue bg-white"
                                required
                            >
                                <option value="">— Choose a project —</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Auto-filled data display */}
                        {autoFillLoading && (
                            <div className="mb-6 text-center py-8 text-gray-400 animate-pulse">
                                Loading project data...
                            </div>
                        )}

                        {autoFillData && !autoFillLoading && (
                            <>
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                                        Auto-Filled from Project Data
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                                            <p className="text-xs font-medium text-blue-600 mb-1">Project Timeline</p>
                                            <p className="text-2xl font-bold text-blue-800">{autoFillData.projectTimeline}</p>
                                            <p className="text-xs text-blue-500">days</p>
                                        </div>
                                        <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                                            <p className="text-xs font-medium text-emerald-600 mb-1">Labour Count</p>
                                            <p className="text-2xl font-bold text-emerald-800">{autoFillData.labourCount}</p>
                                            <p className="text-xs text-emerald-500">active workers</p>
                                        </div>
                                        <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                                            <p className="text-xs font-medium text-amber-600 mb-1">Avg Weather</p>
                                            <p className="text-2xl font-bold text-amber-800">{autoFillData.averageWeather}</p>
                                            <p className="text-xs text-amber-500">weather score</p>
                                        </div>
                                    </div>
                                </div>

                                {/* PM-entered fields */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Enter Additional Parameters</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Units</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.equipmentUnits}
                                                onChange={(e) => handleChange('equipmentUnits', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-steel-blue/20 focus:border-steel-blue"
                                                placeholder="e.g. 5"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Material Cost (USD)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.materialCostUSD}
                                                onChange={(e) => handleChange('materialCostUSD', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-steel-blue/20 focus:border-steel-blue"
                                                placeholder="e.g. 50000"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Constraint (days)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.startConstraint}
                                                onChange={(e) => handleChange('startConstraint', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-steel-blue/20 focus:border-steel-blue"
                                                placeholder="e.g. 10"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Dependency Count</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.dependencyCount}
                                                onChange={(e) => handleChange('dependencyCount', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-steel-blue/20 focus:border-steel-blue"
                                                placeholder="e.g. 3"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Sliders */}
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Resource Constraint Score: <span className="font-bold text-steel-blue">{formData.resourceConstraintScore}</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.01"
                                                value={formData.resourceConstraintScore}
                                                onChange={(e) => handleChange('resourceConstraintScore', e.target.value)}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-steel-blue"
                                            />
                                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                                <span>Low (0)</span>
                                                <span>High (1)</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Site Constraint Score: <span className="font-bold text-steel-blue">{formData.siteConstraintScore}</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.01"
                                                value={formData.siteConstraintScore}
                                                onChange={(e) => handleChange('siteConstraintScore', e.target.value)}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-steel-blue"
                                            />
                                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                                <span>Low (0)</span>
                                                <span>High (1)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg hover:shadow-xl ${
                                        submitting
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-steel-blue hover:bg-steel-blue/90'
                                    }`}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Risk Assessment'}
                                </button>
                            </>
                        )}

                        {!selectedProjectId && (
                            <div className="text-center py-12 text-gray-400">
                                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <p className="text-sm">Select a project to begin the risk assessment.</p>
                            </div>
                        )}
                    </form>
                </div>

                {/* Right — Previous Submissions */}
                <div>
                    <div className="bg-white rounded-xl shadow-sm border border-concrete-light p-6">
                        <h2 className="text-lg font-bold text-steel-blue mb-4">Previous Submissions</h2>
                        <div className="space-y-3">
                            {submissions.length === 0 ? (
                                <p className="text-center text-gray-400 text-sm py-4">No submissions yet for this project.</p>
                            ) : (
                                submissions.map(s => (
                                    <div key={s._id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-gray-500">
                                                {new Date(s.createdAt).toLocaleDateString()}
                                            </span>
                                            {s.riskResult?.riskLevel ? (
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                    s.riskResult.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                                                    s.riskResult.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                    {s.riskResult.riskLevel}
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600">
                                            Timeline: {s.projectTimeline}d · Workers: {s.labourCount} · Cost: ${s.materialCostUSD?.toLocaleString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* How it works */}
                    <div className="bg-gradient-to-br from-steel-blue to-steel-blue/80 rounded-xl p-6 text-white mt-6">
                        <h3 className="font-bold mb-3">🤖 How Risk Analysis Works</h3>
                        <ol className="text-sm space-y-2 text-white/90">
                            <li className="flex gap-2">
                                <span className="font-bold text-amber shrink-0">1.</span>
                                <span>Select a project — timeline, labour, and weather are auto-filled.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-amber shrink-0">2.</span>
                                <span>Fill in the remaining parameters and submit.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-amber shrink-0">3.</span>
                                <span>The Admin reviews and runs ML prediction to determine risk level.</span>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiskAssessmentForm;
