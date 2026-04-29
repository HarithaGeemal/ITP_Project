import React, { useMemo } from 'react';

const NearMissTracker = ({ incidents = [] }) => {
    const nearMissData = useMemo(() => {
        // Filter incidents that are near-misses or low severity
        const nearMisses = incidents.filter(i => 
            i.incidentType === 'Near Miss' || 
            (i.severity === 'Low' && !i.requiresImmediateAttention)
        );

        // Group by location
        const byLocation = {};
        nearMisses.forEach(nm => {
            const loc = nm.location || 'Unknown Location';
            byLocation[loc] = (byLocation[loc] || 0) + 1;
        });

        // Top locations
        const topLocations = Object.entries(byLocation)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // Trends
        const now = new Date();
        const thisWeek = nearMisses.filter(i => {
            const incDate = new Date(i.incidentDate || i.createdAt);
            return (now - incDate) < 7 * 24 * 60 * 60 * 1000;
        }).length;

        const lastWeek = nearMisses.filter(i => {
            const incDate = new Date(i.incidentDate || i.createdAt);
            const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
            const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);
            return incDate >= twoWeeksAgo && incDate < weekAgo;
        }).length;

        const trend = thisWeek > lastWeek ? 'up' : thisWeek < lastWeek ? 'down' : 'stable';

        return {
            total: nearMisses.length,
            thisWeek,
            lastWeek,
            trend,
            topLocations,
            openCount: nearMisses.filter(i => i.status === 'Open').length,
        };
    }, [incidents]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 text-base">⚡ Near-Miss Tracker</h3>
                <p className="text-xs text-gray-500 mt-1">Identify patterns before serious incidents occur</p>
            </div>

            <div className="p-5 space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">{nearMissData.total}</p>
                        <p className="text-xs text-blue-700 font-semibold mt-1">Total Near-Misses</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">{nearMissData.thisWeek}</p>
                        <p className="text-xs text-green-700 font-semibold mt-1">This Week</p>
                    </div>
                    <div className={`rounded-lg p-3 text-center ${nearMissData.trend === 'up' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                        <p className="text-2xl font-bold">
                            {nearMissData.trend === 'up' && '📈'}
                            {nearMissData.trend === 'down' && '📉'}
                            {nearMissData.trend === 'stable' && '→'}
                        </p>
                        <p className={`text-xs font-semibold mt-1 ${nearMissData.trend === 'up' ? 'text-red-700' : 'text-green-700'}`}>
                            {nearMissData.trend === 'up' && 'Increasing'}
                            {nearMissData.trend === 'down' && 'Decreasing'}
                            {nearMissData.trend === 'stable' && 'Stable'}
                        </p>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-orange-600">{nearMissData.openCount}</p>
                        <p className="text-xs text-orange-700 font-semibold mt-1">Open Issues</p>
                    </div>
                </div>

                {/* Trend Analysis */}
                {nearMissData.thisWeek > 0 || nearMissData.lastWeek > 0 ? (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Weekly Trend</h4>
                        <div className="flex items-end gap-3 h-20">
                            <div className="flex-1">
                                <div className="bg-blue-500 h-full rounded-t mb-2" style={{ height: `${nearMissData.lastWeek > 0 ? (nearMissData.lastWeek / Math.max(nearMissData.thisWeek, nearMissData.lastWeek, 1)) * 80 : 0}px` }}></div>
                                <p className="text-xs font-medium text-gray-600 text-center">{nearMissData.lastWeek}</p>
                                <p className="text-xs text-gray-500 text-center">Last Week</p>
                            </div>
                            <div className="text-xl">→</div>
                            <div className="flex-1">
                                <div className={`${nearMissData.thisWeek > nearMissData.lastWeek ? 'bg-red-500' : 'bg-green-500'} h-full rounded-t mb-2`} style={{ height: `${nearMissData.thisWeek > 0 ? (nearMissData.thisWeek / Math.max(nearMissData.thisWeek, nearMissData.lastWeek, 1)) * 80 : 0}px` }}></div>
                                <p className="text-xs font-medium text-gray-600 text-center">{nearMissData.thisWeek}</p>
                                <p className="text-xs text-gray-500 text-center">This Week</p>
                            </div>
                        </div>
                        <p className={`text-xs mt-3 font-semibold ${nearMissData.thisWeek > nearMissData.lastWeek ? 'text-red-600' : 'text-green-600'}`}>
                            {nearMissData.thisWeek > nearMissData.lastWeek && `⚠️ ${nearMissData.thisWeek - nearMissData.lastWeek} more near-misses than last week`}
                            {nearMissData.thisWeek < nearMissData.lastWeek && `✅ ${nearMissData.lastWeek - nearMissData.thisWeek} fewer near-misses than last week`}
                            {nearMissData.thisWeek === nearMissData.lastWeek && '→ No change from last week'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <p className="text-lg font-semibold text-green-700">✅ No near-miss data available</p>
                        <p className="text-sm text-green-600 mt-1">Keep up the great safety record!</p>
                    </div>
                )}

                {/* Top Locations */}
                {nearMissData.topLocations.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">High-Risk Locations</h4>
                        <div className="space-y-2">
                            {nearMissData.topLocations.map(([location, count], idx) => (
                                <div key={location} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                                            idx === 0 ? 'bg-red-500' :
                                            idx === 1 ? 'bg-orange-500' :
                                            'bg-yellow-500'
                                        }`}>
                                            {idx + 1}
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{location}</p>
                                            <p className="text-xs text-gray-500">{count} near-miss{count > 1 ? 'es' : ''}</p>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        count >= 3 ? 'bg-red-100 text-red-700' :
                                        count === 2 ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                        {count >= 3 ? 'Critical' : count === 2 ? 'Monitor' : 'Track'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Prevention Tips */}
                <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">💡 Prevention Tips</h4>
                    <div className="space-y-2 text-xs text-gray-600">
                        <p>• 📍 Focus safety briefings on high-risk locations</p>
                        <p>• 🔄 Analyze near-miss patterns to prevent serious incidents</p>
                        <p>• 📋 Document all near-misses for trend analysis</p>
                        <p>• 🎯 Use trends to improve safety procedures</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NearMissTracker;
