import express from 'express';
import dotenv from "dotenv/config";
import cors from 'cors';
import connectDB from './configs/mongodb.js';

// Routes
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import taskAssignmentRoutes from './routes/taskAssignmentRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import siteProgressReportRoutes from './routes/siteProgressReportRoutes.js';
import safetyIncidentRoutes from './routes/safetyIncidentRoutes.js';
import safetyObservationRoutes from './routes/safetyObservationRoutes.js';
import hazardReportRoutes from './routes/hazardReportRoutes.js';
import safetyNoticeRoutes from './routes/safetyNoticeRoutes.js';
import ptwRoutes from './routes/ptwRoutes.js';
import toolRoutes from './routes/toolRoutes.js';
import materialRequestRoutes from './routes/materialRequestRoutes.js';
import safetyDashboardRoutes from './routes/safetyDashboardRoutes.js';
import pmDashboardRoutes from './routes/pmDashboardRoutes.js';
import seDashboardRoutes from './routes/seDashboardRoutes.js';
import adminDashboardRoutes from './routes/adminDashboardRoutes.js';
import riskAssessmentRoutes from './routes/riskAssessmentRoutes.js';
import workerRoutes from './routes/workerRoutes.js';
import workerPortalRoutes from './routes/workerPortalRoutes.js';
import mainStorageRoutes from './routes/mainStorageRoutes.js';

import protect from './middlewares/authMiddleware.js';
import { validateRequest } from './middlewares/validateRequest.js';
import { loadProject } from './middlewares/rbacMiddleware.js';
import { projectIdParamSchema } from './validations/schemas.js';

const app = express();
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
    await connectDB();
}

app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));
app.use(express.json());

// ----------------------------------------
// API Routes (Strict REST Nested Structure)
// ----------------------------------------

// Global User endpoints
app.use('/api/users', express.json(), userRoutes);

// Core Project Base endpoints
app.use('/api/projects', express.json(), projectRoutes);

// Nested Resource Routing
// e.g. /api/projects/:projectId/tasks
const projectScopedMiddlewares = [
    protect,
    validateRequest({ params: projectIdParamSchema }),
    loadProject
];

app.use('/api/projects/:projectId/tasks', projectScopedMiddlewares, express.json(), taskRoutes);
app.use('/api/projects/:projectId/issues', projectScopedMiddlewares, express.json(), issueRoutes);
app.use('/api/projects/:projectId/task-assignments', projectScopedMiddlewares, express.json(), taskAssignmentRoutes);
app.use('/api/projects/:projectId/site-progress-reports', projectScopedMiddlewares, express.json(), siteProgressReportRoutes);
app.use('/api/projects/:projectId/safety-incidents', projectScopedMiddlewares, express.json(), safetyIncidentRoutes);
app.use('/api/projects/:projectId/safety-observations', projectScopedMiddlewares, express.json(), safetyObservationRoutes);
app.use('/api/projects/:projectId/hazard-reports', projectScopedMiddlewares, express.json(), hazardReportRoutes);
app.use('/api/projects/:projectId/safety-notices', projectScopedMiddlewares, express.json(), safetyNoticeRoutes);
app.use('/api/projects/:projectId/ptws', projectScopedMiddlewares, express.json(), ptwRoutes);
app.use('/api/projects/:projectId/safety-summary', projectScopedMiddlewares, express.json(), safetyDashboardRoutes);

// Worker Management (project-scoped)
app.use('/api/projects/:projectId/workers', projectScopedMiddlewares, express.json(), workerRoutes);

// Store Keeper Ecosystem Mounts
app.use('/api/projects/:projectId/tools', projectScopedMiddlewares, express.json(), toolRoutes);
app.use('/api/projects/:projectId/material-requests', projectScopedMiddlewares, express.json(), materialRequestRoutes);


// Global PM & SE & Worker Aggregation endpoints
app.use('/api/pm', pmDashboardRoutes);
app.use('/api/se', seDashboardRoutes);
app.use('/api/worker', workerPortalRoutes);

// Admin & Risk Assessment endpoints
app.use('/api/admin', adminDashboardRoutes);
app.use('/api/risk-assessments', riskAssessmentRoutes);

// Store Keeper Global Routes (not project-scoped)
app.use('/api/store', express.json(), mainStorageRoutes);

app.get('/', (req, res) => {
    res.send('SiteNex Backend is running!');
});


app.use((req, res) => {
    res.status(404).json({
        message: "Route not found",
        method: req.method,
        path: req.originalUrl
    });
});

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

export default app;