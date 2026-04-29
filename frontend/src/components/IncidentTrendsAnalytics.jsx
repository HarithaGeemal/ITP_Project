import React, { useMemo } from 'react';

const IncidentTrendsAnalytics = ({ incidents }) => {
    // Calculate trends over last 30 days
    const trends = useMemo(() => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        // Group incidents by date
        const dailyIncidents = {};
        for (let i = 0; i < 30; i++) {
            const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
            const dateKey = date.toISOString().split('T')[0];
            dailyIncidents[dateKey] = 0;
        }
        
        incidents.forEach(incident => {
            const incidentDate = new Date(incident.incidentDate || incident.createdAt);
            if (incidentDate >= thirtyDaysAgo && incidentDate <= now) {
                const dateKey = incidentDate.toISOString().split('T')[0];
                if (dailyIncidents[dateKey] !== undefined) {
                    dailyIncidents[dateKey]++;
                }
            }
        });
        
        // Incidents by severity
        const bySeverity = {
            'Critical': incidents.filter(i => i.severity === 'Critical').length,
            'High': incidents.filter(i => i.severity === 'High').length,
            'Medium': incidents.filter(i => i.severity === 'Medium').length,
            'Low': incidents.filter(i => i.severity === 'Low').length,
        };
        
        // Top incident types
        const typeCount = {};
        incidents.forEach(incident => {
            const type = incident.incidentType || 'Unknown';
            typeCount[type] = (typeCount[type] || 0) + 1;
        });
        
        const topTypes = Object.entries(typeCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        return { dailyIncidents, bySeverity, topTypes };
    }, [incidents]);

    const maxDaily = Math.max(...Object.values(trends.dailyIncidents), 1);
    const maxSeverity = Math.max(...Object.values(trends.bySeverity), 1);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 text-base">📊 Incident Trends & Analytics</h3>
                <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
            </div>

            <div className="p-5 space-y-6">
                {/* Daily Incident Trend Line */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Daily Incidents</h4>
                    <div className="flex items-end gap-1 h-24 bg-gray-50 p-3 rounded-lg">
                        {Object.values(trends.dailyIncidents).slice(-30).map((count, idx) => (
                            <div
                                key={idx}
                                className="flex-1 rounded-t bg-gradient-to-t from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 transition-colors"
                                style={{
                                    height: `${maxDaily > 0 ? (count / maxDaily) * 100 : 0}%`,
                                    minHeight: count > 0 ? '4px' : '2px'
                                }}
                                title={`${count} incidents`}
                            />
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        Showing last 30 days • Max: {maxDaily} incidents/day
                    </p>
                </div>

                {/* Severity Distribution */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">By Severity</h4>
                    <div className="space-y-2">
                        {[
                            { label: 'Critical', color: 'bg-red-500', key: 'Critical' },
                            { label: 'High', color: 'bg-orange-500', key: 'High' },
                            { label: 'Medium', color: 'bg-yellow-400', key: 'Medium' },
                            { label: 'Low', color: 'bg-green-500', key: 'Low' },
                        ].map(({ label, color, key }) => {
                            const count = trends.bySeverity[key];
                            const pct = maxSeverity > 0 ? (count / maxSeverity) * 100 : 0;
                            return (
                                <div key={key}>
                                    <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                                        <span>{label}</span>
                                        <span>{count} incidents</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Incident Types */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Incident Types</h4>
                    <div className="space-y-2">
                        {trends.topTypes.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No incidents recorded.</p>
                        ) : (
                            trends.topTypes.map(([type, count], idx) => (
                                <div key={type} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">
                                            {idx === 0 && '🥇'}
                                            {idx === 1 && '🥈'}
                                            {idx === 2 && '🥉'}
                                            {idx > 2 && '📌'}
                                        </span>
                                        <span className="text-sm font-medium text-gray-700">{type}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-800 bg-white px-2 py-1 rounded">{count}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-800">{incidents.length}</p>
                        <p className="text-xs text-gray-500">Total Incidents</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{trends.bySeverity.Critical + trends.bySeverity.High}</p>
                        <p className="text-xs text-gray-500">Critical/High</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                            {incidents.filter(i => i.status === 'Resolved' || i.status === 'Closed').length}
                        </p>
                        <p className="text-xs text-gray-500">Resolved</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncidentTrendsAnalytics;
