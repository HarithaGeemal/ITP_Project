import mongoose from "mongoose";
import dotenv from "dotenv/config";
import connectDB from "./configs/mongodb.js";

// Models
import User from "./models/users.js";
import Project from "./models/projects.js";
import ProjectMembership from "./models/projectMembership.js";
import Task from "./models/task.js";
import SafetyObservation from "./models/safetyObservation.js";
import HazardReport from "./models/hazardReport.js";
import SafetyNotice from "./models/safetyNotice.js";
import PermitToWork from "./models/permitToWork.js";
import DeletionLog from "./models/deletionLog.js";

// Controllers
import * as taskController from "./controllers/taskController.js";
import * as observationController from "./controllers/safetyObservationController.js";
import * as hazardController from "./controllers/hazardReportController.js";
import * as noticeController from "./controllers/safetyNoticeController.js";
import * as ptwController from "./controllers/ptwController.js";
import * as dashboardController from "./controllers/safetyDashboardController.js";

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

const runVerification = async () => {
    await connectDB();
    console.log("=== Starting Phase 1 Safety Verification ===\n");

    // 1. Setup Test Data
    const pm = await User.findOne({ name: "Alice Manager" }) || await User.findOne();
    const safetyOfficer = await User.findOne({ name: "Sam Safety" }) || await User.findOne({ _id: { $ne: pm._id } });

    console.log(`[Setup] Using PM: ${pm.email}`);
    console.log(`[Setup] Using SO: ${safetyOfficer.email}`);

    // Create a dummy project
    const project = await Project.create({
        name: "Phase 1 Safety Verification Project",
        location: "Test Location",
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        projectCode: "SAF-101"
    });

    console.log(`[Setup] Created Project: ${project._id}`);

    // Create a task
    const task = await Task.create({
        projectId: project._id,
        name: "Excavation Works",
        description: "Digging foundation",
        status: "Not Started",
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 5))
    });

    console.log(`[Setup] Created Task: ${task._id}`);

    // Helpers
    const reqPM = { user: pm, project, task };
    const reqSO = { user: safetyOfficer, project, task };

    // --- TEST 1: Safety Observation CRUD ---
    console.log("\n--- TEST 1: Safety Observation CRUD ---");
    let res = mockRes();
    reqSO.body = {
        title: "No Hard Hats",
        type: "Unsafe Act",
        severity: "High",
        location: "Zone A"
    };
    await observationController.createObservation(reqSO, res);
    console.log("Create Observation Response:", res.statusCode, res.data.success);
    const obsId = res.data.observation._id;

    // Hard Delete
    res = mockRes();
    reqSO.params = { observationId: obsId };
    reqSO.body = { deleteReason: "Invalid entry" };
    await observationController.deleteObservation(reqSO, res);
    console.log("Delete Observation Response:", res.statusCode, res.data.success);
    
    const obsLog = await DeletionLog.findOne({ entityId: obsId });
    console.log("Observation Deletion Log created:", !!obsLog, obsLog?.reason);

    // --- TEST 2: PTW BLOCKING ---
    console.log("\n--- TEST 2: PTW Blocking Task 'In Progress' ---");
    // Request a PTW
    res = mockRes();
    reqPM.body = {
        taskId: task._id,
        permitType: "Excavation"
    };
    await ptwController.createPTW(reqPM, res);
    const ptwId = res.data.ptw._id;
    console.log("Requested PTW:", res.statusCode, res.data.ptw.status); // Should be Pending

    // Try starting the task!
    res = mockRes();
    reqPM.body = { status: "In Progress" };
    await taskController.updateTask(reqPM, res);
    console.log("Attempt Start Task (with Pending PTW) -> EXPECT 422:");
    console.log("Response:", res.statusCode, res.data.message);

    // Approve the PTW
    res = mockRes();
    reqSO.params = { ptwId: ptwId };
    reqSO.body = { status: "Approved" };
    await ptwController.updatePTW(reqSO, res);
    console.log("Approve PTW:", res.statusCode, res.data.ptw.status);

    // Try starting the task AGAIN!
    res = mockRes();
    reqPM.body = { status: "In Progress" };
    await taskController.updateTask(reqPM, res);
    console.log("Attempt Start Task (with Approved PTW) -> EXPECT 200:");
    console.log("Response:", res.statusCode, res.data.message);

    // --- TEST 3: STOP / HOLD NOTICE ---
    console.log("\n--- TEST 3: Stop / Hold Notice Blocking ---");
    // Re-create a task to test Notice blocking
    const task2 = await Task.create({
        projectId: project._id,
        name: "Electrical Wiring",
        description: "Wiring level 2",
        status: "Not Started",
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 5))
    });
    reqPM.task = task2;
    reqSO.task = task2;

    res = mockRes();
    reqSO.body = {
        taskId: task2._id,
        reason: "Exposed wires and water pooling"
    };
    await noticeController.createNotice(reqSO, res);
    console.log("Issued Stop Notice:", res.statusCode, res.data.notice.status);

    // Try starting task2
    res = mockRes();
    reqPM.body = { status: "In Progress" };
    await taskController.updateTask(reqPM, res);
    console.log("Attempt Start Task (with Active Notice) -> EXPECT 422:");
    console.log("Response:", res.statusCode, res.data.message);

    // --- TEST 4: DASHBOARD AGGREGATION ---
    console.log("\n--- TEST 4: Dashboard Aggregation ---");
    res = mockRes();
    await dashboardController.getSafetySummary(reqPM, res);
    console.log("Dashboard Summary Data:", res.data.summary);

    // Cleanup
    console.log("\nCleaning up test project...");
    await Project.deleteOne({ _id: project._id });
    await Task.deleteMany({ projectId: project._id });
    await SafetyObservation.deleteMany({ projectId: project._id });
    await HazardReport.deleteMany({ projectId: project._id });
    await PermitToWork.deleteMany({ projectId: project._id });
    await SafetyNotice.deleteMany({ projectId: project._id });
    
    console.log("Phase 1 Verification Complete.");
    process.exit(0);
};

runVerification().catch(err => {
    console.error(err);
    process.exit(1);
});
