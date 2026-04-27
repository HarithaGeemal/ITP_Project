import React from 'react';
import { Outlet } from 'react-router-dom';
import SKSidebar from '../components/SK/SKSidebar';

const SKLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <SKSidebar />
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default SKLayout;
