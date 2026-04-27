import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();
import connectDB from "./configs/mongodb.js";
import { authorizeProjectAccess } from "./middlewares/rbacMiddleware.js";
import { createInspection, updateInspection, getInspections, deleteInspection } from "./controllers/safetyInspectionController.js";
import { createIncident, getIncidents, updateIncident, deleteIncident, getCriticalIncidents } from "./controllers/safetyIncidentController.js";
import { getSafetySummary, getSafetyHazards } from "./controllers/safetyDashboardController.js";
import Project from "./models/projects.js";
import User from "./models/users.js";
import ProjectMembership from "./models/projectMembership.js";
import SafetyInspectionReport from "./models/safetyInspectionReport.js";
import SafetyIncident from "./models/safetyIncident.js";
import DeletionLog from "./models/deletionLog.js";
import Issue from "./models/issue.js";

const mockRes = (resolveCb) => {
    const res = {};
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { 
        res.data = data; 
        if (resolveCb) resolveCb(res);
        return res; 
    };
    return res;
};

const runVerification = async () => {
    await connectDB();
    console.log("✅ DB Connected");

    await User.deleteMany({ userId: { $in: ["test_pm", "test_so", "test_sk", "test_nm"] } });
    await Project.deleteOne({ name: "Test Safety Project" });

    // SETUP TEST DATA
    const pManager = await User.create({ userId: "test_pm", name: "PM User", email: "pm@test.com", userRole: "PROJECT_MANAGER" });
    const sOfficer = await User.create({ userId: "test_so", name: "Safety Officer", email: "so@test.com", userRole: "SITE_ENGINEER" });
    const sKeeper = await User.create({ userId: "test_sk", name: "Store Keeper", email: "sk@test.com", userRole: "STORE_KEEPER" });
    const nMember = await User.create({ userId: "test_nm", name: "Normal Member", email: "nm@test.com", userRole: "ASSISTANT_ENGINEER" });

    const project = await Project.create({ name: "Test Safety Project", location: "Test", startDate: new Date(), endDate: new Date() });

    await ProjectMembership.create({ projectId: project._id, userId: pManager._id, role: "PROJECT_MANAGER" });
    await ProjectMembership.create({ projectId: project._id, userId: sOfficer._id, role: "SAFETY_OFFICER" });
    await ProjectMembership.create({ projectId: project._id, userId: sKeeper._id, role: "STORE_KEEPER" });
    await ProjectMembership.create({ projectId: project._id, userId: nMember._id, role: "ASSISTANT_ENGINEER" });

    // Helper for RBAC
    const testRBAC = async (user, minimumRole) => {
        return new Promise((resolve) => {
            const req = { user, project };
            const res = mockRes((finalRes) => {
                resolve(!finalRes.statusCode || finalRes.statusCode === 200);
            });
            authorizeProjectAccess(minimumRole)(req, res, (err) => {
                if (err) resolve(false);
                else resolve(true);
            });
        });
    };

    console.log("--- 1. Testing RBAC Behavior ---");
    const rbacTests = [
        { u: sOfficer, role: "SAFETY_OFFICER", expect: true },
        { u: pManager, role: "SAFETY_OFFICER", expect: true },
        { u: sKeeper, role: "SAFETY_OFFICER", expect: false },
        { u: nMember, role: "SAFETY_OFFICER", expect: false },
        { u: sOfficer, role: "PROJECT_MANAGER", expect: false },
        { u: pManager, role: "PROJECT_MANAGER", expect: true },
    ];
    for (let t of rbacTests) {
        const passed = await testRBAC(t.u, t.role);
        console.log(`RBAC test ${t.u.name} for >= ${t.role} | Expected: ${t.expect} | Got: ${passed} | ${passed === t.expect ? '✅' : '❌'}`);
    }

    console.log("\n--- 2. Testing Safety Inspections CRUD ---");
    let req = { body: { inspectionDate: new Date(), inspectionArea: "Site A", summary: "Looks good", complianceStatus: "Compliant" }, user: sOfficer, project };
    let res = mockRes();
    await createInspection(req, res);
    console.log(`Create Inspection: ${res.statusCode === 201 ? '✅' : '❌'} (${res.data?.inspection?._id})`);
    const inspectionId = res.data.inspection._id;

    req = { user: sKeeper, project };
    res = mockRes();
    await getInspections(req, res);
    console.log(`Get Inspections: ${res.statusCode === 200 && res.data.inspections.length > 0 ? '✅' : '❌'}`);

    req = { params: { inspectionId }, body: { notes: "Updated note" }, user: sOfficer, project };
    res = mockRes();
    await updateInspection(req, res);
    console.log(`Update Inspection: ${res.data.inspection.notes === "Updated note" ? '✅' : '❌'}`);

    req = { params: { inspectionId }, body: { deleteReason: "Duplicate Test" }, user: pManager, project };
    res = mockRes();
    await deleteInspection(req, res);
    const delLog1 = await DeletionLog.findOne({ entityId: inspectionId });
    console.log(`Hard Delete Inspection: ${res.statusCode === 200 && delLog1?.reason === "Duplicate Test" ? '✅' : '❌'}`);

    console.log("\n--- 3. Testing Safety Incidents & Escalation ---");
    req = { body: { incidentDate: new Date(), location: "Zone C", description: "Fell", severity: "High", incidentType: "Injury", injuryReported: true }, user: sOfficer, project };
    res = mockRes();
    await createIncident(req, res);
    let incident = res.data.incident;
    const incidentId = incident._id;
    // Escalation rule check
    console.log(`Create Incident + Escalation Rule: ${incident.requiresImmediateAttention === true ? '✅' : '❌'} (Injury auto-escalated)`);

    req = { params: { incidentId }, body: { severity: "Critical" }, user: sOfficer, project };
    res = mockRes();
    await updateIncident(req, res);
    console.log(`Update Incident + Escalation Rule: ${res.data.incident.requiresImmediateAttention === true && res.data.incident.followUpAction.includes("[SYSTEM]") ? '✅' : '❌'}`);

    req = { user: sKeeper, project };
    res = mockRes();
    await getCriticalIncidents(req, res);
    console.log(`Get Critical Incidents list: ${res.statusCode === 200 && res.data.incidents.length > 0 ? '✅' : '❌'}`);

    req = { params: { incidentId }, body: { deleteReason: "Resolved falsely" }, user: pManager, project };
    res = mockRes();
    await deleteIncident(req, res);
    const delLog2 = await DeletionLog.findOne({ entityId: incidentId });
    console.log(`Hard Delete Incident: ${res.statusCode === 200 && delLog2?.reason === "Resolved falsely" ? '✅' : '❌'}`);

    console.log("\n--- 4. Testing Hazards and Summary Endpoint ---");
    await Issue.create({ projectId: project._id, title: "Exposed Wire", type: "Safety", priority: "High", severity: "High", status: "Open", description: "test", createdBy: pManager._id });
    await Issue.create({ projectId: project._id, title: "Blocked Exit", type: "Safety", priority: "Critical", severity: "Critical", status: "Open", description: "test", createdBy: pManager._id });
    
    req = { user: sOfficer, project };
    res = mockRes();
    await getSafetyHazards(req, res);
    console.log(`Get Safety Hazards: ${res.data.hazards?.length === 2 ? '✅' : '❌'}`);

    req = { user: sOfficer, project };
    res = mockRes();
    await getSafetySummary(req, res);
    console.log(`Get Safety Summary: ${res.data.summary?.criticalSafetyIssues === 1 && res.data.summary?.totalSafetyIssues === 2 ? '✅' : '❌'}`);

    // TEARDOWN
    console.log("\nCleaning up test data...");
    await Project.deleteOne({ _id: project._id });
    await User.deleteMany({ _id: { $in: [pManager._id, sOfficer._id, sKeeper._id, nMember._id] } });
    await ProjectMembership.deleteMany({ projectId: project._id });
    await SafetyInspectionReport.deleteMany({ projectId: project._id });
    await SafetyIncident.deleteMany({ projectId: project._id });
    await Issue.deleteMany({ projectId: project._id });
    await DeletionLog.deleteMany({ entityId: { $in: [inspectionId, incidentId] } });
    
    console.log("✅ Verification Complete!");
    process.exit(0);
};

runVerification();
