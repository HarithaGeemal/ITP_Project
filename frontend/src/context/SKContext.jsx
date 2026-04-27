import { createContext, useEffect, useState, useContext, useCallback } from "react";
import { useLocation } from "react-router-dom";
import useAxios from "../hooks/useAxios";

export const SKContext = createContext();

export const SKProvider = (props) => {
    const axiosClient = useAxios();
    const location = useLocation();

    const [materials, setMaterials] = useState([]);
    const [tools, setTools] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [allRequests, setAllRequests] = useState([]);
    const [issuanceLogs, setIssuanceLogs] = useState([]);
    const [handedOverTools, setHandedOverTools] = useState([]);
    const [materialReports, setMaterialReports] = useState([]);
    const [toolReports, setToolReports] = useState([]);

    // === Materials CRUD ===
    const fetchMaterials = useCallback(async (search = "") => {
        try {
            const url = search ? `/store/materials?search=${encodeURIComponent(search)}` : "/store/materials";
            const { data } = await axiosClient.get(url);
            if (data.success) setMaterials(data.items.map(i => ({ ...i, id: i._id })));
        } catch (error) { console.error("Error fetching materials:", error); }
    }, [axiosClient]);

    const createMaterial = async (payload) => {
        const { data } = await axiosClient.post("/store/materials", payload);
        if (data.success) await fetchMaterials();
        return data;
    };

    const updateMaterial = async (id, payload) => {
        const { data } = await axiosClient.put(`/store/materials/${id}`, payload);
        if (data.success) await fetchMaterials();
        return data;
    };

    const deleteMaterial = async (id) => {
        const { data } = await axiosClient.delete(`/store/materials/${id}`);
        if (data.success) await fetchMaterials();
        return data;
    };

    // === Tools CRUD ===
    const fetchTools = useCallback(async (search = "") => {
        try {
            const url = search ? `/store/tools?search=${encodeURIComponent(search)}` : "/store/tools";
            const { data } = await axiosClient.get(url);
            if (data.success) setTools(data.tools.map(t => ({ ...t, id: t._id })));
        } catch (error) { console.error("Error fetching tools:", error); }
    }, [axiosClient]);

    const createTool = async (payload) => {
        const { data } = await axiosClient.post("/store/tools", payload);
        if (data.success) await fetchTools();
        return data;
    };

    const updateTool = async (id, payload) => {
        const { data } = await axiosClient.put(`/store/tools/${id}`, payload);
        if (data.success) await fetchTools();
        return data;
    };

    const deleteTool = async (id) => {
        const { data } = await axiosClient.delete(`/store/tools/${id}`);
        if (data.success) await fetchTools();
        return data;
    };

    // === Requests ===
    const fetchPendingRequests = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/store/requests");
            if (data.success) setPendingRequests(data.requests.map(r => ({ ...r, id: r._id })));
        } catch (error) { console.error("Error fetching requests:", error); }
    }, [axiosClient]);

    const fetchAllRequests = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/store/all-requests");
            if (data.success) setAllRequests(data.requests.map(r => ({ ...r, id: r._id })));
        } catch (error) { console.error("Error fetching all requests:", error); }
    }, [axiosClient]);

    const issueItem = async (payload) => {
        const { data } = await axiosClient.post("/store/issue", payload);
        if (data.success) {
            await fetchPendingRequests();
            await fetchIssuanceLogs();
            await fetchMaterials();
            await fetchTools();
        }
        return data;
    };

    const denyRequest = async (requestId, notes) => {
        const { data } = await axiosClient.patch(`/store/deny-request/${requestId}`, { notes });
        if (data.success) await fetchPendingRequests();
        return data;
    };

    // === Issuance Logs ===
    const fetchIssuanceLogs = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/store/issuance-logs");
            if (data.success) setIssuanceLogs(data.logs.map(l => ({ ...l, id: l._id })));
        } catch (error) { console.error("Error fetching issuance logs:", error); }
    }, [axiosClient]);

    const updateIssuanceLog = async (id, payload) => {
        const { data } = await axiosClient.put(`/store/issuance-logs/${id}`, payload);
        if (data.success) await fetchIssuanceLogs();
        return data;
    };

    const deleteIssuanceLog = async (id) => {
        const { data } = await axiosClient.delete(`/store/issuance-logs/${id}`);
        if (data.success) await fetchIssuanceLogs();
        return data;
    };

    // === Handed Over Tools & Returns ===
    const fetchHandedOverTools = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/store/handed-over-tools");
            if (data.success) setHandedOverTools(data.logs.map(l => ({ ...l, id: l._id })));
        } catch (error) { console.error("Error fetching handed-over tools:", error); }
    }, [axiosClient]);

    const returnTool = async (id, payload) => {
        const { data } = await axiosClient.patch(`/store/return-tool/${id}`, payload);
        if (data.success) {
            await fetchHandedOverTools();
            await fetchTools();
            await fetchIssuanceLogs();
        }
        return data;
    };

    // === Reports ===
    const fetchMaterialReports = useCallback(async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.set("startDate", filters.startDate);
            if (filters.endDate) params.set("endDate", filters.endDate);
            if (filters.projectId) params.set("projectId", filters.projectId);
            const { data } = await axiosClient.get(`/store/reports/materials?${params.toString()}`);
            if (data.success) setMaterialReports(data.reports.map(r => ({ ...r, id: r._id })));
        } catch (error) { console.error("Error fetching material reports:", error); }
    }, [axiosClient]);

    const fetchToolReports = useCallback(async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.set("startDate", filters.startDate);
            if (filters.endDate) params.set("endDate", filters.endDate);
            if (filters.projectId) params.set("projectId", filters.projectId);
            const { data } = await axiosClient.get(`/store/reports/tools?${params.toString()}`);
            if (data.success) setToolReports(data.reports.map(r => ({ ...r, id: r._id })));
        } catch (error) { console.error("Error fetching tool reports:", error); }
    }, [axiosClient]);

    // === Effects ===
    useEffect(() => {
        fetchMaterials();
        fetchTools();
        fetchPendingRequests();
        fetchIssuanceLogs();
        fetchHandedOverTools();
        fetchMaterialReports();
        fetchToolReports();
    }, [fetchMaterials, fetchTools, fetchPendingRequests, fetchIssuanceLogs, fetchHandedOverTools, fetchMaterialReports, fetchToolReports, location.pathname]);

    const value = {
        materials, tools, pendingRequests, allRequests, issuanceLogs, handedOverTools, materialReports, toolReports,
        fetchMaterials, fetchTools, fetchPendingRequests, fetchAllRequests, fetchIssuanceLogs, fetchHandedOverTools, fetchMaterialReports, fetchToolReports,
        createMaterial, updateMaterial, deleteMaterial,
        createTool, updateTool, deleteTool,
        issueItem, denyRequest,
        updateIssuanceLog, deleteIssuanceLog,
        returnTool,
    };

    return (
        <SKContext.Provider value={value}>
            {props.children}
        </SKContext.Provider>
    );
};

export const useSKContext = () => useContext(SKContext);
