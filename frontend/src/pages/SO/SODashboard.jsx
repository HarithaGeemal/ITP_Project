import React from 'react';
import { useSOContext } from '../../context/SOContext';
import { useNavigate } from 'react-router-dom';

// safetyService.getSafetySummary returns:
//   { openHazards, activePTWs, activeNotices, totalObservations }

const StatCard = ({ label, value, sub, icon, gradient, pulse }) => (
    <div className={`relative overflow-hidden rounded-2xl p-5 shadow-md flex flex-col justify-between min-h-[120px] ${gradient}`}>
        {pulse && (
            <span className="absolute top-3 right-3 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white opacity-90"></span>
            </span>
        )}
        <div className="text-3xl mb-2">{icon}</div>
        <div>
            <p className="text-4xl font-extrabold text-white tracking-tight">{value ?? '—'}</p>
            <p className="text-sm font-semibold text-white/80 mt-0.5">{label}</p>
            {sub && <p className="text-xs text-white/60 mt-0.5">{sub}</p>}
        </div>
    </div>
);

const SeverityDot = ({ severity }) => {
    const colors = {
        Critical: 'bg-red-500',
        High: 'bg-orange-500',
        Medium: 'bg-yellow-400',
        Low: 'bg-green-500',
    };
    return <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${colors[severity] || 'bg-gray-400'}`} />;
};

const SODashboard = () => {
    const {
        projects, activeProjectId, setActiveProjectId,
        dashboardMetrics,
        safetyIncidents, safetyObservations, hazardReports, ptws, tools
    } = useSOContext();
    const navigate = useNavigate();

    if (projects.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-full p-12 gap-4">
                <div className="text-5xl">🦺</div>
                <p className="text-gray-500 font-medium text-lg">No projects assigned to you yet.</p>
                <p className="text-gray-400 text-sm">Contact your Project Manager to be assigned to a project.</p>
            </div>
        );
    }

    const activeProject = projects.find(p => p.id === activeProjectId);

    // Live counts from already-fetched context state (more reliable than dashboardMetrics alone)
    const openIncidentsCount = safetyIncidents.filter(i => i.status === 'Open' || i.status === 'Under Investigation').length;
    const criticalIncidents = safetyIncidents.filter(i => i.requiresImmediateAttention && i.status !== 'Closed').length;
    const pendingPTWs = ptws.filter(p => p.status === 'Pending').length;
    const openHazards = hazardReports.filter(h => h.status === 'Open').length;
    const blacklistedTools = tools.filter(t => t.isBlacklisted).length;
    const poorTools = tools.filter(t => t.condition === 'Poor').length;

    // Dashboard metrics from backend summary (openHazards, activePTWs, activeNotices, totalObservations)
    const dm = dashboardMetrics || {};

    const recentIncidents = [...safetyIncidents]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    const recentObservations = [...safetyObservations]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Safety Officer Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {activeProject
                            ? <>Viewing: <span className="font-semibold text-gray-700">{activeProject.name}</span></>
                            : 'Select a project to view safety metrics.'}
                    </p>
                </div>
                <select
                    className="bg-white border border-gray-300 text-gray-800 text-sm rounded-xl focus:ring-red-500 focus:border-red-500 p-2.5 shadow-sm font-medium pr-8 min-w-[200px]"
                    value={activeProjectId || ''}
                    onChange={(e) => setActiveProjectId(e.target.value)}
                >
                    {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>

            {/* ── Critical Alert Banner ── */}
            {criticalIncidents > 0 && (
                <div className="bg-red-600 text-white rounded-xl px-5 py-4 flex items-center justify-between shadow-lg animate-pulse-slow">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🚨</span>
                        <div>
                            <p className="font-bold text-base">
                                {criticalIncidents} Critical Incident{criticalIncidents > 1 ? 's' : ''} Require Immediate Attention
                            </p>
                            <p className="text-red-100 text-sm">Review and take action immediately.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/so/incidents')}
                        className="bg-white text-red-700 font-bold px-4 py-1.5 rounded-lg text-sm hover:bg-red-50 transition"
                    >
                        View →
                    </button>
                </div>
            )}

            {/* ── KPI Stat Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Open Hazards"
                    value={openHazards}
                    sub={dm.openHazards !== undefined ? `${dm.openHazards} tracked by system` : undefined}
                    icon="⚠️"
                    gradient="bg-gradient-to-br from-red-500 to-red-700"
                    pulse={openHazards > 0}
                />
                <StatCard
                    label="Open Incidents"
                    value={openIncidentsCount}
                    sub={`${safetyIncidents.length} total logged`}
                    icon="🚑"
                    gradient="bg-gradient-to-br from-orange-500 to-orange-700"
                    pulse={openIncidentsCount > 0}
                />
                <StatCard
                    label="Pending PTWs"
                    value={pendingPTWs}
                    sub={`${dm.activePTWs ?? ptws.filter(p => ['Pending','Approved'].includes(p.status)).length} active permits`}
                    icon="📋"
                    gradient="bg-gradient-to-br from-blue-500 to-blue-700"
                    pulse={pendingPTWs > 0}
                />
                <StatCard
                    label="Observations"
                    value={safetyObservations.length}
                    sub={`${dm.activeNotices ?? 0} active notices`}
                    icon="👁️"
                    gradient="bg-gradient-to-br from-purple-500 to-purple-700"
                />
            </div>

            {/* ── Secondary Stats Row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total Tools', value: tools.length, icon: '🔧', color: 'text-gray-700', bg: 'bg-gray-50' },
                    { label: 'Blacklisted', value: blacklistedTools, icon: '🚫', color: 'text-red-700', bg: 'bg-red-50' },
                    { label: 'Poor Condition', value: poorTools, icon: '⚙️', color: 'text-orange-700', bg: 'bg-orange-50' },
                    { label: 'Resolved Incidents', value: safetyIncidents.filter(i => i.status === 'Resolved' || i.status === 'Closed').length, icon: '✅', color: 'text-green-700', bg: 'bg-green-50' },
                ].map(({ label, value, icon, color, bg }) => (
                    <div key={label} className={`${bg} border border-gray-200 rounded-xl p-4 flex items-center gap-3`}>
                        <span className="text-xl">{icon}</span>
                        <div>
                            <p className={`text-xl font-bold ${color}`}>{value}</p>
                            <p className="text-xs text-gray-500">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Bottom Two-Column Section ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Recent Incidents */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800 text-base">Recent Incidents</h3>
                        <button onClick={() => navigate('/so/incidents')} className="text-xs text-red-600 font-semibold hover:underline">View all →</button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {recentIncidents.length === 0 && (
                            <p className="px-5 py-8 text-sm text-gray-400 italic text-center">No incidents logged.</p>
                        )}
                        {recentIncidents.map(inc => (
                            <div key={inc.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition">
                                <div className="flex items-start gap-2">
                                    {inc.requiresImmediateAttention && <span className="text-red-500 text-xs font-bold mt-0.5">⚡</span>}
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{inc.incidentType}</p>
                                        <p className="text-xs text-gray-400">{inc.location} · {new Date(inc.incidentDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                    inc.status === 'Open' ? 'bg-red-100 text-red-700' :
                                    inc.status === 'Under Investigation' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'}`}>
                                    {inc.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Observations */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800 text-base">Recent Observations</h3>
                        <button onClick={() => navigate('/so/observations')} className="text-xs text-red-600 font-semibold hover:underline">View all →</button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {recentObservations.length === 0 && (
                            <p className="px-5 py-8 text-sm text-gray-400 italic text-center">No observations logged.</p>
                        )}
                        {recentObservations.map(obs => (
                            <div key={obs.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800 flex items-center">
                                        <SeverityDot severity={obs.severity} />
                                        {obs.title}
                                    </p>
                                    <p className="text-xs text-gray-400 ml-3.5">{obs.location} · {obs.type}</p>
                                </div>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                    obs.status === 'Open' ? 'bg-red-100 text-red-700' :
                                    obs.status === 'Resolved' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-600'}`}>
                                    {obs.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hazard Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800 text-base">Hazard Status</h3>
                        <button onClick={() => navigate('/so/hazards')} className="text-xs text-red-600 font-semibold hover:underline">Manage →</button>
                    </div>
                    {hazardReports.length === 0 ? (
                        <p className="px-5 py-8 text-sm text-gray-400 italic text-center">No hazard reports.</p>
                    ) : (
                        <div className="p-5 space-y-3">
                            {['Open', 'Controlled', 'Closed'].map(status => {
                                const count = hazardReports.filter(h => h.status === status).length;
                                const total = hazardReports.length;
                                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                                const barColor = status === 'Open' ? 'bg-red-500' : status === 'Controlled' ? 'bg-yellow-400' : 'bg-green-500';
                                return (
                                    <div key={status}>
                                        <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                                            <span>{status}</span>
                                            <span>{count} ({pct}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className={`${barColor} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* PTW Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800 text-base">Permit to Work Overview</h3>
                        <button onClick={() => navigate('/so/ptws')} className="text-xs text-red-600 font-semibold hover:underline">Manage →</button>
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-3">
                        {[
                            { label: 'Pending', color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
                            { label: 'Approved', color: 'bg-green-50 border-green-200 text-green-800' },
                            { label: 'Denied', color: 'bg-red-50 border-red-200 text-red-800' },
                            { label: 'Revoked', color: 'bg-gray-100 border-gray-300 text-gray-700' },
                        ].map(({ label, color }) => (
                            <div key={label} className={`border rounded-xl p-3 text-center ${color}`}>
                                <p className="text-2xl font-extrabold">{ptws.filter(p => p.status === label).length}</p>
                                <p className="text-xs font-semibold mt-0.5">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SODashboard;
