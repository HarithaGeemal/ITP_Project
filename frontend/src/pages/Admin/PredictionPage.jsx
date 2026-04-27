import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CITIES = [
    'Colombo', 'Galle', 'Kandy', 'Jaffna', 'Trincomalee',
    'Matara', 'Negombo', 'Anuradhapura', 'Batticaloa'
];

const WEATHER_CODES = {
    0: 'Clear sky',
    10: 'Mist',
    20: 'Drizzle',
    30: 'Rain',
    40: 'Rain showers',
    50: 'Thunderstorm',
    60: 'Heavy rain',
    70: 'Heavy thunderstorm'
};

export default function PredictionPage() {
    const [formData, setFormData] = useState({
        projectName: '',
        city: 'Colombo',
        task_duration_days: 30,
        labour_required: 10,
        equipment_units: 5,
        material_cost_usd: 50000,
        start_constraint: 5,
        resource_constraint_score: 0.5,
        site_constraint_score: 0.5,
        dependency_count: 2,
        weather_code: 0,
        rain_sum: 0,
        sunrise: '06:00',
        sunset: '18:00'
    });

    const [prediction, setPrediction] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState(null);
    const [daySuntimes, setDaySuntimes] = useState({ daylight_hours: 12 });

    useEffect(() => {
        fetchPredictions();
    }, []);

    useEffect(() => {
        const calculateDaylight = () => {
            try {
                const sunrise = new Date(`2024-01-01 ${formData.sunrise}`);
                const sunset = new Date(`2024-01-01 ${formData.sunset}`);
                const daylightMs = sunset - sunrise;
                const daylightHours = daylightMs / (1000 * 60 * 60);
                setDaySuntimes({
                    daylight_hours: Math.max(0, Math.min(24, daylightHours))
                });
            } catch {
                setDaySuntimes({ daylight_hours: 12 });
            }
        };
        calculateDaylight();
    }, [formData.sunrise, formData.sunset]);

    const fetchPredictions = async () => {
        try {
            setLoadingHistory(true);
            const response = await axios.get(`${API_BASE_URL}/api/predictions/delay?limit=50`);
            if (response.data.success) {
                setPredictions(response.data.predictions);
            }
        } catch (err) {
            console.error('Error fetching predictions:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: isNaN(value) ? value : (name.includes('_') && !name.includes('projectId') ? parseFloat(value) : value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setPrediction(null);

        try {
            const payload = {
                ...formData,
                daylight_hours: daySuntimes.daylight_hours
            };

            const response = await axios.post(
                `${API_BASE_URL}/api/predictions/delay`,
                payload
            );

            if (response.data.success) {
                setPrediction(response.data.prediction);
                fetchPredictions();
                setFormData({
                    projectId: '',
                    projectName: '',
                    city: 'Colombo',
                    task_duration_days: 30,
                    labour_required: 10,
                    equipment_units: 5,
                    material_cost_usd: 50000,
                    start_constraint: 5,
                    resource_constraint_score: 0.5,
                    site_constraint_score: 0.5,
                    dependency_count: 2,
                    weather_code: 0,
                    rain_sum: 0,
                    sunrise: '06:00',
                    sunset: '18:00'
                });
            } else {
                setError(response.data.error || 'Prediction failed');
            }
        } catch (err) {
            console.error('Error:', err);
            setError(
                err.response?.data?.error ||
                err.message ||
                'Failed to get prediction. Make sure the backend and Flask ML API are running.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this prediction?')) return;

        try {
            const response = await axios.delete(`${API_BASE_URL}/api/predictions/delay/${id}`);
            if (response.data.success) {
                fetchPredictions();
                alert('Prediction deleted successfully');
            }
        } catch (err) {
            alert('Error deleting prediction: ' + err.message);
        }
    };

    const handleEditStart = (pred) => {
        setEditingId(pred._id);
        setEditData({
            projectName: pred.projectName,
            city: pred.city
        });
    };

    const handleEditSave = async (id) => {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/api/predictions/delay/${id}`,
                editData
            );
            if (response.data.success) {
                fetchPredictions();
                setEditingId(null);
                setEditData(null);
                alert('Prediction updated successfully');
            }
        } catch (err) {
            alert('Error updating prediction: ' + err.message);
        }
    };

    const getRiskColor = (level) => {
        switch (level) {
            case 'Low':
                return { bg: 'bg-green-100', text: 'text-green-800', dot: '🟢' };
            case 'Medium':
                return { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: '🟡' };
            case 'High':
                return { bg: 'bg-red-100', text: 'text-red-800', dot: '🔴' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-800', dot: '⚪' };
        }
    };

        return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        🤖 Construction Delay Predictor
                    </h1>
                    <p className="text-gray-600">
                        Predict project delays using AI before they happen
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white rounded-lg shadow-lg p-6 space-y-6"
                        >
                            {error && (
                                <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-red-700">
                                    <p className="font-semibold">⚠️ Error</p>
                                    <p className="text-sm mt-1">{error}</p>
                                </div>
                            )}

                            <div className="border-b border-gray-200 pb-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                    📋 Project Details
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Project Name
                                        </label>
                                        <input
                                            type="text"
                                            name="projectName"
                                            value={formData.projectName}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Building A Construction"
                                            required
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            City/Location
                                        </label>
                                        <select
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        >
                                            {CITIES.map(city => (
                                                <option key={city} value={city}>
                                                    {city}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Duration (Days)
                                            </label>
                                            <input
                                                type="number"
                                                name="task_duration_days"
                                                value={formData.task_duration_days}
                                                onChange={handleInputChange}
                                                min="1"
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Labour Required
                                            </label>
                                            <input
                                                type="number"
                                                name="labour_required"
                                                value={formData.labour_required}
                                                onChange={handleInputChange}
                                                min="1"
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Equipment Units
                                            </label>
                                            <input
                                                type="number"
                                                name="equipment_units"
                                                value={formData.equipment_units}
                                                onChange={handleInputChange}
                                                min="0"
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Material Cost
                                            </label>
                                            <input
                                                type="number"
                                                name="material_cost_usd"
                                                value={formData.material_cost_usd}
                                                onChange={handleInputChange}
                                                min="0"
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Start Constraint
                                            </label>
                                            <input
                                                type="number"
                                                name="start_constraint"
                                                value={formData.start_constraint}
                                                onChange={handleInputChange}
                                                min="0"
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Dependency Count
                                            </label>
                                            <input
                                                type="number"
                                                name="dependency_count"
                                                value={formData.dependency_count}
                                                onChange={handleInputChange}
                                                min="0"
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-b border-gray-200 pb-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                    ⚙️ Constraint Scores (0-1)
                                </h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Resource Constraint
                                        </label>
                                        <input
                                            type="range"
                                            name="resource_constraint_score"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={formData.resource_constraint_score}
                                            onChange={handleInputChange}
                                            className="w-full"
                                        />
                                        <p className="text-sm text-gray-600 mt-1">
                                            {formData.resource_constraint_score.toFixed(1)}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Site Constraint
                                        </label>
                                        <input
                                            type="range"
                                            name="site_constraint_score"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={formData.site_constraint_score}
                                            onChange={handleInputChange}
                                            className="w-full"
                                        />
                                        <p className="text-sm text-gray-600 mt-1">
                                            {formData.site_constraint_score.toFixed(1)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pb-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                    🌤️ Weather Conditions
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Weather Code
                                        </label>
                                        <select
                                            name="weather_code"
                                            value={formData.weather_code}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500"
                                        >
                                            {Object.entries(WEATHER_CODES).map(([code, desc]) => (
                                                <option key={code} value={code}>
                                                    {desc}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Rain Sum (mm)
                                        </label>
                                        <input
                                            type="number"
                                            name="rain_sum"
                                            value={formData.rain_sum}
                                            onChange={handleInputChange}
                                            min="0"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Sunrise Time
                                            </label>
                                            <input
                                                type="time"
                                                name="sunrise"
                                                value={formData.sunrise}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Sunset Time
                                            </label>
                                            <input
                                                type="time"
                                                name="sunset"
                                                value={formData.sunset}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                        <p className="text-sm text-gray-700">
                                            📊 <span className="font-semibold">Daylight Hours:</span> {daySuntimes.daylight_hours.toFixed(1)} hours
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="animate-spin">⏳</span>
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <span>🔮</span>
                                        Predict Delay Risk
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            {prediction ? (
                                <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                                        📊 Prediction Results
                                    </h2>

                                    <div className={`rounded-lg p-4 ${getRiskColor(prediction.predictions.riskLevel).bg}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-2xl">
                                                {getRiskColor(prediction.predictions.riskLevel).dot}
                                            </span>
                                            <span className={`font-bold text-lg ${getRiskColor(prediction.predictions.riskLevel).text}`}>
                                                {prediction.predictions.riskLevel}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Delay Risk Level
                                        </p>
                                    </div>

                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                        <p className="text-sm text-gray-700 mb-2">Risk Probability</p>
                                        <div className="mb-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-2xl font-bold text-blue-600">
                                                    {prediction.predictions.riskProbability.toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-300 rounded-full h-3">
                                                <div
                                                    className="bg-gradient-to-r from-yellow-400 to-red-500 h-3 rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${prediction.predictions.riskProbability}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-600">
                                            Probability of project delay
                                        </p>
                                    </div>

                                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                        <p className="text-sm text-gray-700 mb-2">Predicted Delay Duration</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold text-purple-600">
                                                {prediction.predictions.delayDays}
                                            </span>
                                            <span className="text-gray-600">days</span>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-2">
                                            Estimated additional days needed
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 text-sm border border-gray-200">
                                        <p className="text-gray-700 mb-2 font-semibold">Project Summary</p>
                                        <div className="space-y-1 text-gray-600 text-xs">
                                            <p>📌 <span className="font-semibold">{prediction.projectName}</span></p>
                                            <p>📍 {prediction.city}</p>
                                            <p>🕐 Predicted: {new Date(prediction.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow-lg p-6 text-center border-2 border-dashed border-gray-300">
                                    <p className="text-gray-600">📋 Fill in the form and click "Predict Delay Risk" to see results</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">📜 Prediction History</h2>

                    {loadingHistory ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Loading predictions...</p>
                        </div>
                    ) : predictions.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-8 text-center border-2 border-dashed border-gray-300">
                            <p className="text-gray-600">No predictions yet. </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {predictions.map((pred) => (
                                <div key={pred._id} className="bg-white rounded-lg shadow-lg p-5 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
                                    {editingId === pred._id ? (
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                                                <input
                                                    type="text"
                                                    value={editData.projectName}
                                                    onChange={(e) => setEditData({...editData, projectName: e.target.value})}
                                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                                                    placeholder="Project Name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                                <select
                                                    value={editData.city}
                                                    onChange={(e) => setEditData({...editData, city: e.target.value})}
                                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                                                >
                                                    {CITIES.map(city => (
                                                        <option key={city} value={city}>{city}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditSave(pred._id)}
                                                    className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium transition"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="flex-1 px-3 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm font-medium transition"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-800">{pred.projectName}</h3>
                                                    <p className="text-xs text-gray-500">📍 {pred.city}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${getRiskColor(pred.predictions.riskLevel).bg} ${getRiskColor(pred.predictions.riskLevel).text}`}>
                                                    {pred.predictions.riskLevel}
                                                </span>
                                            </div>

                                            <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Risk Probability:</span>
                                                    <span className="font-semibold text-blue-600">{pred.predictions.riskProbability.toFixed(1)}%</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Delay Days:</span>
                                                    <span className="font-semibold text-purple-600">{pred.predictions.delayDays}</span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    📅 {new Date(pred.createdAt).toLocaleDateString()} {new Date(pred.createdAt).toLocaleTimeString()}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditStart(pred)}
                                                    className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition flex items-center justify-center gap-1"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(pred._id)}
                                                    className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition flex items-center justify-center gap-1"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}   