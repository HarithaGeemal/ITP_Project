import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../PM/NavBar';
import WorkerSidebar from './WorkerSidebar';
import { WorkerProvider } from '../../context/WorkerContext';

const WorkerLayout = () => {
    return (
        <div className="flex h-screen bg-slate-50">
            <WorkerSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <NavBar />
                <main className="flex-1 overflow-y-auto w-full">
                    <WorkerProvider>
                        <Outlet />
                    </WorkerProvider>
                </main>
            </div>
        </div>
    );
};

export default WorkerLayout;
