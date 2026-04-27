import { createContext, useEffect, useState, useContext, useCallback } from "react";
import useAxios from "../hooks/useAxios";

export const SOContext = createContext();

export const SOProvider = (props) => {
    const axiosClient = useAxios();
    const [projects, setProjects] = useState([]);
    const [dashboardMetrics, setDashboardMetrics] = useState(null);
    const [safetyIncidents, setSafetyIncidents] = useState([]);
    const [safetyObservations, setSafetyObservations] = useState([]);
    const [safetyNotices, setSafetyNotices] = useState([]);
    const [hazardReports, setHazardReports] = useState([]);
    const [ptws, setPtws] = useState([]);
    const [tools, setTools] = useState([]);
    const [activeProjectId, setActiveProjectId] = useState(null);
    const [tasks, setTasks] = useState([]);

    // === Projects ===
    const fetchProjects = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/projects");
            if (data.success) {
                const loadedProjects = data.projects.map(p => ({
                    ...p, id: p._id,
                    startDate: p.startDate?.split('T')[0] || '',
                    endDate: p.endDate?.split('T')[0] || '',
                }));
                setProjects(loadedProjects);
                setActiveProjectId(prev => prev ? prev : (loadedProjects[0]?.id || null));
            }
        } catch (error) { console.error("Error fetching SO projects:", error); }
    }, [axiosClient]);

    // === Dashboard ===
    // Backend endpoint: GET /api/projects/:projectId/safety-summary
    // Sub-routes exposed by safetyDashboardController: /safety-hazards and /safety-summary
    const fetchDashboardMetrics = useCallback(async (projectId) => {
        if (!projectId) return;
        try {
            const { data } = await axiosClient.get(`/projects/${projectId}/safety-summary/safety-summary`);
            if (data.success) setDashboardMetrics(data.summary);
        } catch (error) { console.error("Error fetching metrics:", error); }
    }, [axiosClient]);

    // === Safety Incidents ===
    // Backend: /api/projects/:projectId/safety-incidents
    const fetchIncidents = useCallback(async (projectId) => {
        if (!projectId) return;
        try {
            const { data } = await axiosClient.get(`/projects/${projectId}/safety-incidents`);
            if (data.success) setSafetyIncidents(data.incidents.map(i => ({ ...i, id: i._id })));
        } catch (error) { console.error("Error fetching incidents:", error); }
    }, [axiosClient]);

    const createIncident = async (projectId, payload) => {
        const { data } = await axiosClient.post(`/projects/${projectId}/safety-incidents`, payload);
        if (data.success) await fetchIncidents(projectId);
        return data;
    };

    const updateIncident = async (projectId, incidentId, payload) => {
        const { data } = await axiosClient.put(`/projects/${projectId}/safety-incidents/${incidentId}`, payload);
        if (data.success) await fetchIncidents(projectId);
        return data;
    };

    const deleteIncident = async (projectId, incidentId, deleteReason) => {
        const { data } = await axiosClient.delete(`/projects/${projectId}/safety-incidents/${incidentId}`, { data: { deleteReason } });
        if (data.success) await fetchIncidents(projectId);
        return data;
    };

    // === Safety Observations ===
    // Backend: /api/projects/:projectId/safety-observations
    const fetchObservations = useCallback(async (projectId) => {
        if (!projectId) return;
        try {
            const { data } = await axiosClient.get(`/projects/${projectId}/safety-observations`);
            if (data.success) setSafetyObservations(data.observations.map(o => ({ ...o, id: o._id })));
        } catch (error) { console.error("Error fetching observations:", error); }
    }, [axiosClient]);

    const createObservation = async (projectId, payload) => {
        const { data } = await axiosClient.post(`/projects/${projectId}/safety-observations`, payload);
        if (data.success) await fetchObservations(projectId);
        return data;
    };

    const updateObservation = async (projectId, observationId, payload) => {
        const { data } = await axiosClient.put(`/projects/${projectId}/safety-observations/${observationId}`, payload);
        if (data.success) await fetchObservations(projectId);
        return data;
    };

    const deleteObservation = async (projectId, observationId, deleteReason) => {
        const { data } = await axiosClient.delete(`/projects/${projectId}/safety-observations/${observationId}`, { data: { deleteReason } });
        if (data.success) await fetchObservations(projectId);
        return data;
    };

    // === Hazard Reports ===
    // Backend: /api/projects/:projectId/hazard-reports
    const fetchHazards = useCallback(async (projectId) => {
        if (!projectId) return;
        try {
            const { data } = await axiosClient.get(`/projects/${projectId}/hazard-reports`);
            if (data.success) setHazardReports(data.hazards.map(h => ({ ...h, id: h._id })));
        } catch (error) { console.error("Error fetching hazard reports:", error); }
    }, [axiosClient]);

    const createHazard = async (projectId, payload) => {
        const { data } = await axiosClient.post(`/projects/${projectId}/hazard-reports`, payload);
        if (data.success) await fetchHazards(projectId);
        return data;
    };

    const updateHazard = async (projectId, hazardId, payload) => {
        const { data } = await axiosClient.put(`/projects/${projectId}/hazard-reports/${hazardId}`, payload);
        if (data.success) await fetchHazards(projectId);
        return data;
    };

    const deleteHazard = async (projectId, hazardId, deleteReason) => {
        const { data } = await axiosClient.delete(`/projects/${projectId}/hazard-reports/${hazardId}`, { data: { deleteReason } });
        if (data.success) await fetchHazards(projectId);
        return data;
    };

    // === Safety Notices ===
    // Backend: /api/projects/:projectId/safety/notices
    const fetchSafetyNotices = useCallback(async (projectId) => {
        if (!projectId) return;
        try {
            const { data } = await axiosClient.get(`/projects/${projectId}/safety-notices`);
            if (data.success) setSafetyNotices(data.notices.map(n => ({ ...n, id: n._id })));
        } catch (error) { console.error("Error fetching safety notices:", error); }
    }, [axiosClient]);

    const createNotice = async (projectId, payload) => {
        const { data } = await axiosClient.post(`/projects/${projectId}/safety-notices`, payload);
        if (data.success) await fetchSafetyNotices(projectId);
        return data;
    };

    const updateNotice = async (projectId, noticeId, payload) => {
        const { data } = await axiosClient.put(`/projects/${projectId}/safety-notices/${noticeId}`, payload);
        if (data.success) await fetchSafetyNotices(projectId);
        return data;
    };

    const deleteNotice = async (projectId, noticeId, deleteReason) => {
        const { data } = await axiosClient.delete(`/projects/${projectId}/safety-notices/${noticeId}`, { data: { deleteReason } });
        if (data.success) await fetchSafetyNotices(projectId);
        return data;
    };

    // === Permits to Work (PTW) ===
    // Backend: /api/projects/:projectId/ptws
    // SO can: READ, CREATE, UPDATE (approve/deny/revoke), DELETE
    const fetchPTWs = useCallback(async (projectId) => {
        if (!projectId) return;
        try {
            const { data } = await axiosClient.get(`/projects/${projectId}/ptws`);
            if (data.success) setPtws(data.ptws.map(p => ({ ...p, id: p._id })));
        } catch (error) { console.error("Error fetching PTWs:", error); }
    }, [axiosClient]);

    const updatePTW = async (projectId, ptwId, payload) => {
        const { data } = await axiosClient.put(`/projects/${projectId}/ptws/${ptwId}`, payload);
        if (data.success) await fetchPTWs(projectId);
        return data;
    };

    const deletePTW = async (projectId, ptwId, deleteReason) => {
        const { data } = await axiosClient.delete(`/projects/${projectId}/ptws/${ptwId}`, { data: { deleteReason } });
        if (data.success) await fetchPTWs(projectId);
        return data;
    };

    // === Tasks (read-only — required for PTW taskId selection) ===
    const fetchTasks = useCallback(async (projectId) => {
        if (!projectId) return;
        try {
            const { data } = await axiosClient.get(`/projects/${projectId}/tasks`);
            if (data.success) setTasks(data.tasks.map(t => ({ ...t, id: t._id })));
        } catch (error) { console.error("Error fetching tasks:", error); }
    }, [axiosClient]);

    // === Tools ===
    // Backend: /api/projects/:projectId/tools
    // Blacklist: PATCH /api/projects/:projectId/tools/:toolId/blacklist
    const fetchTools = useCallback(async (projectId) => {
        if (!projectId) return;
        try {
            const { data } = await axiosClient.get(`/projects/${projectId}/tools`);
            if (data.success) setTools(data.tools.map(t => ({ ...t, id: t._id })));
        } catch (error) { console.error("Error fetching tools:", error); }
    }, [axiosClient]);

    const toggleToolBlacklist = async (projectId, toolId, isBlacklisted) => {
        const { data } = await axiosClient.patch(`/projects/${projectId}/tools/${toolId}/blacklist`, { isBlacklisted });
        if (data.success) await fetchTools(projectId);
        return data;
    };

    // === Effects ===
    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    useEffect(() => {
        if (activeProjectId) {
            fetchDashboardMetrics(activeProjectId);
            fetchIncidents(activeProjectId);
            fetchObservations(activeProjectId);
            fetchSafetyNotices(activeProjectId);
            fetchHazards(activeProjectId);
            fetchPTWs(activeProjectId);
            fetchTools(activeProjectId);
            fetchTasks(activeProjectId);
        }
        // Stable fetch functions wrapped in useCallback — exclude from deps to avoid re-trigger loops
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeProjectId]);

    const value = {
        projects, activeProjectId, setActiveProjectId,
        dashboardMetrics,
        safetyIncidents, safetyObservations, hazardReports, safetyNotices, ptws, tools, tasks,
        fetchProjects, fetchDashboardMetrics,
        fetchIncidents, createIncident, updateIncident, deleteIncident,
        fetchObservations, createObservation, updateObservation, deleteObservation,
        fetchHazards, createHazard, updateHazard, deleteHazard,
        fetchSafetyNotices, createNotice, updateNotice, deleteNotice,
        fetchPTWs, updatePTW, deletePTW,
        fetchTools, toggleToolBlacklist,
        fetchTasks
    };

    return (
        <SOContext.Provider value={value}>
            {props.children}
        </SOContext.Provider>
    );
};

export const useSOContext = () => useContext(SOContext);
