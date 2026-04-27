import { createContext, useEffect, useState, useContext, useCallback } from "react";
import useAxios from "../hooks/useAxios";

export const AdminContext = createContext();

export const AdminProvider = (props) => {
    const axiosClient = useAxios();

    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [riskAssessments, setRiskAssessments] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- Fetch Functions ---

    const fetchStats = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/admin/stats");
            if (data.success) setStats(data.stats);
        } catch (error) { console.error("Error fetching admin stats:", error); }
    }, [axiosClient]);

    const fetchUsers = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/users");
            if (data.success) {
                setUsers(data.users.map(u => ({ ...u, id: u._id })));
            }
        } catch (error) { console.error("Error fetching users:", error); }
    }, [axiosClient]);

    const fetchProjects = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/admin/projects");
            if (data.success) {
                setProjects(data.projects.map(p => ({ ...p, id: p._id })));
            }
        } catch (error) { console.error("Error fetching projects:", error); }
    }, [axiosClient]);

    const fetchRiskAssessments = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/risk-assessments");
            if (data.success) {
                setRiskAssessments(data.assessments.map(a => ({ ...a, id: a._id })));
            }
        } catch (error) { console.error("Error fetching risk assessments:", error); }
    }, [axiosClient]);

    // --- Actions ---

    const updateUserRole = async (userId, userRole) => {
        try {
            await axiosClient.put(`/users/${userId}`, { userRole });
            await fetchUsers();
        } catch (e) { console.error("Error updating user:", e.response?.data || e.message); }
    };

    const toggleUserStatus = async (userId) => {
        try {
            await axiosClient.patch(`/users/${userId}/toggle-status`);
            await fetchUsers();
        } catch (e) { console.error("Error toggling user status:", e.response?.data || e.message); }
    };

    const deleteRiskAssessment = async (id) => {
        try {
            const { data } = await axiosClient.delete(`/risk-assessments/${id}`);
            if (data.success) {
                setRiskAssessments(prev => prev.filter(a => a.id !== id));
            }
        } catch (e) { console.error("Error deleting risk assessment:", e.response?.data || e.message); }
    };

    const runPrediction = async (id) => {
        try {
            const { data } = await axiosClient.post(`/risk-assessments/${id}/predict`);
            if (data.success) {
                await fetchRiskAssessments();
                await fetchStats();
                return data;
            }
        } catch (e) {
            const msg = e.response?.data?.message || e.message;
            console.error("Error running prediction:", msg);
            throw new Error(msg);
        }
    };

    // --- Load on mount ---
    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            await Promise.all([fetchStats(), fetchUsers(), fetchProjects(), fetchRiskAssessments()]);
            setLoading(false);
        };
        loadAll();
    }, [fetchStats, fetchUsers, fetchProjects, fetchRiskAssessments]);

    const value = {
        users, projects, riskAssessments, stats, loading,
        fetchStats, fetchUsers, fetchProjects, fetchRiskAssessments,
        updateUserRole, toggleUserStatus, deleteRiskAssessment, runPrediction,
    };

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    );
};

export const useAdminContext = () => useContext(AdminContext);
