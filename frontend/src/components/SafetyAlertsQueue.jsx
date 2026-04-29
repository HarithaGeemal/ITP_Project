import React, { useMemo } from 'react';

const SafetyAlertsQueue = ({ incidents = [], hazards = [], ptws = [], observations = [] }) => {
    const alerts = useMemo(() => {
        const allAlerts = [];

        // Critical incidents
        incidents
            .filter(i => i.severity === 'Critical' && i.status !== 'Closed')
            .forEach(i => {
                allAlerts.push({
                    id: `incident-${i.id}`,
                    type: 'Critical Incident',
                    title: i.incidentType,
                    description: i.location,
                    priority: 'critical',
                    color: 'red',
                    icon: '🚨',
                    action: 'Review Immediately',
                    date: new Date(i.incidentDate || i.createdAt),
                });
            });

        // Open hazards
        hazards
            .filter(h => h.status === 'Open')
            .forEach(h => {
                allAlerts.push({
                    id: `hazard-${h.id}`,
                    type: 'Open Hazard',
                    title: h.title,
                    description: h.location,
                    priority: h.severity === 'Critical' ? 'critical' : 'high',
                    color: h.severity === 'Critical' ? 'red' : 'orange',
                    icon: '⚠️',
                    action: 'Assess & Mitigate',
                    date: new Date(h.createdAt),
                });
            });

        // Pending PTWs (older than 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        ptws
            .filter(p => p.status === 'Pending' && new Date(p.createdAt) < oneDayAgo)
            .forEach(p => {
                allAlerts.push({
                    id: `ptw-${p.id}`,
                    type: 'Pending Permit',
                    title: p.permitType,
                    description: `Awaiting approval for ${p.duration || '24'} hours`,
                    priority: 'high',
                    color: 'orange',
                    icon: '📋',
                    action: 'Approve/Deny',
                    date: new Date(p.createdAt),
                });
            });

        // High severity observations
        observations
            .filter(o => o.severity === 'High' && o.status === 'Open')
            .forEach(o => {
                allAlerts.push({
                    id: `obs-${o.id}`,
                    type: 'High Severity Observation',
                    title: o.title,
                    description: o.location,
                    priority: 'high',
                    color: 'orange',
                    icon: '👁️',
                    action: 'Investigate',
                    date: new Date(o.createdAt),
                });
            });

        // High severity incidents
        incidents
            .filter(i => i.severity === 'High' && i.status === 'Open')
            .forEach(i => {
                allAlerts.push({
                    id: `high-incident-${i.id}`,
                    type: 'High Severity Incident',
                    title: i.incidentType,
                    description: i.location,
                    priority: 'high',
                    color: 'orange',
                    icon: '🚑',
                    action: 'Investigate',
                    date: new Date(i.incidentDate || i.createdAt),
                });
            });

        // Sort by priority (critical first, then by date)
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        allAlerts.sort((a, b) => {
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;
            return b.date - a.date;
        });

        return allAlerts.slice(0, 10); // Show top 10 alerts
    }, [incidents, hazards, ptws, observations]);

    const getPriorityBadgeColor = (priority) => {
        switch (priority) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-300';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const diffMs = now - new Date(date);
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 30) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
                <h3 className="font-bold text-gray-800 text-base">🚨 Safety Alerts Queue</h3>
                <p className="text-xs text-gray-600 mt-1">
                    {alerts.length === 0 ? 'No urgent alerts' : `${alerts.length} alert${alerts.length > 1 ? 's' : ''} requiring attention`}
                </p>
            </div>

            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {alerts.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                        <span className="text-4xl mb-3 block">✅</span>
                        <p className="text-gray-600 font-medium">All clear!</p>
                        <p className="text-sm text-gray-500 mt-1">No critical safety alerts at this time.</p>
                    </div>
                ) : (
                    alerts.map((alert, idx) => (
                        <div key={alert.id} className={`p-4 hover:bg-gray-50 transition ${idx === 0 ? 'bg-red-50' : ''}`}>
                            <div className="flex items-start gap-3">
                                {/* Icon & Priority */}
                                <div className="flex items-center gap-2 pt-1">
                                    <span className="text-2xl">{alert.icon}</span>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getPriorityBadgeColor(alert.priority)}`}>
                                        {alert.priority.toUpperCase()}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{alert.title}</p>
                                            <p className="text-xs text-gray-600 mt-0.5">
                                                <span className="font-medium">{alert.type}</span> • {alert.description}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-500 whitespace-nowrap">{getTimeAgo(alert.date)}</span>
                                    </div>

                                    {/* Action Button */}
                                    <div className="mt-2">
                                        <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg bg-${alert.color}-100 text-${alert.color}-700 hover:bg-${alert.color}-200 transition`}>
                                            {alert.action}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Stats */}
            {alerts.length > 0 && (
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-around text-center text-xs">
                    <div>
                        <p className="font-bold text-red-600">{alerts.filter(a => a.priority === 'critical').length}</p>
                        <p className="text-gray-600">Critical</p>
                    </div>
                    <div>
                        <p className="font-bold text-orange-600">{alerts.filter(a => a.priority === 'high').length}</p>
                        <p className="text-gray-600">High</p>
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">{alerts.length}</p>
                        <p className="text-gray-600">Total</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SafetyAlertsQueue;
