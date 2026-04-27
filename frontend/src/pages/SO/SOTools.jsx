import React, { useState } from 'react';
import { useSOContext } from '../../context/SOContext';

// Tool model fields: name, serialNumber, condition(New/Good/Fair/Poor),
//                   totalQuantity, availableQuantity, isBlacklisted, notes

const conditionColors = {
    'New':  'bg-blue-100 text-blue-800',
    'Good': 'bg-green-100 text-green-800',
    'Fair': 'bg-yellow-100 text-yellow-800',
    'Poor': 'bg-red-100 text-red-800',
};

const SOTools = () => {
    const { activeProjectId, tools, toggleToolBlacklist } = useSOContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBlacklisted, setFilterBlacklisted] = useState('All');

    const handleToggle = async (tool) => {
        try {
            await toggleToolBlacklist(activeProjectId, tool.id, !tool.isBlacklisted);
        } catch (error) {
            alert('Failed to update tool status: ' + (error?.response?.data?.message || error.message));
        }
    };

    if (!activeProjectId) {
        return <div className="p-12 text-center text-gray-500">Please select a project to view tools.</div>;
    }

    const filtered = tools.filter(t => {
        const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.serialNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchFilter = filterBlacklisted === 'All'
            ? true
            : filterBlacklisted === 'Blacklisted'
                ? t.isBlacklisted
                : !t.isBlacklisted;
        return matchSearch && matchFilter;
    });

    const blacklistedCount = tools.filter(t => t.isBlacklisted).length;
    const poorConditionCount = tools.filter(t => t.condition === 'Poor').length;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tool Safety Check</h1>
                    <p className="text-sm text-gray-500 mt-1">Review tool conditions and blacklist defective equipment.</p>
                </div>
                <div className="flex gap-3 text-sm">
                    {blacklistedCount > 0 && (
                        <span className="bg-red-100 text-red-800 font-bold px-3 py-1 rounded-full border border-red-300">{blacklistedCount} Blacklisted</span>
                    )}
                    {poorConditionCount > 0 && (
                        <span className="bg-orange-100 text-orange-800 font-bold px-3 py-1 rounded-full border border-orange-300">{poorConditionCount} Poor Condition</span>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Search by name or serial number..."
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="flex gap-2">
                        {['All', 'Blacklisted', 'Safe'].map(f => (
                            <button key={f} onClick={() => setFilterBlacklisted(f)}
                                className={`px-3 py-1.5 rounded text-xs font-bold border transition ${filterBlacklisted === f ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider">
                                <th className="p-4 font-semibold border-b border-gray-200">Tool Name</th>
                                <th className="p-4 font-semibold border-b border-gray-200">Serial No.</th>
                                <th className="p-4 font-semibold border-b border-gray-200">Condition</th>
                                <th className="p-4 font-semibold border-b border-gray-200 text-center">Qty Available</th>
                                <th className="p-4 font-semibold border-b border-gray-200 text-center">Safety Status</th>
                                <th className="p-4 font-semibold border-b border-gray-200 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map(tool => (
                                <tr key={tool.id} className={`hover:bg-gray-50 transition-colors ${tool.isBlacklisted ? 'bg-red-50/40' : ''}`}>
                                    <td className="p-4">
                                        <p className="font-semibold text-gray-800">{tool.name}</p>
                                        {tool.notes && <p className="text-xs text-gray-400 mt-0.5">{tool.notes}</p>}
                                    </td>
                                    <td className="p-4 text-sm text-gray-500 font-mono">{tool.serialNumber || '—'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded ${conditionColors[tool.condition] || 'bg-gray-100 text-gray-700'}`}>
                                            {tool.condition || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center text-sm font-medium text-gray-700">
                                        {tool.availableQuantity} / {tool.totalQuantity}
                                    </td>
                                    <td className="p-4 text-center">
                                        {tool.isBlacklisted ? (
                                            <span className="px-2 py-1 text-xs font-bold bg-red-600 text-white rounded">BLACKLISTED</span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Safe to Use</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleToggle(tool)}
                                            title={tool.isBlacklisted ? 'Remove from blacklist' : 'Blacklist this tool — it will no longer be available for checkout'}
                                            className={`px-3 py-1.5 rounded text-xs font-bold border transition ${tool.isBlacklisted
                                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'
                                                : 'bg-red-600 text-white hover:bg-red-700 border-red-700'}`}
                                        >
                                            {tool.isBlacklisted ? 'Un-Blacklist' : 'Blacklist'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center text-gray-500 italic">
                                        {tools.length === 0 ? 'No tools registered for this project.' : 'No tools match your search.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SOTools;
