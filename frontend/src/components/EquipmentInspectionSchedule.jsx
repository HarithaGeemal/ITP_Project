import React, { useMemo } from 'react';

const EquipmentInspectionSchedule = ({ tools = [] }) => {
    const inspectionData = useMemo(() => {
        if (!tools || tools.length === 0) {
            return {
                total: 0,
                overdue: 0,
                dueSoon: 0,
                upToDate: 0,
                blacklisted: 0,
                poorCondition: 0,
                goodCondition: 0,
                byCategory: {},
                overdueList: [],
                dueSoonList: [],
            };
        }

        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        let overdue = 0;
        let dueSoon = 0;
        let upToDate = 0;
        const overdueList = [];
        const dueSoonList = [];
        const byCategory = {};
        let blacklisted = 0;
        let poorCondition = 0;
        let goodCondition = 0;

        tools.forEach(tool => {
            // Count by category
            const category = tool.category || 'Uncategorized';
            byCategory[category] = (byCategory[category] || 0) + 1;

            // Count by condition
            if (tool.isBlacklisted) {
                blacklisted++;
            } else if (tool.condition === 'Poor') {
                poorCondition++;
            } else {
                goodCondition++;
            }

            // Check inspection status
            const lastInspection = tool.lastInspection ? new Date(tool.lastInspection) : null;
            const inspectionDueDate = lastInspection 
                ? new Date(lastInspection.getTime() + (tool.inspectionIntervalDays || 30) * 24 * 60 * 60 * 1000)
                : now;

            if (inspectionDueDate < now) {
                overdue++;
                overdueList.push({
                    id: tool._id,
                    name: tool.name,
                    category: category,
                    lastInspection: lastInspection,
                    daysOverdue: Math.floor((now - inspectionDueDate) / (24 * 60 * 60 * 1000)),
                });
            } else if (inspectionDueDate < sevenDaysFromNow) {
                dueSoon++;
                dueSoonList.push({
                    id: tool._id,
                    name: tool.name,
                    category: category,
                    lastInspection: lastInspection,
                    dueDate: inspectionDueDate,
                    daysUntilDue: Math.ceil((inspectionDueDate - now) / (24 * 60 * 60 * 1000)),
                });
            } else {
                upToDate++;
            }
        });

        // Sort lists
        overdueList.sort((a, b) => b.daysOverdue - a.daysOverdue);
        dueSoonList.sort((a, b) => a.daysUntilDue - b.daysUntilDue);

        return {
            total: tools.length,
            overdue,
            dueSoon,
            upToDate,
            blacklisted,
            poorCondition,
            goodCondition,
            byCategory,
            overdueList,
            dueSoonList,
        };
    }, [tools]);

    const getHealthPercentage = () => {
        if (inspectionData.total === 0) return 0;
        return Math.round(((inspectionData.upToDate) / inspectionData.total) * 100);
    };

    const getHealthColor = (percentage) => {
        if (percentage >= 90) return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
        if (percentage >= 75) return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
        if (percentage >= 60) return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
        return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    };

    const health = getHealthPercentage();
    const healthStyle = getHealthColor(health);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 text-base">🔧 Equipment Inspection Schedule</h3>
                <p className="text-xs text-gray-500 mt-1">{inspectionData.total} tools being tracked</p>
            </div>

            <div className="p-5 space-y-6">
                {/* Equipment Health Score */}
                <div className={`border-2 rounded-xl p-5 flex items-center justify-between ${healthStyle.bg} ${healthStyle.border}`}>
                    <div>
                        <p className={`font-bold text-lg ${healthStyle.color}`}>Equipment Health</p>
                        <p className="text-xs text-gray-600 mt-1">Inspections up to date</p>
                    </div>
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-24 h-24" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke={health >= 90 ? '#16a34a' : health >= 75 ? '#eab308' : health >= 60 ? '#f97316' : '#dc2626'}
                                strokeWidth="6"
                                strokeDasharray={`${(health / 100) * 283} 283`}
                                strokeLinecap="round"
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <span className={`absolute text-2xl font-bold ${healthStyle.color}`}>{health}%</span>
                    </div>
                </div>

                {/* Status Overview */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-red-600">{inspectionData.overdue}</p>
                        <p className="text-xs font-semibold text-red-700 mt-1">Overdue</p>
                        <p className="text-xs text-red-600 mt-0.5">Inspect now</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-600">{inspectionData.dueSoon}</p>
                        <p className="text-xs font-semibold text-yellow-700 mt-1">Due Soon</p>
                        <p className="text-xs text-yellow-600 mt-0.5">Next 7 days</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{inspectionData.upToDate}</p>
                        <p className="text-xs font-semibold text-green-700 mt-1">Up to Date</p>
                        <p className="text-xs text-green-600 mt-0.5">All clear</p>
                    </div>
                </div>

                {/* Equipment Condition */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Equipment Condition</h4>
                    <div className="space-y-2">
                        {[
                            { label: 'Good Condition', count: inspectionData.goodCondition, color: 'bg-green-500', icon: '✅' },
                            { label: 'Poor Condition', count: inspectionData.poorCondition, color: 'bg-orange-500', icon: '⚠️' },
                            { label: 'Blacklisted', count: inspectionData.blacklisted, color: 'bg-red-500', icon: '🚫' },
                        ].map(({ label, count, color, icon }) => {
                            const pct = inspectionData.total > 0 ? (count / inspectionData.total) * 100 : 0;
                            return (
                                <div key={label}>
                                    <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                                        <span>{icon} {label}</span>
                                        <span>{count} ({Math.round(pct)}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div 
                                            className={`${color} h-2 rounded-full transition-all`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tools by Category */}
                {Object.keys(inspectionData.byCategory).length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Equipment by Category</h4>
                        <div className="space-y-2">
                            {Object.entries(inspectionData.byCategory)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 5)
                                .map(([category, count]) => (
                                    <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">📦</span>
                                            <span className="text-sm font-medium text-gray-700">{category}</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-800 bg-white px-2 py-0.5 rounded">{count}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Overdue Inspections */}
                {inspectionData.overdueList.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="text-sm font-bold text-red-900 mb-3">🚨 Overdue Inspections ({inspectionData.overdueList.length})</h4>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {inspectionData.overdueList.slice(0, 5).map((item) => (
                                <div key={item.id} className="flex items-start justify-between p-2 bg-white rounded border border-red-100">
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-gray-800">{item.name}</p>
                                        <p className="text-xs text-gray-600 mt-0.5">{item.category}</p>
                                    </div>
                                    <span className="text-xs font-bold text-red-600 whitespace-nowrap ml-2">
                                        {item.daysOverdue}d overdue
                                    </span>
                                </div>
                            ))}
                            {inspectionData.overdueList.length > 5 && (
                                <p className="text-xs text-red-700 font-semibold text-center pt-2">
                                    +{inspectionData.overdueList.length - 5} more overdue
                                </p>
                            )}
                        </div>
                        <button className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition text-sm">
                            Schedule Inspections
                        </button>
                    </div>
                )}

                {/* Due Soon */}
                {inspectionData.dueSoonList.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="text-sm font-bold text-yellow-900 mb-3">⏰ Due Soon ({inspectionData.dueSoonList.length})</h4>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {inspectionData.dueSoonList.slice(0, 5).map((item) => (
                                <div key={item.id} className="flex items-start justify-between p-2 bg-white rounded border border-yellow-100">
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-gray-800">{item.name}</p>
                                        <p className="text-xs text-gray-600 mt-0.5">{item.category}</p>
                                    </div>
                                    <span className="text-xs font-bold text-yellow-600 whitespace-nowrap ml-2">
                                        {item.daysUntilDue}d left
                                    </span>
                                </div>
                            ))}
                            {inspectionData.dueSoonList.length > 5 && (
                                <p className="text-xs text-yellow-700 font-semibold text-center pt-2">
                                    +{inspectionData.dueSoonList.length - 5} more due soon
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* All Clear Message */}
                {inspectionData.overdue === 0 && inspectionData.dueSoon === 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <p className="text-lg font-bold text-green-700">✅ All equipment inspections current!</p>
                        <p className="text-sm text-green-600 mt-1">No overdue or due-soon inspections.</p>
                    </div>
                )}

                {/* Inspection Tips */}
                <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">💡 Inspection Tips</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Schedule regular inspections every 30 days</li>
                        <li>• Document condition and any repairs needed</li>
                        <li>• Immediately blacklist unsafe equipment</li>
                        <li>• Maintain inspection logs for compliance</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default EquipmentInspectionSchedule;
