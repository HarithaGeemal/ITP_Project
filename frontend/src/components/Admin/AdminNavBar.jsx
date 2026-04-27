import React from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminNavBar = () => {
    const { user } = useAuth();

    const fullName = user?.name || 'Admin';
    const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 w-full flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <span className="text-xl font-bold text-[#0f172a] tracking-tight">SiteNex</span>
                    <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Admin Portal</span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* System Status Indicator */}
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    System Online
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
                    <div className="flex-col text-right hidden sm:flex">
                        <span className="text-sm font-semibold text-[#0f172a] block leading-tight">{fullName}</span>
                        <span className="text-xs text-gray-500 block">Administrator</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0f172a] to-[#334155] text-white flex items-center justify-center font-bold text-sm shadow-lg">
                        {initials}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminNavBar;
