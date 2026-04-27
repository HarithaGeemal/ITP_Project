import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import PMLayout from "./layouts/PMLayout";
import SELayout from "./layouts/SELayout";
import Dashboard from "./pages/PM/Dashboard";
import { PMProvider } from "./context/PMContext";
import { SEProvider } from "./context/SEContext";
import { SOProvider } from "./context/SOContext";
import { SKProvider } from "./context/SKContext";
import RoleGuard from "./components/RoleGuard";
import SOLayout from "./layouts/SOLayout";
import SKLayout from "./layouts/SKLayout";
import WorkerLayout from "./components/Worker/WorkerLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import SKDashboard from "./pages/SK/SKDashboard";
import SKInventory from "./pages/SK/SKInventory";
import SKRequests from "./pages/SK/SKRequests";
import SKToolReturns from "./pages/SK/SKToolReturns";
import SKReports from "./pages/SK/SKReports";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Projects from "./pages/PM/Projects";
import Tasks from "./pages/PM/Tasks";
import Workers from "./pages/PM/Workers";
import Issues from "./pages/PM/Issues";
import DailyReports from "./pages/PM/DailyReports";
import SafetyNotices from "./pages/PM/SafetyNotices";
import ToolsEquipment from './pages/PM/ToolsEquipment';
import RiskAssessmentForm from './pages/PM/RiskAssessmentForm';

import AdminLayout from './layouts/AdminLayout';
import { AdminProvider } from './context/AdminContext';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import RiskAnalysis from './pages/Admin/RiskAnalysis';

import SEDashboard from "./pages/SE/SEDashboard";
import SETasks from "./pages/SE/SETasks";
import SEApprovals from "./pages/SE/SEApprovals";
import SEMaterials from "./pages/SE/SEMaterials";
import SEDailyReports from "./pages/SE/SEDailyReports";
import SESafetyNotices from "./pages/SE/SESafetyNotices";
import SEIssues from "./pages/SE/SEIssues";

import SODashboard from "./pages/SO/SODashboard";
import SOObservations from "./pages/SO/SOObservations";
import SOIncidents from "./pages/SO/SOIncidents";
import SOHazards from "./pages/SO/SOHazards";
import SOPTWs from "./pages/SO/SOPTWs";
import SOTools from "./pages/SO/SOTools";
import SOSafetyNotices from "./pages/SO/SOSafetyNotices";

import WorkerDashboard from "./pages/Worker/WorkerDashboard";
import WorkerTasks from "./pages/Worker/WorkerTasks";
import WorkerSafety from "./pages/Worker/WorkerSafety";
import WorkerTimesheets from "./pages/Worker/WorkerTimesheets";

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-pulse text-xl text-gray-500 font-bold">Loading...</div></div>;
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-pulse text-xl text-gray-500 font-bold">Loading...</div></div>;
    return isAuthenticated ? <RoleGuard /> : children;
};

const App = () => {
    return (
        <>
            <ToastContainer position="top-right" />
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                {/* Root redirect */}
                <Route path="/" element={
                    <PrivateRoute><RoleGuard /></PrivateRoute>
                } />

                {/* Protected PM Routes */}
                <Route path="/pm" element={
                    <PrivateRoute><PMProvider><PMLayout /></PMProvider></PrivateRoute>
                }>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="tasks" element={<Tasks />} />
                    <Route path="workers" element={<Workers />} />
                    <Route path="issues" element={<Issues />} />
                    <Route path="tools" element={<ToolsEquipment />} />
                    <Route path="risk-assessment" element={<RiskAssessmentForm />} />
                    <Route path="reports" element={<DailyReports />} />
                    <Route path="safety" element={<SafetyNotices />} />
                </Route>

                {/* Protected Admin Routes */}
                <Route path="/admin" element={
                    <PrivateRoute><AdminProvider><AdminLayout /></AdminProvider></PrivateRoute>
                }>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="risk-analysis" element={<RiskAnalysis />} />
                </Route>

                {/* Protected SE Routes — wrapped in SEProvider */}
                <Route path="/se" element={
                    <PrivateRoute><SEProvider><SELayout /></SEProvider></PrivateRoute>
                }>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<SEDashboard />} />
                    <Route path="tasks" element={<SETasks />} />
                    <Route path="approvals" element={<SEApprovals />} />
                    <Route path="materials" element={<SEMaterials />} />
                    <Route path="issues" element={<SEIssues />} />
                    <Route path="safety-notices" element={<SESafetyNotices />} />
                    <Route path="daily-reports" element={<SEDailyReports />} />
                </Route>

                {/* Protected SO Routes — wrapped in SOProvider */}
                <Route path="/so" element={
                    <PrivateRoute><SOProvider><SOLayout /></SOProvider></PrivateRoute>
                }>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<SODashboard />} />
                    <Route path="observations" element={<SOObservations />} />
                    <Route path="incidents" element={<SOIncidents />} />
                    <Route path="hazards" element={<SOHazards />} />
                    <Route path="ptws" element={<SOPTWs />} />
                    <Route path="safety-notices" element={<SOSafetyNotices />} />
                    <Route path="tools" element={<SOTools />} />
                </Route>

                {/* Protected SK Routes — wrapped in SKProvider */}
                <Route path="/sk" element={
                    <PrivateRoute><SKProvider><SKLayout /></SKProvider></PrivateRoute>
                }>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<SKDashboard />} />
                    <Route path="inventory" element={<SKInventory />} />
                    <Route path="requests" element={<SKRequests />} />
                    <Route path="tool-returns" element={<SKToolReturns />} />
                    <Route path="reports" element={<SKReports />} />
                </Route>

                {/* Protected WORKER Routes */}
                <Route path="/worker" element={
                    <PrivateRoute><WorkerLayout /></PrivateRoute>
                }>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<WorkerDashboard />} />
                    <Route path="tasks" element={<WorkerTasks />} />
                    <Route path="safety" element={<WorkerSafety />} />
                    <Route path="timesheets" element={<WorkerTimesheets />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </>
    );
};


export default App;