import React from 'react';
import { Outlet } from 'react-router-dom';
import SESidebar from '../components/SE/SESidebar';
import SENavBar from '../components/SE/SENavBar';
import Footer from '../components/PM/Footer';

const SELayout = () => {
    return (
        <div className="flex h-screen bg-concrete-light overflow-hidden font-sans">
            <SESidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <SENavBar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-concrete-light">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default SELayout;
