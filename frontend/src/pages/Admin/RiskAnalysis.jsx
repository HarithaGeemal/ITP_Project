import React, { useState } from 'react';
import { useAdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';

const RiskAnalysis = () => {
    const { riskAssessments, projects, deleteRiskAssessment, runPrediction, fetchRiskAssessments } = useAdminContext();
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [predictionLoading, setPredictionLoading] = useState(false);
    const [predictionResult, setPredictionResult] = useState(null);

    // Filter assessments by selected project
    const filteredAssessments = selectedProject
        ? riskAssessments.filter(a => (a.projectId?._id || a.projectId) === selectedProject)
        : riskAssessments;

    const handleSelectAssessment = (assessment) => {
        setSelectedAssessment(assessment);
        setPredictionResult(assessment.riskResult?.riskLevel ? assessment.riskResult : null);
    };

    const handleRunPrediction = async () => {
        if (!selectedAssessment) return;
        setPredictionLoading(true);
        try {
            const data = await runPrediction(selectedAssessment.id);
            setPredictionResult(data.predictions);
            toast.success('Risk analysis completed successfully!');
        } catch (err) {
            toast.error('Failed to run prediction: ' + err.message);
        } finally {
            setPredictionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this risk assessment?')) return;
        await deleteRiskAssessment(id);
        if (selectedAssessment?.id === id) {
            setSelectedAssessment(null);
            setPredictionResult(null);
        }
        toast.success('Risk assessment deleted');
    };

    const riskLevelStyle = (level) => {
        switch (level) {
            case 'High': return 'bg-red-100 text-red-700 border-red-300';
            case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-300';
            case 'Low': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
            default: return 'bg-gray-100 text-gray-600 border-gray-300';
        }
    };

    const riskGradient = (level) => {
        switch (level) {
            case 'High': return 'from-red-500 to-rose-600';
            case 'Medium': return 'from-amber-500 to-orange-500';
            case 'Low': return 'from-emerald-500 to-green-600';
            default: return 'from-gray-400 to-gray-500';
        }
    };

    return (
        <div className="p-6 min-h-full">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#0f172a]">Risk Analysis</h1>
                <p className="text-gray-500 mt-1">Review project risk assessments and run ML-powered predictions.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left — Assessment List */}
                <div className="lg:col-span-1">
                    {/* Project Filter */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Filter by Project</label>
                        <select
                            value={selectedProject}
                            onChange={(e) => { setSelectedProject(e.target.value); setSelectedAssessment(null); setPredictionResult(null); }}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        >
                            <option value="">All Projects</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Assessment Cards */}
                    <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                        {filteredAssessments.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
                                <p className="text-lg mb-1">No assessments found</p>
                                <p className="text-sm">Project Managers need to submit risk assessment forms first.</p>
                            </div>
                        ) : (
                            filteredAssessments.map(a => (
                                <div
                                    key={a.id}
                                    onClick={() => handleSelectAssessment(a)}
                                    className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md ${
                                        selectedAssessment?.id === a.id
                                            ? 'border-blue-400 ring-2 ring-blue-500/20'
                                            : 'border-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-semibold text-[#0f172a] text-sm">
                                            {a.projectId?.name || 'Unknown Project'}
                                        </h4>
                                        {a.riskResult?.riskLevel ? (
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${riskLevelStyle(a.riskResult.riskLevel)}`}>
                                                {a.riskResult.riskLevel}
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
                                                Pending
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        By {a.submittedBy?.name || 'Unknown'} · {new Date(a.createdAt).toLocaleDateString()}
                                    </p>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-xs text-gray-400">Timeline: {a.projectTimeline} days</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}
                                            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right — Detail View & Prediction */}
                <div className="lg:col-span-2">
                    {!selectedAssessment ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center text-gray-400">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p className="text-lg font-medium">Select an assessment</p>
                            <p className="text-sm mt-1">Choose a risk assessment from the left panel to view details and run prediction.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Assessment Details */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-[#0f172a]">
                                        {selectedAssessment.projectId?.name || 'Project Assessment'}
                                    </h2>
                                    <span className="text-sm text-gray-500">
                                        Submitted {new Date(selectedAssessment.createdAt).toLocaleString()}
                                    </span>
                                </div>

                                {/* Auto-filled fields */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Auto-filled Data</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-blue-50 rounded-xl p-4 text-center">
                                            <p className="text-xs font-medium text-blue-600 mb-1">Project Timeline</p>
                                            <p className="text-2xl font-bold text-blue-800">{selectedAssessment.projectTimeline}</p>
                                            <p className="text-xs text-blue-500">days</p>
                                        </div>
                                        <div className="bg-emerald-50 rounded-xl p-4 text-center">
                                            <p className="text-xs font-medium text-emerald-600 mb-1">Labour Count</p>
                                            <p className="text-2xl font-bold text-emerald-800">{selectedAssessment.labourCount}</p>
                                            <p className="text-xs text-emerald-500">workers</p>
                                        </div>
                                        <div className="bg-amber-50 rounded-xl p-4 text-center">
                                            <p className="text-xs font-medium text-amber-600 mb-1">Avg Weather Score</p>
                                            <p className="text-2xl font-bold text-amber-800">{selectedAssessment.averageWeather}</p>
                                            <p className="text-xs text-amber-500">0 = clear, 1 = severe</p>
                                        </div>
                                    </div>
                                </div>

                                {/* PM-entered fields */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">PM-Entered Parameters</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {[
                                            { label: 'Equipment Units', value: selectedAssessment.equipmentUnits },
                                            { label: 'Material Cost', value: `$${selectedAssessment.materialCostUSD?.toLocaleString()}` },
                                            { label: 'Start Constraint', value: selectedAssessment.startConstraint },
                                            { label: 'Resource Score', value: selectedAssessment.resourceConstraintScore },
                                            { label: 'Site Score', value: selectedAssessment.siteConstraintScore },
                                            { label: 'Dependencies', value: selectedAssessment.dependencyCount },
                                        ].map((field, idx) => (
                                            <div key={idx} className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-xs font-medium text-gray-500 mb-1">{field.label}</p>
                                                <p className="text-lg font-bold text-[#0f172a]">{field.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Prediction Section */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-[#0f172a]">ML Risk Prediction</h2>
                                    <button
                                        onClick={handleRunPrediction}
                                        disabled={predictionLoading}
                                        className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg hover:shadow-xl ${
                                            predictionLoading
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                        }`}
                                    >
                                        {predictionLoading ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Analyzing...
                                            </span>
                                        ) : (
                                            '🔬 Run Risk Analysis'
                                        )}
                                    </button>
                                </div>

                                {predictionResult ? (
                                    <div className="space-y-6">
                                        {/* Risk Level Hero */}
                                        <div className={`bg-gradient-to-r ${riskGradient(predictionResult.riskLevel || predictionResult.risk_level)} rounded-2xl p-8 text-white text-center shadow-xl`}>
                                            <p className="text-sm font-medium uppercase tracking-widest opacity-80 mb-2">Risk Level</p>
                                            <h2 className="text-5xl font-black mb-2">{predictionResult.riskLevel || predictionResult.risk_level}</h2>
                                            <p className="text-lg opacity-90">
                                                {(predictionResult.riskLevel || predictionResult.risk_level) === 'High'
                                                    ? 'Immediate attention required'
                                                    : (predictionResult.riskLevel || predictionResult.risk_level) === 'Medium'
                                                        ? 'Monitor closely and take precautions'
                                                        : 'Project is on track'
                                                }
                                            </p>
                                        </div>

                                        {/* Details */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50 rounded-xl p-5 text-center">
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Risk Probability</p>
                                                <p className="text-3xl font-black text-[#0f172a]">
                                                    {(predictionResult.riskProbability || predictionResult.risk_probability || 0).toFixed(1)}%
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-5 text-center">
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Estimated Delay</p>
                                                <p className="text-3xl font-black text-[#0f172a]">
                                                    {predictionResult.delayDays || predictionResult.delay_days || 0}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">days</p>
                                            </div>
                                        </div>

                                        {predictionResult.predictedAt && (
                                            <p className="text-xs text-gray-400 text-center">
                                                Predicted at: {new Date(predictionResult.predictedAt).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-400">
                                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <p className="text-sm">Click "Run Risk Analysis" to get ML-powered predictions.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RiskAnalysis;
