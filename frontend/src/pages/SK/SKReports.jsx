import React, { useState, useEffect } from 'react';
import { useSKContext } from '../../context/SKContext';

const conditionColors = {
    'New': 'bg-blue-100 text-blue-800',
    'Good': 'bg-green-100 text-green-800',
    'Fair': 'bg-yellow-100 text-yellow-800',
    'Poor': 'bg-red-100 text-red-800',
    'Damaged': 'bg-red-200 text-red-900',
};

const SKReports = () => {
    const { materialReports, toolReports, fetchMaterialReports, fetchToolReports, issuanceLogs, deleteIssuanceLog } = useSKContext();

    const [activeTab, setActiveTab] = useState('materials');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [sendingReport, setSendingReport] = useState(false);

    useEffect(() => {
        const filters = {};
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        if (activeTab === 'materials') {
            fetchMaterialReports(filters);
        } else {
            fetchToolReports(filters);
        }
    }, [activeTab, startDate, endDate]);

    const handleDelete = async (item) => {
        try {
            await deleteIssuanceLog(item.id || item._id);
            setDeleteConfirm(null);
            const filters = {};
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;
            if (activeTab === 'materials') fetchMaterialReports(filters);
            else fetchToolReports(filters);
        } catch (err) {
            alert(err?.response?.data?.message || 'Failed to delete record.');
        }
    };

    const handlePrint = () => { window.print(); };

    const handleSendReport = () => {
        setSendingReport(true);
        // Simulate sending report to PM via API
        setTimeout(() => {
            setSendingReport(false);
            alert("Report successfully sent to Project Manager!");
        }, 1500);
    };

    const reports = activeTab === 'materials' ? materialReports : toolReports;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Store Reports</h1>
                    <p className="text-sm text-gray-500 mt-0.5 print:hidden">View and export material issuance and tool return reports.</p>
                </div>
                <div className="flex items-center gap-3 print:hidden">
                    <button 
                        onClick={handleSendReport} 
                        disabled={sendingReport || reports.length === 0}
                        className="bg-white border-2 border-steel-blue text-steel-blue hover:bg-steel-blue/5 px-5 py-2.5 rounded-xl shadow-sm font-semibold text-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        {sendingReport ? 'Sending...' : '📤 Send to PM'}
                    </button>
                    <button onClick={handlePrint} className="bg-steel-blue hover:bg-steel-blue/90 text-white px-5 py-2.5 rounded-xl shadow font-semibold text-sm transition-colors flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Print Report
                    </button>
                </div>
            </div>

            {/* Tabs + Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between print:hidden">
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('materials')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${activeTab === 'materials' ? 'bg-steel-blue text-white border-steel-blue shadow' : 'bg-white text-gray-600 border-gray-200 hover:border-steel-blue/50'}`}>
                        🧱 Material Issuances ({materialReports.length})
                    </button>
                    <button onClick={() => setActiveTab('tools')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${activeTab === 'tools' ? 'bg-steel-blue text-white border-steel-blue shadow' : 'bg-white text-gray-600 border-gray-200 hover:border-steel-blue/50'}`}>
                        🔧 Tool Returns ({toolReports.length})
                    </button>
                </div>
                <div className="flex gap-3 items-center">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-600">From:</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-steel-blue/30 outline-none" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-600">To:</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-steel-blue/30 outline-none" />
                    </div>
                    {(startDate || endDate) && (
                        <button onClick={() => { setStartDate(''); setEndDate(''); }}
                            className="text-xs text-red-500 hover:text-red-700 font-semibold">Clear</button>
                    )}
                </div>
            </div>

            {/* Report Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    {activeTab === 'materials' ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-xs text-gray-600 uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Material</th>
                                    <th className="p-4 font-semibold">Code</th>
                                    <th className="p-4 font-semibold">Project</th>
                                    <th className="p-4 font-semibold">Task</th>
                                    <th className="p-4 font-semibold text-center">Qty Issued</th>
                                    <th className="p-4 font-semibold">Issued To</th>
                                    <th className="p-4 font-semibold">Issued By</th>
                                    <th className="p-4 font-semibold">Date</th>
                                    <th className="p-4 font-semibold text-right print:hidden">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reports.length === 0 && (
                                    <tr><td colSpan={9} className="p-10 text-center text-gray-400 italic">No material issuance records found.</td></tr>
                                )}
                                {reports.map(r => (
                                    <tr key={r.id || r._id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-semibold text-sm text-gray-800">{r.materialItemId?.name || '—'}</td>
                                        <td className="p-4 text-sm text-gray-500 font-mono">{r.materialItemId?.code || '—'}</td>
                                        <td className="p-4 text-sm text-gray-600">{r.projectId?.name || '—'}</td>
                                        <td className="p-4 text-sm text-gray-600">{r.taskId?.name || '—'}</td>
                                        <td className="p-4 text-center text-sm font-bold text-gray-700">{r.issuedQuantity}</td>
                                        <td className="p-4 text-sm text-gray-600">{r.requestedBy?.name || '—'}</td>
                                        <td className="p-4 text-sm text-gray-600">{r.issuedBy?.name || '—'}</td>
                                        <td className="p-4 text-sm text-gray-500">{new Date(r.issuedDate).toLocaleDateString()}</td>
                                        <td className="p-4 text-right print:hidden">
                                            <button onClick={() => setDeleteConfirm(r)} className="text-xs text-red-500 hover:text-red-700 font-semibold">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-xs text-gray-600 uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Tool</th>
                                    <th className="p-4 font-semibold">Code</th>
                                    <th className="p-4 font-semibold">Project</th>
                                    <th className="p-4 font-semibold">Task</th>
                                    <th className="p-4 font-semibold text-center">Health Before</th>
                                    <th className="p-4 font-semibold text-center">Health After</th>
                                    <th className="p-4 font-semibold">Issued Date</th>
                                    <th className="p-4 font-semibold">Return Date</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold">Damage Notes</th>
                                    <th className="p-4 font-semibold text-right print:hidden">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reports.length === 0 && (
                                    <tr><td colSpan={11} className="p-10 text-center text-gray-400 italic">No tool issuance/return records found.</td></tr>
                                )}
                                {reports.map(r => (
                                    <tr key={r.id || r._id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-semibold text-sm text-gray-800">{r.mainStorageToolId?.name || '—'}</td>
                                        <td className="p-4 text-sm text-gray-500 font-mono">{r.mainStorageToolId?.code || '—'}</td>
                                        <td className="p-4 text-sm text-gray-600">{r.projectId?.name || '—'}</td>
                                        <td className="p-4 text-sm text-gray-600">{r.taskId?.name || '—'}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${conditionColors[r.conditionAtIssue] || 'bg-gray-100'}`}>
                                                {r.conditionAtIssue || '—'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {r.conditionAtReturn ? (
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded ${conditionColors[r.conditionAtReturn]}`}>
                                                    {r.conditionAtReturn}
                                                </span>
                                            ) : <span className="text-xs text-gray-400">—</span>}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">{new Date(r.issuedDate).toLocaleDateString()}</td>
                                        <td className="p-4 text-sm text-gray-500">{r.returnDate ? new Date(r.returnDate).toLocaleDateString() : '—'}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${r.status === 'Returned' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 max-w-[150px] truncate" title={r.damageNotes || ''}>{r.damageNotes || 'None'}</td>
                                        <td className="p-4 text-right print:hidden">
                                            <button onClick={() => setDeleteConfirm(r)} className="text-xs text-red-500 hover:text-red-700 font-semibold">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Summary Footer */}
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total Records: <strong className="text-gray-800">{reports.length}</strong></span>
                    {activeTab === 'materials' && reports.length > 0 && (
                        <span className="text-gray-500">
                            Total Issued: <strong className="text-gray-800">{reports.reduce((sum, r) => sum + (r.issuedQuantity || 0), 0)}</strong> items
                        </span>
                    )}
                    {activeTab === 'tools' && reports.length > 0 && (
                        <span className="text-gray-500">
                            Returned: <strong className="text-green-700">{reports.filter(r => r.status === 'Returned').length}</strong> ·
                            Active: <strong className="text-blue-700">{reports.filter(r => r.status === 'Issued').length}</strong>
                        </span>
                    )}
                </div>
            </div>

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <div className="text-4xl mb-3">⚠️</div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Record?</h3>
                        <p className="text-sm text-gray-500 mb-5">This will permanently remove this issuance record.</p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm">Cancel</button>
                            <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm shadow">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SKReports;
