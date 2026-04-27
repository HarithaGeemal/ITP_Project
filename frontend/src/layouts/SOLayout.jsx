import React from 'react';
import { Outlet } from 'react-router-dom';
import SOSidebar from '../components/SO/SOSidebar';
import SONavBar from '../components/SO/SONavBar';
import Footer from '../components/PM/Footer';

const SOLayout = () => {
    return (
        <div className="flex h-screen bg-concrete-light overflow-hidden font-sans">
            <SOSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <SONavBar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-concrete-light">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default SOLayout;
