import React, { useState } from 'react';
import { useSKContext } from '../../context/SKContext';

const conditionColors = {
    'New': 'bg-blue-100 text-blue-800',
    'Good': 'bg-green-100 text-green-800',
    'Fair': 'bg-yellow-100 text-yellow-800',
    'Poor': 'bg-red-100 text-red-800',
    'Damaged': 'bg-red-200 text-red-900',
};

const SKToolReturns = () => {
    const { handedOverTools, returnTool, issuanceLogs } = useSKContext();

    const [returnModal, setReturnModal] = useState(null);
    const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
    const [conditionAtReturn, setConditionAtReturn] = useState('Good');
    const [damageNotes, setDamageNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const recentReturns = issuanceLogs
        .filter(l => l.type === 'Tool' && l.status === 'Returned')
        .sort((a, b) => new Date(b.returnDate || b.updatedAt) - new Date(a.returnDate || a.updatedAt))
        .slice(0, 10);

    const openReturnModal = (log) => {
        setReturnModal(log);
        setReturnDate(new Date().toISOString().split('T')[0]);
        setConditionAtReturn(log.conditionAtIssue || 'Good');
        setDamageNotes('');
        setError('');
    };

    const handleReturn = async () => {
        if (!returnModal) return;
        setProcessing(true);
        setError('');
        try {
            await returnTool(returnModal.id || returnModal._id, {
                returnDate,
                conditionAtReturn,
                damageNotes: damageNotes || 'None',
            });
            setReturnModal(null);
        } catch (err) {
            setError(err?.response?.data?.message || err.message || 'Failed to process return.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Tool Returns</h1>
                <p className="text-sm text-gray-500 mt-0.5">Track handed-over tools and process returns with condition updates.</p>
            </div>

            {/* Active Handovers */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800">Currently Handed Over ({handedOverTools.length})</h3>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold">Active</span>
                </div>

                {handedOverTools.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-4xl mb-3">✅</p>
                        <p className="text-gray-500 font-medium">No tools are currently handed over.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                        {handedOverTools.map(log => (
                            <div key={log.id || log._id}
                                className="border border-gray-200 rounded-xl p-4 hover:border-steel-blue/50 hover:shadow-md transition-all cursor-pointer group"
                                onClick={() => openReturnModal(log)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">🔧</span>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{log.mainStorageToolId?.name || 'Unknown Tool'}</p>
                                            <p className="text-xs text-gray-400 font-mono">{log.mainStorageToolId?.code || '—'}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${conditionColors[log.conditionAtIssue] || 'bg-gray-100'}`}>
                                        {log.conditionAtIssue || '?'}
                                    </span>
                                </div>

                                <div className="space-y-1 text-xs text-gray-500">
                                    <p><strong>Project:</strong> {log.projectId?.name || '—'}</p>
                                    <p><strong>Task:</strong> {log.taskId?.name || '—'}</p>
                                    <p><strong>Issued To:</strong> {log.requestedBy?.name || '—'}</p>
                                    <p><strong>Qty:</strong> {log.issuedQuantity}</p>
                                    <p><strong>Issued Date:</strong> {new Date(log.issuedDate).toLocaleDateString()}</p>
                                </div>

                                <button className="mt-3 w-full py-2 bg-steel-blue/10 text-steel-blue rounded-lg text-xs font-bold border border-steel-blue/30 group-hover:bg-steel-blue group-hover:text-white group-hover:border-steel-blue transition-all">
                                    Process Return →
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Returns History */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-bold text-gray-800">Recent Returns</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-xs text-gray-600 uppercase tracking-wider">
                                <th className="p-4 font-semibold">Tool</th>
                                <th className="p-4 font-semibold">Project</th>
                                <th className="p-4 font-semibold text-center">Before</th>
                                <th className="p-4 font-semibold text-center">After</th>
                                <th className="p-4 font-semibold">Return Date</th>
                                <th className="p-4 font-semibold">Damage Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentReturns.length === 0 && (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-400 italic">No returns recorded yet.</td></tr>
                            )}
                            {recentReturns.map(log => (
                                <tr key={log.id || log._id} className="hover:bg-gray-50 transition">
                                    <td className="p-4">
                                        <p className="font-semibold text-sm text-gray-800">{log.mainStorageToolId?.name || '—'}</p>
                                        <p className="text-xs text-gray-400 font-mono">{log.mainStorageToolId?.code || ''}</p>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">{log.projectId?.name || '—'}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${conditionColors[log.conditionAtIssue] || 'bg-gray-100'}`}>
                                            {log.conditionAtIssue || '?'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${conditionColors[log.conditionAtReturn] || 'bg-gray-100'}`}>
                                            {log.conditionAtReturn || '?'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">{log.returnDate ? new Date(log.returnDate).toLocaleDateString() : '—'}</td>
                                    <td className="p-4 text-sm text-gray-500 max-w-[200px] truncate">{log.damageNotes || 'None'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Return Modal */}
            {returnModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">Return Tool</h3>
                            <button onClick={() => setReturnModal(null)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <div className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>
                            )}

                            {/* Auto-filled fields */}
                            <div className="bg-steel-blue/10 border border-steel-blue/30 rounded-xl p-4 space-y-2">
                                <p className="text-xs font-bold uppercase text-steel-blue tracking-wider mb-2">Tool Details (Auto-filled)</p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div><span className="text-gray-500">Tool Name:</span> <strong className="text-gray-800">{returnModal.mainStorageToolId?.name || '—'}</strong></div>
                                    <div><span className="text-gray-500">Code:</span> <strong className="font-mono text-gray-800">{returnModal.mainStorageToolId?.code || '—'}</strong></div>
                                    <div><span className="text-gray-500">Project:</span> <strong className="text-gray-800">{returnModal.projectId?.name || '—'}</strong></div>
                                    <div><span className="text-gray-500">Task:</span> <strong className="text-gray-800">{returnModal.taskId?.name || '—'}</strong></div>
                                    <div><span className="text-gray-500">Handed Over:</span> <strong className="text-gray-800">{new Date(returnModal.issuedDate).toLocaleDateString()}</strong></div>
                                    <div><span className="text-gray-500">Condition at Issue:</span> <span className={`px-2 py-0.5 text-xs font-medium rounded ${conditionColors[returnModal.conditionAtIssue] || 'bg-gray-100'}`}>{returnModal.conditionAtIssue || '?'}</span></div>
                                </div>
                            </div>

                            {/* Editable fields */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Return Date *</label>
                                <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-steel-blue/30 focus:border-steel-blue outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Tool Health at Return *</label>
                                <select value={conditionAtReturn} onChange={(e) => setConditionAtReturn(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-steel-blue/30 focus:border-steel-blue outline-none">
                                    {['New', 'Good', 'Fair', 'Poor', 'Damaged'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Damage Description</label>
                                <textarea value={damageNotes} onChange={(e) => setDamageNotes(e.target.value)} rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-steel-blue/30 focus:border-steel-blue outline-none"
                                    placeholder="Describe any damages, or type 'None' if no damages" />
                                <p className="text-xs text-gray-400 mt-1">Enter "None" if there are no damages.</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => setReturnModal(null)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm">Cancel</button>
                                <button onClick={handleReturn} disabled={processing}
                                    className="px-5 py-2 bg-steel-blue text-white rounded-lg hover:bg-steel-blue/90 font-semibold text-sm shadow transition disabled:opacity-50">
                                    {processing ? 'Processing...' : 'Confirm Return'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SKToolReturns;
