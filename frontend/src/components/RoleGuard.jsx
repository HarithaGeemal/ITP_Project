import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleGuard = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-xl font-bold text-gray-500 animate-pulse">Authenticating Identity...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Role-based routing — read directly from AuthContext user object
    switch (user.userRole) {
        case 'PROJECT_MANAGER':
            return <Navigate to="/pm/dashboard" replace />;
        case 'ADMIN':
            return <Navigate to="/admin/dashboard" replace />;
        case 'STORE_KEEPER':
            return <Navigate to="/sk/dashboard" replace />;
        case 'SITE_ENGINEER':
        case 'ASSISTANT_ENGINEER':
            return <Navigate to="/se/dashboard" replace />;
        case 'SAFETY_OFFICER':
            return <Navigate to="/so/dashboard" replace />;
        case 'WORKER':
            return <Navigate to="/worker/dashboard" replace />;
        default:
            return (
                <div className="flex flex-col h-screen items-center justify-center bg-gray-50 text-center px-4">
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
                    <p className="text-gray-600">Your account does not have an assigned role in SiteNex.</p>
                    <p className="text-sm text-gray-400 mt-2">Current role: {user.userRole || 'none'}</p>
                </div>
            );
    }
};

export default RoleGuard;
