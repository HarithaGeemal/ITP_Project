import { createContext, useEffect, useState, useContext, useCallback } from "react";
import { useLocation } from "react-router-dom";
import useAxios from "../hooks/useAxios";

export const PMContext = createContext();

// --- Status Translation Maps ---
// Backend uses "Not Started", frontend UI uses "To Do"
const backendToUIStatus = {
    "Not Started": "To Do",
    "In Progress": "In Progress",
    "Under Review": "In Progress",
    "Completed": "Completed",
    "Cancelled": "Blocked",
    "On Hold": "Blocked"
};

const uiToBackendStatus = {
    "To Do": "Not Started",
    "In Progress": "In Progress",
    "Blocked": "On Hold",
    "Completed": "Completed"
};

// Backend project statuses — these match DB directly
const backendToUIProjectStatus = {
    "Planning": "Planning",
    "Active": "Active",
    "Completed": "Completed",
    "On Hold": "On Hold"
};

export const PMProvider = (props) => {
    const axiosClient = useAxios();
    const location = useLocation();

    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [issues, setIssues] = useState([]);
    const [dailyReports, setDailyReports] = useState([]);
    const [safetyObservations, setSafetyObservations] = useState([]);
    const [stopHoldNotices, setStopHoldNotices] = useState([]);
    const [blockedTasks, setBlockedTasks] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [storeReports, setStoreReports] = useState([]);

    // --- Fetch Functions (Live Backend) ---

    const fetchProjects = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/pm/projects");
            if (data.success) {
                setProjects(data.projects.map(p => ({
                    ...p,
                    id: p._id,
                    status: p.status || backendToUIProjectStatus[p.status] || "Planning",
                    progress: p.progress || 0,
                    estimatedEndDate: p.endDate?.split('T')[0] || '',
                    startDate: p.startDate?.split('T')[0] || '',
                    projectManager: p.projectManager || '',
                    siteEngineer: p.siteEngineer || '',
                })));
            }
        } catch (error) { console.error("Error fetching projects:", error); }
    }, [axiosClient]);

    const fetchTasks = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/pm/tasks");
            if (data.success) {
                setTasks(data.tasks.map(t => ({
                    ...t,
                    id: t._id,
                    projectId: t.projectId?._id || t.projectId,
                    status: backendToUIStatus[t.status] || t.status,
                    startDate: t.startDate?.split('T')[0] || '',
                    endDate: t.endDate?.split('T')[0] || '',
                    assignedTo: t.assignedWorkers || [],
                    assignedSiteEngineers: t.assignedSiteEngineers || [],
                    assignedStoreKeepers: t.assignedStoreKeepers || [],
                })));
            }
        } catch (error) { console.error("Error fetching tasks:", error); }
    }, [axiosClient]);

    const fetchWorkers = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/pm/workers");
            if (data.success) {
                setWorkers(data.workers.map(w => ({
                    ...w,
                    id: w._id,
                    projectId: w.projectId?._id || w.projectId,
                    projectName: w.projectId?.name || '',
                    trade: w.trade || 'Other',
                    status: w.status || 'Active',
                })));
            }
        } catch (error) { console.error("Error fetching workers:", error); }
    }, [axiosClient]);

    const fetchIssues = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/pm/issues");
            if (data.success) {
                setIssues(data.issues.map(i => ({
                    ...i,
                    id: i._id,
                    projectId: i.projectId?._id || i.projectId,
                    taskName: i.taskId?.name || '',
                    reportedLocation: i.reportedLocation || '',
                    reportedDate: i.reportedDate?.split('T')[0] || i.createdAt?.split('T')[0] || '',
                    reportedBy: typeof i.createdBy === 'object' ? i.createdBy?.name : (i.createdBy || 'User'),
                })));
            }
        } catch (error) { console.error("Error fetching issues:", error); }
    }, [axiosClient]);

    const fetchDailyReports = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/pm/reports");
            if (data.success) {
                setDailyReports(data.reports.map(r => ({
                    ...r,
                    id: r._id,
                    projectId: r.projectId?._id || r.projectId,
                    projectName: r.projectId?.name || '',
                    date: r.reportDate?.split('T')[0] || r.date?.split('T')[0] || r.createdAt?.split('T')[0] || '',
                    submittedBy: typeof r.reportedBy === 'object' ? r.reportedBy?.name : (r.reportedBy || 'Unknown'),
                    workCompleted: r.workCompleted || r.summary || 'No details provided',
                    weather: r.weatherNotes || '',
                    notes: r.plannedNextSteps || '',
                    delaysOrRisks: r.delaysOrRisks || '',
                })));
            }
        } catch (error) { console.error("Error fetching reports:", error); }
    }, [axiosClient]);

    const fetchSafetyObservations = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/pm/safety-observations");
            if (data.success) {
                setSafetyObservations(data.safetyObservations.map(o => ({
                    ...o,
                    id: o._id,
                    projectId: o.projectId?._id || o.projectId,
                    projectName: o.projectId?.name || '',
                    observer: typeof o.reportedBy === 'object' ? o.reportedBy?.name : (o.reportedBy || 'Unknown'),
                    date: o.createdAt?.split('T')[0] || '',
                    description: o.title || o.notes || '',
                    actionTaken: o.notes || '',
                })));
            }
        } catch (error) { console.error("Error fetching safety observations:", error); }
    }, [axiosClient]);

    const fetchStopHoldNotices = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/pm/safety-notices");
            if (data.success) {
                setStopHoldNotices(data.safetyNotices.map(n => ({
                    ...n,
                    id: n._id,
                    projectId: n.projectId?._id || n.projectId,
                    dateIssued: n.dateIssued?.split('T')[0] || n.createdAt?.split('T')[0] || '',
                    issuedBy: typeof n.issuedBy === 'object' ? n.issuedBy?.name : (n.issuedBy || 'Unknown'),
                    dateLifted: n.dateLifted?.split('T')[0] || '',
                })));
            }
        } catch (error) { console.error("Error fetching safety notices:", error); }
    }, [axiosClient]);

    const fetchAvailableUsers = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/pm/available-users");
            if (data.success) setAvailableUsers(data.users);
        } catch (error) { console.error("Error fetching available users:", error); }
    }, [axiosClient]);

    // --- Shared Helpers ---
    const upsertById = (collection, item) => {
        const exists = collection.find(c => c.id === item.id);
        if (exists) return collection.map(c => c.id === item.id ? { ...c, ...item } : c);
        return [...collection, item];
    };

    const removeById = (collection, id) => collection.filter(item => item.id !== id);

    // --- CRUD Functions ---

    // Projects
    const addProject = async (project) => {
        try {
            const payload = {
                name: project.name,
                location: project.location,
                startDate: project.startDate,
                endDate: project.estimatedEndDate || project.endDate,
                description: project.description || '',
                budget: parseFloat(project.budget) || 0,
                status: project.status || 'Planning',
                clientName: project.clientName || '',
                projectCode: project.projectCode || '',
                plannedBudget: parseFloat(project.plannedBudget) || undefined,
                assignedSiteEngineers: project.assignedSiteEngineers || [],
                assignedStoreKeepers: project.assignedStoreKeepers || [],
                assignedSafetyOfficers: project.assignedSafetyOfficers || [],
            };
            const { data } = await axiosClient.post('/projects', payload);
            if (data.success) await fetchProjects();
            return null;
        } catch (e) {
            const msg = e.response?.data?.message || e.message;
            console.error("Error creating project:", msg);
            return msg;
        }
    };

    const updateProject = async (id, updated) => {
        try {
            const payload = {};
            if (updated.name) payload.name = updated.name;
            if (updated.location) payload.location = updated.location;
            if (updated.startDate) payload.startDate = updated.startDate;
            if (updated.estimatedEndDate || updated.endDate) payload.endDate = updated.estimatedEndDate || updated.endDate;
            if (updated.description) payload.description = updated.description;
            if (updated.budget !== undefined) payload.budget = parseFloat(updated.budget) || 0;
            if (updated.status) payload.status = updated.status;
            if (updated.plannedBudget !== undefined) payload.plannedBudget = parseFloat(updated.plannedBudget) || 0;
            if (updated.clientName !== undefined) payload.clientName = updated.clientName;

            await axiosClient.put(`/projects/${id}`, payload);
            await fetchProjects();
            return null; // no error
        } catch (e) {
            const msg = e.response?.data?.message || e.message;
            console.error("Error updating project:", msg);
            return msg;
        }
    };

    const deleteProject = async (id) => {
        try {
            await axiosClient.delete(`/projects/${id}`, { data: { reason: "PM deleted project" } });
            setProjects(prev => removeById(prev, id));
            setTasks(prev => prev.filter(t => t.projectId !== id && (t.projectId && t.projectId._id !== id)));
        } catch (e) {
            const msg = e.response?.data?.message || e.message;
            console.error("Error deleting project:", msg);
            alert('Failed to delete project: ' + msg);
        }
    };

    // Tasks
    const addTask = async (task) => {
        try {
            const projectId = task.projectId;
            if (!projectId) return 'Please select a project.';

            const payload = {
                name: task.name,
                description: task.description,
                startDate: task.startDate,
                endDate: task.endDate,
                priority: task.priority || 'Medium',
                status: uiToBackendStatus[task.status] || 'Not Started',
                assignedWorkers: task.assignedTo || [],
                assignedSiteEngineers: task.assignedSiteEngineers || [],
                assignedStoreKeepers: task.assignedStoreKeepers || [],
            };
            const { data } = await axiosClient.post(`/projects/${projectId}/tasks`, payload);
            if (data.success) await fetchTasks();
            return null;
        } catch (e) {
            const msg = e.response?.data?.message || e.message;
            console.error("Error creating task:", msg);
            return msg;
        }
    };

    const updateTask = async (id, updated) => {
        const existing = tasks.find(t => t.id === id);
        if (!existing) return 'Task not found';
        try {
            const payload = {};
            if (updated.name) payload.name = updated.name;
            if (updated.description) payload.description = updated.description;
            if (updated.startDate) payload.startDate = updated.startDate;
            if (updated.endDate) payload.endDate = updated.endDate;
            if (updated.priority) payload.priority = updated.priority;
            if (updated.status) payload.status = uiToBackendStatus[updated.status] || updated.status;
            if (updated.assignedTo) payload.assignedWorkers = updated.assignedTo;
            if (updated.assignedSiteEngineers) payload.assignedSiteEngineers = updated.assignedSiteEngineers;
            if (updated.assignedStoreKeepers) payload.assignedStoreKeepers = updated.assignedStoreKeepers;

            await axiosClient.put(`/projects/${existing.projectId}/tasks/${id}`, payload);
            await fetchTasks();
            return null;
        } catch (e) {
            const msg = e.response?.data?.message || e.message;
            console.error("Error updating task:", msg);
            return msg;
        }
    };

    const approveTaskCompletion = async (id, note = "Approved by PM") => {
        const existing = tasks.find(t => t.id === id);
        if (!existing) return;
        try {
            await axiosClient.patch(`/projects/${existing.projectId}/tasks/${id}/approve-completion`, { note });
            await fetchTasks();
        } catch (e) {
            const msg = e.response?.data?.message || e.message;
            console.error("Error approving task:", msg);
            alert('Failed to approve task completion: ' + msg);
        }
    };

    const deleteTask = async (id) => {
        const existing = tasks.find(t => t.id === id);
        if (!existing) return;
        try {
            await axiosClient.patch(`/projects/${existing.projectId}/tasks/${id}/cancel`, { reason: "PM cancelled task" });
            await fetchTasks();
        } catch (e) {
            const msg = e.response?.data?.message || e.message;
            console.error("Error cancelling task:", msg);
            alert('Failed to delete task: ' + msg);
        }
    };

    // Workers — project-scoped field workers (separate from system Users)
    const addWorker = async (worker) => {
        try {
            const projectId = worker.projectId;
            if (!projectId) { alert('Please select a project.'); return; }

            const payload = {
                userId: worker.userId || undefined,
                name: worker.name,
                trade: worker.trade || 'Other',
                phone: worker.phone || '',
                nic: worker.nic || '',
                status: worker.status || 'Active',
            };
            const { data } = await axiosClient.post(`/projects/${projectId}/workers`, payload);
            if (data.success) await fetchWorkers();
        } catch (e) {
            const msg = e.response?.data?.message || e.message;
            console.error("Error adding worker:", msg);
            alert('Failed to add worker: ' + msg);
        }
    };

    const updateWorker = async (id, updated) => {
        const existing = workers.find(w => w.id === id);
        if (!existing) return;
        try {
            const payload = {};
            if (updated.name) payload.name = updated.name;
            if (updated.trade) payload.trade = updated.trade;
            if (updated.phone !== undefined) payload.phone = updated.phone;
            if (updated.nic !== undefined) payload.nic = updated.nic;
            if (updated.status) payload.status = updated.status;

            await axiosClient.put(`/projects/${existing.projectId}/workers/${id}`, payload);
            await fetchWorkers();
        } catch (e) { console.error("Error updating worker:", e.response?.data || e.message); }
    };

    const deleteWorker = async (id) => {
        const existing = workers.find(w => w.id === id);
        if (!existing) { alert('Worker not found in local state.'); return; }
        try {
            await axiosClient.delete(`/projects/${existing.projectId}/workers/${id}`);
            await fetchWorkers();
        } catch (e) {
            const msg = e.response?.data?.message || e.message;
            console.error("Error deleting worker:", msg);
            alert('Failed to remove worker: ' + msg);
        }
    };

    // Issues
    const addIssue = async (issue) => {
        try {
            const projectId = issue.projectId;
            if (!projectId) return console.error("No projectId for issue creation");

            const payload = {
                title: issue.title,
                description: issue.description,
                priority: issue.priority || 'Medium',
                type: issue.type || 'Other',
            };
            const { data } = await axiosClient.post(`/projects/${projectId}/issues`, payload);
            if (data.success) await fetchIssues();
        } catch (e) { console.error("Error creating issue:", e.response?.data || e.message); }
    };

    const updateIssue = async (id, updated) => {
        const existing = issues.find(i => i.id === id);
        if (!existing) return;
        try {
            const payload = {};
            if (updated.title) payload.title = updated.title;
            if (updated.description) payload.description = updated.description;
            if (updated.priority) payload.priority = updated.priority;
            if (updated.type) payload.type = updated.type;

            await axiosClient.put(`/projects/${existing.projectId}/issues/${id}`, payload);
            await fetchIssues();
        } catch (e) { console.error("Error updating issue:", e.response?.data || e.message); }
    };

    const deleteIssue = async (id) => {
        const existing = issues.find(i => i.id === id);
        if (!existing) return;
        try {
            await axiosClient.delete(`/projects/${existing.projectId}/issues/${id}`);
            setIssues(prev => removeById(prev, id));
        } catch (e) { console.error("Error deleting issue:", e.response?.data || e.message); }
    };

    // Issue Workflow
    const assignIssue = async (id, assignedToUserId) => {
        const existing = issues.find(i => i.id === id);
        if (!existing) return;
        try {
            await axiosClient.patch(`/projects/${existing.projectId}/issues/${id}/assign`, { assignedTo: assignedToUserId });
            await fetchIssues();
        } catch (e) { console.error("Error assigning issue:", e.response?.data || e.message); }
    };

    const resolveIssue = async (id, resolutionNote) => {
        const existing = issues.find(i => i.id === id);
        if (!existing) return;
        try {
            await axiosClient.patch(`/projects/${existing.projectId}/issues/${id}/resolve`, { resolutionNote });
            await fetchIssues();
        } catch (e) { console.error("Error resolving issue:", e.response?.data || e.message); }
    };

    const closeIssue = async (id) => {
        const existing = issues.find(i => i.id === id);
        if (!existing) return;
        try {
            await axiosClient.patch(`/projects/${existing.projectId}/issues/${id}/close`);
            await fetchIssues();
        } catch (e) { console.error("Error closing issue:", e.response?.data || e.message); }
    };

    const updateIssueStatus = async (id, status) => {
        const existing = issues.find(i => i.id === id);
        if (!existing) return;
        try {
            await axiosClient.patch(`/projects/${existing.projectId}/issues/${id}/status`, { status });
            await fetchIssues();
        } catch (e) { console.error("Error updating issue status:", e.response?.data || e.message); }
    };

    // Project Members
    const addProjectMember = async (projectId, userId, role, isPrimary = false) => {
        try {
            await axiosClient.post(`/projects/${projectId}/members`, { userId, role, isPrimary });
        } catch (e) { console.error("Error adding member:", e.response?.data || e.message); }
    };

    const removeProjectMember = async (projectId, userId) => {
        try {
            await axiosClient.delete(`/projects/${projectId}/members/${userId}`);
        } catch (e) { console.error("Error removing member:", e.response?.data || e.message); }
    };

    // Blocked Tasks
    const fetchBlockedTasks = useCallback(async (projectId) => {
        try {
            const { data } = await axiosClient.get(`/projects/${projectId}/tasks/blocked`);
            if (data.success) {
                setBlockedTasks(data.tasks.map(t => ({
                    ...t,
                    id: t._id,
                    projectId: t.projectId?._id || t.projectId,
                    status: backendToUIStatus[t.status] || t.status,
                    startDate: t.startDate?.split('T')[0] || '',
                    endDate: t.endDate?.split('T')[0] || '',
                })));
            }
        } catch (e) { console.error("Error fetching blocked tasks:", e.response?.data || e.message); }
    }, [axiosClient]);

    // Daily Reports
    const addDailyReport = async (report) => {
        try {
            const projectId = report.projectId;
            if (!projectId) return console.error("No projectId for report creation");

            const payload = {
                reportDate: report.date,
                summary: report.workCompleted || report.summary,
                workCompleted: report.workCompleted || '',
                plannedNextSteps: report.notes || '',
                weatherNotes: report.weather || '',
            };
            const { data } = await axiosClient.post(`/projects/${projectId}/site-progress-reports`, payload);
            if (data.success) await fetchDailyReports();
        } catch (e) { console.error("Error creating report:", e.response?.data || e.message); }
    };

    const updateDailyReport = (id, updated) => setDailyReports(prev => upsertById(prev, { ...updated, id }));
    const deleteDailyReport = (id) => setDailyReports(prev => removeById(prev, id));

    // Hold Task
    const holdTask = async (payload) => {
        try {
            const { data } = await axiosClient.post("/pm/hold-task", payload);
            if (data.success) {
                await fetchTasks();
                await fetchStopHoldNotices();
                fetchSafetyObservations();
                return { success: true };
            }
        } catch (e) {
            const msg = e.response?.data?.message || e.message;
            console.error("Error holding task:", msg);
            alert('Failed to hold task: ' + msg);
            return { success: false, message: msg };
        }
    };

    // Update Notice Severity
    const updateNoticeSeverity = async (noticeId, severity) => {
        try {
            const { data } = await axiosClient.patch(`/pm/safety-notices/${noticeId}/severity`, { severity });
            if (data.success) {
                await fetchStopHoldNotices();
                return { success: true };
            }
        } catch (e) {
            const msg = e.response?.data?.message || e.message;
            console.error("Error updating notice severity:", msg);
            alert('Failed to update severity: ' + msg);
            return { success: false, message: msg };
        }
    };

    // Safety Observations — local state only for now
    const addSafetyObservation = (obs) => setSafetyObservations(prev => [...prev, { ...obs, id: `SAF-${Date.now()}` }]);
    const updateSafetyObservation = (id, updated) => setSafetyObservations(prev => upsertById(prev, { ...updated, id }));
    const deleteSafetyObservation = (id) => setSafetyObservations(prev => removeById(prev, id));

    // Stop/Hold Notices
    const addStopHoldNotice = (notice) => setStopHoldNotices(prev => [...prev, { ...notice, id: `SHN-${Date.now()}` }]);
    const updateStopHoldNotice = (id, updated) => setStopHoldNotices(prev => upsertById(prev, { ...updated, id }));
    const deleteStopHoldNotice = (id) => setStopHoldNotices(prev => removeById(prev, id));

    // --- Computed Helper Functions ---

    const getProjectTasks = (projectId) => tasks.filter(task => task.projectId === projectId);
    const getProjectIssues = (projectId) => issues.filter(issue => issue.projectId === projectId);

    const calculateProjectProgress = (projectId) => {
        const projectTasks = getProjectTasks(projectId);
        if (projectTasks.length === 0) return 0;
        const completedTasks = projectTasks.filter(task => task.status === "Completed").length;
        return Math.round((completedTasks / projectTasks.length) * 100);
    };

    const countOpenIssues = (projectId) => {
        return getProjectIssues(projectId).filter(issue => issue.status === "Open" || issue.status === "In Progress").length;
    };

    const getWorkerTaskLoad = (workerId) => {
        return tasks.filter(task => task.assignedTo && task.assignedTo.includes(workerId) && task.status !== "Completed").length;
    };

    const getOverdueTasks = (referenceDate) => {
        const refDateObj = new Date(referenceDate);
        return tasks.filter(task => {
            if (task.status === "Completed") return false;
            const dueDate = new Date(task.endDate);
            return dueDate < refDateObj;
        });
    };

    const fetchStoreReports = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/pm/store-reports");
            if (data.success) setStoreReports(data.reports.map(r => ({ ...r, id: r._id })));
        } catch (error) { console.error("Error fetching store reports:", error); }
    }, [axiosClient]);

    // --- useEffects ---
    useEffect(() => {
        fetchProjects();
        fetchTasks();
        fetchWorkers();
        fetchIssues();
        fetchDailyReports();
        fetchSafetyObservations();
        fetchStopHoldNotices();
        fetchAvailableUsers();
        fetchStoreReports();
    }, [fetchProjects, fetchTasks, fetchWorkers, fetchIssues, fetchDailyReports, fetchSafetyObservations, fetchStopHoldNotices, fetchBlockedTasks, fetchAvailableUsers, fetchStoreReports, location.pathname]);

    // --- Context Value ---
    const value = {
        projects, tasks, workers, issues, dailyReports, safetyObservations, stopHoldNotices, blockedTasks, availableUsers, storeReports,
        fetchProjects, fetchTasks, fetchWorkers, fetchIssues, fetchDailyReports, fetchSafetyObservations, fetchStopHoldNotices, fetchBlockedTasks, fetchAvailableUsers, fetchStoreReports,
        addProject, updateProject, deleteProject,
        addTask, updateTask, deleteTask, approveTaskCompletion,
        addWorker, updateWorker, deleteWorker,
        addIssue, updateIssue, deleteIssue, assignIssue, resolveIssue, closeIssue, updateIssueStatus,
        addProjectMember, removeProjectMember,
        addDailyReport, updateDailyReport, deleteDailyReport,
        addSafetyObservation, updateSafetyObservation, deleteSafetyObservation,
        addStopHoldNotice, updateStopHoldNotice, deleteStopHoldNotice,
        holdTask,
        updateNoticeSeverity,
        getProjectTasks, getProjectIssues, calculateProjectProgress, countOpenIssues, getWorkerTaskLoad, getOverdueTasks
    };

    return (
        <PMContext.Provider value={value}>
            {props.children}
        </PMContext.Provider>
    );
};

export const usePMContext = () => useContext(PMContext);
