import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSEContext } from '../../context/SEContext';

const SENavBar = () => {
    const { user } = useAuth();
    const { dailyReports } = useSEContext();
    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'SE';

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-steel-blue tracking-tight">SiteNex</h2>
                <span className="text-xs text-steel-blue font-semibold uppercase tracking-wide">SE Portal</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">📋 {dailyReports.length} reports</span>
                <div className="flex items-center gap-2">
                    <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800">{user?.name || 'Site Engineer'}</p>
                        <p className="text-xs text-gray-400 uppercase">{user?.userRole?.replace('_', ' ')}</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">{initials}</div>
                </div>
            </div>
        </header>
    );
};

export default SENavBar;
