import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAdminContext } from '../../context/AdminContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const { stats, riskAssessments, users, loading } = useAdminContext();
    const navigate = useNavigate();

    const greetName = user?.name?.split(' ')[0] || 'Admin';

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-full">
                <div className="text-lg text-gray-500 animate-pulse">Loading dashboard…</div>
            </div>
        );
    }

    const statCards = [
        { title: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
        { title: 'Active Projects', value: stats?.activeProjects || 0, icon: '🏗️', color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50' },
        { title: 'Risk Assessments', value: stats?.totalRiskAssessments || 0, icon: '📊', color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50' },
        { title: 'Pending Predictions', value: stats?.pendingPredictions || 0, icon: '⏳', color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50' },
    ];

    const recentAssessments = riskAssessments.slice(0, 5);

    const roleColors = {
        ADMIN: 'bg-red-100 text-red-800',
        PROJECT_MANAGER: 'bg-blue-100 text-blue-800',
        SITE_ENGINEER: 'bg-emerald-100 text-emerald-800',
        SAFETY_OFFICER: 'bg-amber-100 text-amber-800',
        STORE_KEEPER: 'bg-purple-100 text-purple-800',
        WORKER: 'bg-gray-100 text-gray-800',
        ASSISTANT_ENGINEER: 'bg-cyan-100 text-cyan-800',
    };

    return (
        <div className="p-6 min-h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#0f172a]">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back, {greetName}. System overview at a glance.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((card, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                                <h3 className="text-3xl font-bold text-[#0f172a] mt-1">{card.value}</h3>
                            </div>
                            <div className={`w-14 h-14 rounded-xl ${card.bg} flex items-center justify-center text-2xl`}>
                                {card.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Risk Assessments */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-[#0f172a]">Recent Risk Assessments</h2>
                        <button
                            onClick={() => navigate('/admin/risk-analysis')}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            View All →
                        </button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {recentAssessments.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <p className="text-lg mb-1">No risk assessments yet</p>
                                <p className="text-sm">Project Managers can submit risk assessments for analysis.</p>
                            </div>
                        ) : (
                            recentAssessments.map(ra => (
                                <div key={ra.id} className="p-4 hover:bg-gray-50/50 transition-colors flex items-center justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-[#0f172a]">
                                            {ra.projectId?.name || 'Unknown Project'}
                                        </h4>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            By {ra.submittedBy?.name || 'Unknown'} · {new Date(ra.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        {ra.riskResult?.riskLevel ? (
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                ra.riskResult.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                                                ra.riskResult.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                {ra.riskResult.riskLevel} Risk
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
                                                Pending
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Role Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-[#0f172a] mb-4">Users by Role</h2>
                    <div className="space-y-3">
                        {stats?.roleBreakdown?.map((role, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleColors[role._id] || 'bg-gray-100 text-gray-600'}`}>
                                    {role._id?.replace('_', ' ')}
                                </span>
                                <span className="text-sm font-bold text-[#0f172a]">{role.count}</span>
                            </div>
                        )) || (
                            <div className="text-center text-gray-400 py-4">No data</div>
                        )}
                    </div>

                    <button
                        onClick={() => navigate('/admin/users')}
                        className="w-full mt-6 py-2.5 text-sm font-semibold text-[#0f172a] hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
                    >
                        Manage Users →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
