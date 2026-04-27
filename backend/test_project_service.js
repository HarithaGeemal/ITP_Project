import mongoose from "mongoose";
import dotenv from "dotenv";
import ProjectService from "./services/projectService.js";
import Project from "./models/projects.js";

dotenv.config();

/**
 * Separate testing script for Project Manager service logic.
 * This tests the backend services without breaking or modifying main application code.
 * Run this string from terminal: `node test_project_service.js`
 */
async function runTests() {
    try {
        // Connect to MongoDB
        const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sitenex";
        console.log(`[TEST] Connecting to Database: ${uri}`);
        await mongoose.connect(uri);
        console.log("[TEST] Database connected successfully.\n");

        // 1. Find a sample project to test with
        const project = await Project.findOne();
        
        if (!project) {
            console.log("[TEST] No projects found in the database. Please create a project first to test PM features.");
            return;
        }

        const projectId = project._id.toString();
        console.log(`[TEST] Using Project ID: ${projectId} (Name: ${project.name})`);

        // 2. Test getProjectDashboard
        console.log("\n[TEST] 1. Testing ProjectService.getProjectDashboard()...");
        try {
            const dashboardData = await ProjectService.getProjectDashboard(projectId);
            console.log("[TEST] Dashboard Data successfully retrieved:");
            console.log(JSON.stringify(dashboardData, null, 2));
        } catch (err) {
            console.error("[TEST] Error getting dashboard data:", err.message);
        }

        // 3. Test getProjectGantt
        console.log("\n[TEST] 2. Testing ProjectService.getProjectGantt()...");
        try {
            const ganttData = await ProjectService.getProjectGantt(projectId);
            console.log(`[TEST] Gantt Data successfully retrieved (${ganttData.length} tasks found).`);
            if (ganttData.length > 0) {
                 console.log("[TEST] Sample Task from Gantt:");
                 console.log(JSON.stringify(ganttData[0], null, 2));
            }
        } catch (err) {
            console.error("[TEST] Error getting gantt data:", err.message);
        }

        console.log("\n[TEST] All read-only Project Manager service tests completed successfully!");
        
        // Note: ProjectService.deleteProject is deliberately left out to avoid accidental destruction
        // of testing data. It can be invoked manually here if needed.
        // await ProjectService.deleteProject(projectId, "mockUserId", "Test Deletion");

    } catch (error) {
        console.error("[TEST] Testing script crashed:", error);
    } finally {
        // Always close connection
        await mongoose.connection.close();
        console.log("[TEST] Database connection closed.");
    }
}

runTests();
