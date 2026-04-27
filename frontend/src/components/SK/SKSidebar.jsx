import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoLarge from '../../assets/logo-large.png';

const navItems = [
    { label: 'Dashboard', path: '/sk/dashboard', icon: '📊' },
    { label: 'Main Storage', path: '/sk/inventory', icon: '📦' },
    { label: 'Material Requests', path: '/sk/requests', icon: '📋' },
    { label: 'Tool Returns', path: '/sk/tool-returns', icon: '🔄' },
    { label: 'Store Reports', path: '/sk/reports', icon: '📈' },
];

const SKSidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-64 h-screen bg-steel-blue text-white p-4 flex flex-col shadow-xl z-20 sticky top-0 print:hidden">
            <div className="text-2xl font-bold mb-4 tracking-wide flex items-center gap-2">
                <img src={logoLarge} alt="logo dark" />
            </div>
            <div className="mb-4 px-3">
                <span className="text-xs font-bold uppercase tracking-widest text-white">Store Keeper</span>
            </div>
            <nav className="flex flex-col gap-1 grow">
                {navItems.map(item => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`p-3 rounded-lg transition-all text-sm font-medium flex items-center gap-3
                                ${isActive
                                    ? 'bg-white/15 text-white shadow-sm border-l-4 border-emerald-400 pl-2.5'
                                    : 'hover:bg-white/10 text-white/80 hover:text-white border-l-4 border-transparent pl-2.5'
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="mt-auto pt-4 border-t border-white/20 w-full">
                <button
                    onClick={handleLogout}
                    className="p-3 w-full text-white/80 hover:text-white hover:bg-red-500/80 hover:border-red-500 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 border border-transparent"
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

export default SKSidebar;
