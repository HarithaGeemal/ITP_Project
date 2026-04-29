import React, { useMemo } from 'react';

const SafetyComplianceMetrics = ({ workers = [], incidents = [], hazards = [] }) => {
    const compliance = useMemo(() => {
        if (!workers || workers.length === 0) {
            return {
                overallCompliance: 0,
                trainingCompliance: 0,
                certificationCompliance: 0,
                ppeCompliance: 0,
                workersNeedingTraining: 0,
                workersWithExpiredCerts: 0,
                workersNeedingPPE: 0,
                complianceScore: 0,
                riskLevel: 'Low',
            };
        }

        // Calculate training compliance
        const trainingComplete = workers.filter(w => 
            w.trainings && w.trainings.some(t => new Date(t.completionDate) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))
        ).length;
        const trainingCompliance = Math.round((trainingComplete / workers.length) * 100);

        // Calculate certification compliance
        const withValidCerts = workers.filter(w => 
            w.certifications && w.certifications.some(c => new Date(c.expiryDate) > new Date())
        ).length;
        const certCompliance = Math.round((withValidCerts / workers.length) * 100);
        const expiredCerts = workers.filter(w =>
            w.certifications && w.certifications.some(c => new Date(c.expiryDate) <= new Date())
        ).length;

        // Calculate PPE compliance
        const withPPE = workers.filter(w => w.ppeIssued && w.ppeIssued.length > 0).length;
        const ppeCompliance = Math.round((withPPE / workers.length) * 100);

        // Overall compliance score
        const overallCompliance = Math.round((trainingCompliance + certCompliance + ppeCompliance) / 3);

        // Determine risk level
        let riskLevel = 'Low';
        if (overallCompliance < 50) riskLevel = 'Critical';
        else if (overallCompliance < 70) riskLevel = 'High';
        else if (overallCompliance < 85) riskLevel = 'Medium';

        return {
            overallCompliance,
            trainingCompliance,
            certificationCompliance: certCompliance,
            ppeCompliance,
            workersNeedingTraining: workers.length - trainingComplete,
            workersWithExpiredCerts: expiredCerts,
            workersNeedingPPE: workers.length - withPPE,
            complianceScore: overallCompliance,
            riskLevel,
        };
    }, [workers]);

    const getRiskColor = (level) => {
        switch (level) {
            case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
            case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'Low': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getComplianceColor = (score) => {
        if (score >= 90) return 'from-green-400 to-green-600';
        if (score >= 75) return 'from-yellow-400 to-yellow-600';
        if (score >= 60) return 'from-orange-400 to-orange-600';
        return 'from-red-400 to-red-600';
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 text-base">🛡️ Safety Compliance Metrics</h3>
                <p className="text-xs text-gray-500 mt-1">{workers.length} workers tracked</p>
            </div>

            <div className="p-5 space-y-6">
                {/* Overall Compliance Score */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-gray-700">Overall Compliance Score</p>
                        <p className="text-xs text-gray-500 mt-1">Aggregated from all metrics</p>
                    </div>
                    <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-20 h-20" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke={compliance.complianceScore >= 90 ? '#16a34a' : compliance.complianceScore >= 75 ? '#eab308' : '#f97316'}
                                strokeWidth="8"
                                strokeDasharray={`${(compliance.complianceScore / 100) * 283} 283`}
                                strokeLinecap="round"
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <span className="absolute text-2xl font-bold text-gray-800">{compliance.complianceScore}%</span>
                    </div>
                </div>

                {/* Risk Level Alert */}
                <div className={`border-2 rounded-xl p-4 flex items-center justify-between ${getRiskColor(compliance.riskLevel)}`}>
                    <div>
                        <p className="font-bold text-sm">Risk Level</p>
                        <p className="text-xs opacity-75 mt-0.5">{compliance.riskLevel === 'Low' ? 'All clear' : compliance.riskLevel === 'Medium' ? 'Monitor closely' : compliance.riskLevel === 'High' ? 'Urgent action needed' : 'Critical - Immediate action required'}</p>
                    </div>
                    <span className="text-3xl">
                        {compliance.riskLevel === 'Low' && '✅'}
                        {compliance.riskLevel === 'Medium' && '⚠️'}
                        {compliance.riskLevel === 'High' && '⛔'}
                        {compliance.riskLevel === 'Critical' && '🚨'}
                    </span>
                </div>

                {/* Compliance Breakdown */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700">Compliance Breakdown</h4>
                    
                    {[
                        {
                            label: 'Training Compliance',
                            percentage: compliance.trainingCompliance,
                            icon: '📚',
                            color: 'bg-blue-500',
                            needed: `${compliance.workersNeedingTraining} workers need training`
                        },
                        {
                            label: 'Certification Compliance',
                            percentage: compliance.certificationCompliance,
                            icon: '📜',
                            color: 'bg-purple-500',
                            needed: `${compliance.workersWithExpiredCerts} certs expiring`
                        },
                        {
                            label: 'PPE Compliance',
                            percentage: compliance.ppeCompliance,
                            icon: '🦺',
                            color: 'bg-green-500',
                            needed: `${compliance.workersNeedingPPE} workers without PPE`
                        },
                    ].map(({ label, percentage, icon, color, needed }) => (
                        <div key={label}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{icon}</span>
                                    <span className="text-sm font-medium text-gray-700">{label}</span>
                                </div>
                                <span className="text-sm font-bold text-gray-800">{percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3">
                                <div 
                                    className={`${color} h-3 rounded-full transition-all`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{needed}</p>
                        </div>
                    ))}
                </div>

                {/* Action Items */}
                {(compliance.workersNeedingTraining > 0 || 
                  compliance.workersWithExpiredCerts > 0 || 
                  compliance.workersNeedingPPE > 0) && (
                    <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Immediate Actions Required</h4>
                        <div className="space-y-2">
                            {compliance.workersNeedingTraining > 0 && (
                                <button className="w-full bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg p-3 text-left transition">
                                    <p className="text-sm font-semibold text-blue-900">📚 Schedule Training</p>
                                    <p className="text-xs text-blue-700 mt-0.5">{compliance.workersNeedingTraining} workers need safety training</p>
                                </button>
                            )}
                            {compliance.workersWithExpiredCerts > 0 && (
                                <button className="w-full bg-purple-50 border border-purple-200 hover:bg-purple-100 rounded-lg p-3 text-left transition">
                                    <p className="text-sm font-semibold text-purple-900">📜 Renew Certifications</p>
                                    <p className="text-xs text-purple-700 mt-0.5">{compliance.workersWithExpiredCerts} workers have expired certs</p>
                                </button>
                            )}
                            {compliance.workersNeedingPPE > 0 && (
                                <button className="w-full bg-green-50 border border-green-200 hover:bg-green-100 rounded-lg p-3 text-left transition">
                                    <p className="text-sm font-semibold text-green-900">🦺 Issue PPE</p>
                                    <p className="text-xs text-green-700 mt-0.5">{compliance.workersNeedingPPE} workers need PPE issued</p>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Compliance Score Legend */}
                <div className="border-t pt-4">
                    <p className="text-xs font-semibold text-gray-600 mb-3">Compliance Levels</p>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { range: '90-100%', color: 'bg-green-500', label: 'Excellent' },
                            { range: '75-89%', color: 'bg-yellow-500', label: 'Good' },
                            { range: '60-74%', color: 'bg-orange-500', label: 'Fair' },
                            { range: '<60%', color: 'bg-red-500', label: 'Poor' },
                        ].map(({ range, color, label }) => (
                            <div key={range} className="text-center">
                                <div className={`${color} rounded h-8 mb-1`}></div>
                                <p className="text-xs font-medium text-gray-700">{label}</p>
                                <p className="text-xs text-gray-500">{range}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SafetyComplianceMetrics;
