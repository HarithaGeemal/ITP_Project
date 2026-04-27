import React from 'react';
import { useSKContext } from '../../context/SKContext';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ label, value, icon, gradient, onClick }) => (
    <div onClick={onClick} className={`relative overflow-hidden rounded-2xl p-5 shadow-md flex flex-col justify-between min-h-[120px] cursor-pointer hover:scale-[1.02] transition-transform ${gradient}`}>
        <div className="text-3xl mb-2">{icon}</div>
        <div>
            <p className="text-4xl font-extrabold text-white tracking-tight">{value ?? '—'}</p>
            <p className="text-sm font-semibold text-white/80 mt-0.5">{label}</p>
        </div>
    </div>
);

const SKDashboard = () => {
    const { materials, tools, pendingRequests, issuanceLogs, handedOverTools } = useSKContext();
    const navigate = useNavigate();

    const totalMaterials = materials.length;
    const totalTools = tools.length;
    const pendingCount = pendingRequests.length;
    const activeToolIssues = handedOverTools.length;
    const totalIssuances = issuanceLogs.length;
    const lowStockMaterials = materials.filter(m => (m.currentStock || 0) <= (m.minStockThreshold || 0) && m.minStockThreshold > 0).length;
    const damagedTools = tools.filter(t => t.condition === 'Damaged' || t.condition === 'Poor').length;

    const recentIssuances = [...issuanceLogs].sort((a, b) => new Date(b.issuedDate) - new Date(a.issuedDate)).slice(0, 5);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Store Keeper Dashboard</h1>
                <p className="text-sm text-gray-500 mt-0.5">Manage your main storage inventory, process requests, and track issuances.</p>
            </div>

            {/* Alert Banner */}
            {pendingCount > 0 && (
                <div className="bg-amber-500 text-white rounded-xl px-5 py-4 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">📋</span>
                        <div>
                            <p className="font-bold text-base">{pendingCount} Pending Request{pendingCount > 1 ? 's' : ''} Awaiting Action</p>
                            <p className="text-amber-100 text-sm">Review and process material/tool requests from site engineers.</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/sk/requests')} className="bg-white text-amber-700 font-bold px-4 py-1.5 rounded-lg text-sm hover:bg-amber-50 transition">
                        Review →
                    </button>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Materials in Stock" value={totalMaterials} icon="🧱" gradient="bg-gradient-to-br from-blue-500 to-blue-700" onClick={() => navigate('/sk/inventory')} />
                <StatCard label="Tools in Stock" value={totalTools} icon="🔧" gradient="bg-gradient-to-br from-steel-blue/80 to-steel-blue" onClick={() => navigate('/sk/inventory')} />
                <StatCard label="Pending Requests" value={pendingCount} icon="📋" gradient="bg-gradient-to-br from-amber-500 to-amber-700" onClick={() => navigate('/sk/requests')} />
                <StatCard label="Tools Handed Out" value={activeToolIssues} icon="🔄" gradient="bg-gradient-to-br from-purple-500 to-purple-700" onClick={() => navigate('/sk/tool-returns')} />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total Issuances', value: totalIssuances, icon: '📦', color: 'text-gray-700', bg: 'bg-gray-50' },
                    { label: 'Low Stock Items', value: lowStockMaterials, icon: '⚠️', color: 'text-orange-700', bg: 'bg-orange-50' },
                    { label: 'Damaged Tools', value: damagedTools, icon: '🚫', color: 'text-red-700', bg: 'bg-red-50' },
                    { label: 'Returned Tools', value: issuanceLogs.filter(l => l.status === 'Returned').length, icon: '✅', color: 'text-green-700', bg: 'bg-green-50' },
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

            {/* Recent Issuances */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 text-base">Recent Issuances</h3>
                    <button onClick={() => navigate('/sk/reports')} className="text-xs text-steel-blue font-semibold hover:underline">View all →</button>
                </div>
                <div className="divide-y divide-gray-50">
                    {recentIssuances.length === 0 && (
                        <p className="px-5 py-8 text-sm text-gray-400 italic text-center">No issuances recorded yet.</p>
                    )}
                    {recentIssuances.map(log => (
                        <div key={log.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition">
                            <div className="flex items-center gap-3">
                                <span className={`text-lg ${log.type === 'Material' ? '' : ''}`}>{log.type === 'Material' ? '🧱' : '🔧'}</span>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {log.type === 'Material'
                                            ? (log.materialItemId?.name || 'Unknown Material')
                                            : (log.mainStorageToolId?.name || 'Unknown Tool')
                                        }
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {log.projectId?.name || 'Unknown Project'} · Qty: {log.issuedQuantity} · {new Date(log.issuedDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${log.status === 'Issued' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                {log.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SKDashboard;
