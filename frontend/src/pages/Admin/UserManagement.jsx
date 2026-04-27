import React, { useState } from 'react';
import { useAdminContext } from '../../context/AdminContext';

const ROLES = [
    'ADMIN', 'PROJECT_MANAGER', 'SITE_ENGINEER', 'ASSISTANT_ENGINEER',
    'STORE_KEEPER', 'SAFETY_OFFICER', 'WORKER'
];

const roleColors = {
    ADMIN: 'bg-red-100 text-red-800',
    PROJECT_MANAGER: 'bg-blue-100 text-blue-800',
    SITE_ENGINEER: 'bg-emerald-100 text-emerald-800',
    ASSISTANT_ENGINEER: 'bg-cyan-100 text-cyan-800',
    SAFETY_OFFICER: 'bg-amber-100 text-amber-800',
    STORE_KEEPER: 'bg-purple-100 text-purple-800',
    WORKER: 'bg-gray-100 text-gray-700',
};

const UserManagement = () => {
    const { users, toggleUserStatus, updateUserRole } = useAdminContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [editingUser, setEditingUser] = useState(null);
    const [editRole, setEditRole] = useState('');

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || u.userRole === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleEditRole = (user) => {
        setEditingUser(user.id);
        setEditRole(user.userRole);
    };

    const handleSaveRole = async (userId) => {
        await updateUserRole(userId, editRole);
        setEditingUser(null);
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setEditRole('');
    };

    return (
        <div className="p-6 min-h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#0f172a]">User Management</h1>
                    <p className="text-gray-500 mt-1">Manage system users, roles, and access.</p>
                </div>
                <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                    {users.length} Total Users
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                    <option value="ALL">All Roles</option>
                    {ROLES.map(role => (
                        <option key={role} value={role}>{role.replace('_', ' ')}</option>
                    ))}
                </select>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="text-center py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-gray-400">
                                        <p className="text-lg">No users found</p>
                                        <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3.5 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0f172a] to-[#334155] text-white flex items-center justify-center text-xs font-bold">
                                                    {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                </div>
                                                <span className="font-semibold text-[#0f172a] text-sm">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-6 text-sm text-gray-600">{user.email}</td>
                                        <td className="py-3.5 px-6">
                                            {editingUser === user.id ? (
                                                <select
                                                    value={editRole}
                                                    onChange={(e) => setEditRole(e.target.value)}
                                                    className="px-2 py-1 border border-blue-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                >
                                                    {ROLES.map(role => (
                                                        <option key={role} value={role}>{role.replace('_', ' ')}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleColors[user.userRole] || 'bg-gray-100 text-gray-600'}`}>
                                                    {user.userRole?.replace('_', ' ')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-6">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-6 text-sm text-gray-500">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="py-3.5 px-6">
                                            <div className="flex items-center justify-center gap-2">
                                                {editingUser === user.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleSaveRole(user.id)}
                                                            className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleEditRole(user)}
                                                            className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                                                        >
                                                            Edit Role
                                                        </button>
                                                        <button
                                                            onClick={() => toggleUserStatus(user.id)}
                                                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
                                                                user.isActive
                                                                    ? 'text-red-600 hover:bg-red-50 border-red-200'
                                                                    : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                                                            }`}
                                                        >
                                                            {user.isActive ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
