import React, { useState } from 'react';
import { useSKContext } from '../../context/SKContext';

const conditionColors = {
    'New': 'bg-blue-100 text-blue-800',
    'Good': 'bg-green-100 text-green-800',
    'Fair': 'bg-yellow-100 text-yellow-800',
    'Poor': 'bg-red-100 text-red-800',
    'Damaged': 'bg-red-200 text-red-900',
};

const SKInventory = () => {
    const { materials, tools, createMaterial, updateMaterial, deleteMaterial, createTool, updateTool, deleteTool } = useSKContext();

    const [activeTab, setActiveTab] = useState('Material');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formError, setFormError] = useState('');

    // Material form
    const [matName, setMatName] = useState('');
    const [matCode, setMatCode] = useState('');
    const [matQuantity, setMatQuantity] = useState(0);
    const [matCategory, setMatCategory] = useState('Other');
    const [matUnit, setMatUnit] = useState('');

    // Tool form
    const [toolName, setToolName] = useState('');
    const [toolCode, setToolCode] = useState('');
    const [toolQuantity, setToolQuantity] = useState(0);
    const [toolCondition, setToolCondition] = useState('New');

    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const resetForm = () => {
        setMatName(''); setMatCode(''); setMatQuantity(0); setMatCategory('Other'); setMatUnit('');
        setToolName(''); setToolCode(''); setToolQuantity(0); setToolCondition('New');
        setEditingItem(null); setFormError('');
    };

    const openAddModal = () => { resetForm(); setIsModalOpen(true); };

    const openEditModal = (item) => {
        resetForm();
        setEditingItem(item);
        if (activeTab === 'Material') {
            setMatName(item.name || ''); setMatCode(item.code || '');
            setMatQuantity(item.currentStock ?? item.quantity ?? 0);
            setMatCategory(item.category || 'Other'); setMatUnit(item.unit || '');
        } else {
            setToolName(item.name || ''); setToolCode(item.code || '');
            setToolQuantity(item.quantity || 0); setToolCondition(item.condition || 'New');
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        try {
            if (activeTab === 'Material') {
                if (!matName.trim() || !matCode.trim()) { setFormError('Name and Code are required.'); return; }
                const payload = { name: matName.trim(), code: matCode.trim(), quantity: Number(matQuantity), category: matCategory, unit: matUnit };
                if (editingItem) {
                    await updateMaterial(editingItem.id || editingItem._id, payload);
                } else {
                    await createMaterial(payload);
                }
            } else {
                if (!toolName.trim() || !toolCode.trim()) { setFormError('Name and Code are required.'); return; }
                const payload = { name: toolName.trim(), code: toolCode.trim(), quantity: Number(toolQuantity), condition: toolCondition };
                if (editingItem) {
                    await updateTool(editingItem.id || editingItem._id, payload);
                } else {
                    await createTool(payload);
                }
            }
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            setFormError(error?.response?.data?.message || error.message || 'Failed to save item.');
        }
    };

    const handleDelete = async (item) => {
        try {
            if (activeTab === 'Material') {
                await deleteMaterial(item.id || item._id);
            } else {
                await deleteTool(item.id || item._id);
            }
            setDeleteConfirm(null);
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to delete item.');
        }
    };

    const filteredItems = activeTab === 'Material'
        ? materials.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || (m.code || '').toLowerCase().includes(searchQuery.toLowerCase()))
        : tools.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || (t.code || '').toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Main Storage</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage materials and tools in your main storage inventory.</p>
                </div>
                <button onClick={openAddModal} className="bg-steel-blue hover:bg-steel-blue/90 text-white px-5 py-2.5 rounded-xl shadow font-semibold text-sm transition-colors flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Add {activeTab}
                </button>
            </div>

            {/* Type Tabs */}
            <div className="flex gap-2">
                {['Material', 'Tool'].map(tab => (
                    <button key={tab} onClick={() => { setActiveTab(tab); setSearchQuery(''); }}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${activeTab === tab
                            ? 'bg-steel-blue text-white border-steel-blue shadow-md'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-steel-blue/50 hover:text-steel-blue'
                        }`}
                    >
                        {tab === 'Material' ? '🧱' : '🔧'} {tab}s ({tab === 'Material' ? materials.length : tools.length})
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <input type="text" placeholder={`Search ${activeTab.toLowerCase()}s by name or code...`}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-steel-blue/30 focus:border-steel-blue outline-none transition"
                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider">
                                <th className="p-4 font-semibold border-b border-gray-200">Name</th>
                                <th className="p-4 font-semibold border-b border-gray-200">Code</th>
                                <th className="p-4 font-semibold border-b border-gray-200 text-center">Quantity</th>
                                {activeTab === 'Material' && <th className="p-4 font-semibold border-b border-gray-200">Category</th>}
                                {activeTab === 'Material' && <th className="p-4 font-semibold border-b border-gray-200">Unit</th>}
                                {activeTab === 'Tool' && <th className="p-4 font-semibold border-b border-gray-200">Tool Health</th>}
                                <th className="p-4 font-semibold border-b border-gray-200 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredItems.map(item => (
                                <tr key={item.id || item._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-semibold text-gray-800">{item.name}</td>
                                    <td className="p-4 text-sm text-gray-500 font-mono">{item.code || '—'}</td>
                                    <td className="p-4 text-center text-sm font-bold text-gray-700">
                                        {activeTab === 'Material' ? (item.currentStock ?? item.quantity ?? 0) : (item.quantity || 0)}
                                    </td>
                                    {activeTab === 'Material' && <td className="p-4 text-sm text-gray-500">{item.category || 'Other'}</td>}
                                    {activeTab === 'Material' && <td className="p-4 text-sm text-gray-500">{item.unit || 'units'}</td>}
                                    {activeTab === 'Tool' && (
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${conditionColors[item.condition] || 'bg-gray-100 text-gray-700'}`}>
                                                {item.condition || 'Unknown'}
                                            </span>
                                        </td>
                                    )}
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openEditModal(item)} className="px-3 py-1.5 rounded text-xs font-bold border border-steel-blue/50 text-steel-blue hover:bg-steel-blue/10 transition">Edit</button>
                                            <button onClick={() => setDeleteConfirm(item)} className="px-3 py-1.5 rounded text-xs font-bold border border-red-300 text-red-700 hover:bg-red-50 transition">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredItems.length === 0 && (
                                <tr>
                                    <td colSpan={activeTab === 'Material' ? 6 : 5} className="p-10 text-center text-gray-500 italic">
                                        {searchQuery ? `No ${activeTab.toLowerCase()}s match your search.` : `No ${activeTab.toLowerCase()}s in storage yet. Add one to get started.`}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800">{editingItem ? 'Edit' : 'Add'} {activeTab}</h3>
                            <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Type indicator */}
                            <div className="flex items-center gap-2 bg-steel-blue/10 rounded-lg p-3 border border-steel-blue/30">
                                <span className="text-lg">{activeTab === 'Material' ? '🧱' : '🔧'}</span>
                                <span className="text-sm font-bold text-steel-blue">Adding as: {activeTab}</span>
                            </div>

                            {formError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm font-medium">{formError}</div>
                            )}

                            {activeTab === 'Material' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Material Name *</label>
                                        <input type="text" value={matName} onChange={(e) => setMatName(e.target.value)} required
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-steel-blue/30 focus:border-steel-blue outline-none" placeholder="e.g., Portland Cement" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Material Code *</label>
                                        <input type="text" value={matCode} onChange={(e) => setMatCode(e.target.value)} required
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-steel-blue/30 focus:border-steel-blue outline-none font-mono" placeholder="e.g., MAT-001" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity</label>
                                        <input type="number" min="0" value={matQuantity} onChange={(e) => setMatQuantity(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-steel-blue/30 focus:border-steel-blue outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                                            <select value={matCategory} onChange={(e) => setMatCategory(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-steel-blue/30 focus:border-steel-blue outline-none">
                                                {['Structural', 'Electrical', 'Plumbing', 'Finishing', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Unit</label>
                                            <input type="text" value={matUnit} onChange={(e) => setMatUnit(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-steel-blue/30 focus:border-steel-blue outline-none" placeholder="e.g., bags, kg, meters" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Tool Name *</label>
                                        <input type="text" value={toolName} onChange={(e) => setToolName(e.target.value)} required
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-steel-blue/30 focus:border-steel-blue outline-none" placeholder="e.g., Angle Grinder" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Tool Code *</label>
                                        <input type="text" value={toolCode} onChange={(e) => setToolCode(e.target.value)} required
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-steel-blue/30 focus:border-steel-blue outline-none font-mono" placeholder="e.g., TL-001" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity</label>
                                        <input type="number" min="0" value={toolQuantity} onChange={(e) => setToolQuantity(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-steel-blue/30 focus:border-steel-blue outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Tool Health</label>
                                        <select value={toolCondition} onChange={(e) => setToolCondition(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-steel-blue/30 focus:border-steel-blue outline-none">
                                            {['New', 'Good', 'Fair', 'Poor', 'Damaged'].map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm">Cancel</button>
                                <button type="submit"
                                    className="px-5 py-2 bg-steel-blue text-white rounded-lg hover:bg-steel-blue/90 font-semibold text-sm shadow transition-colors">
                                    {editingItem ? 'Update' : 'Add'} {activeTab}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <div className="text-4xl mb-3">⚠️</div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Delete {activeTab}?</h3>
                        <p className="text-sm text-gray-500 mb-5">Are you sure you want to remove <strong>{deleteConfirm.name}</strong> from main storage?</p>
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

export default SKInventory;
