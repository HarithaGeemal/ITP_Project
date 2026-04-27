import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoLarge from '../../assets/logo-large.png';

const SESidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-64 h-screen bg-steel-blue text-white p-4 flex flex-col shadow-lg z-20 sticky top-0">
            <div className="text-2xl font-bold mb-4 tracking-wide flex items-center gap-2">
                <img src={logoLarge} alt="logo dark" />
            </div>
            <nav className="flex flex-col gap-2 grow ">
                <Link to="/se/dashboard" className="p-3 hover:bg-white/10 rounded transition-colors text-sm font-medium">Dashboard</Link>
                <Link to="/se/tasks" className="p-3 hover:bg-white/10 rounded transition-colors text-sm font-medium">Tasks & Subtasks</Link>
                <Link to="/se/approvals" className="p-3 hover:bg-white/10 rounded transition-colors text-sm font-medium flex justify-between items-center">
                    Approvals
                </Link>
                <Link to="/se/materials" className="p-3 hover:bg-white/10 rounded transition-colors text-sm font-medium">Material Requests</Link>
                <Link to="/se/issues" className="p-3 hover:bg-white/10 rounded transition-colors text-sm font-medium">Issue Reporting</Link>
                <Link to="/se/safety-notices" className="p-3 hover:bg-white/10 rounded transition-colors text-sm font-medium">Safety Notices</Link>
                <Link to="/se/daily-reports" className="p-3 hover:bg-white/10 rounded transition-colors text-sm font-medium">Daily Reports</Link>
            </nav>
            <div className="mt-auto pt-4 border-t border-white/20 w-full">
                <button
                    onClick={handleLogout}
                    className="p-3 w-full text-white/80 hover:text-white hover:bg-red-500/20 rounded transition-colors text-sm font-medium flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default SESidebar;
