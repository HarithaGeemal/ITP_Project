import mongoose from "mongoose";
import dotenv from "dotenv/config";
import connectDB from "./configs/mongodb.js";
import Task from "./models/task.js";
import Issue from "./models/issue.js";
import Project from "./models/projects.js";
import User from "./models/users.js";
import TaskService from "./services/taskService.js";

const verifyHighPriorityBlocker = async () => {
    try {
        await connectDB();
        console.log("Connected to MongoDB for Phase 3 Verification.");

        const project = await Project.findOne();
        const user = await User.findOne();
        if (!project || !user) throw new Error("Need a project and user to test");

        // Cleanup previous runs
        await Task.deleteMany({ name: "Phase 3 Blocking Drill" });
        await Issue.deleteMany({ title: "Drill Test Issue" });

        // 1. Create a dummy task
        const task = await Task.create({
            projectId: project._id,
            name: "Phase 3 Blocking Drill",
            description: "Testing resolution blocking",
            status: "In Progress",
            priority: "Medium",
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000),
            percentComplete: 90
        });
        console.log("✅ Task created successfully.");

        // 2. Create a "High" priority issue
        const highPriorityIssue = await Issue.create({
            title: "Drill Test Issue",
            type: "Defect",
            projectId: project._id,
            taskId: task._id,
            description: "Critically broken engine",
            priority: "High", // THE TRIGGER
            status: "Open",
            createdBy: user._id
        });
        console.log("✅ High Priority Issue registered on this Task.");

        // 3. SE attempts to mathematically request completion -> SHOULD THROW
        try {
            await TaskService.requestCompletion(task._id, user._id, "All done!");
            throw new Error("❌ SYSTEM FAILURE: Site Engineer bypassed High Priority Issue block!");
        } catch (e) {
            if (e.message.includes("Cannot request completion. There are 1 High/Critical open issues")) {
                console.log("✅ INTERCEPTED: Site Engineer correctly blocked from requesting completion due to active High Priority issue.");
            } else {
                throw e; // Unexpected error
            }
        }

        // 4. PM attempts to forcefully approve completion -> SHOULD THROW
        // Manually simulate a request bypass to test if the approval itself is blocked
        task.completionRequested = true;
        await task.save();

        try {
            await TaskService.approveCompletion(task._id, user._id, "Overriding...");
            throw new Error("❌ SYSTEM FAILURE: PM bypassed High Priority Issue block!");
        } catch (e) {
            if (e.message.includes("Cannot approve completion. There are 1 High/Critical open issues")) {
                console.log("✅ INTERCEPTED: PM correctly blocked from forceful approval due to active High Priority issue.");
            } else {
                throw e;
            }
        }

        // 5. PM resolves the issue
        highPriorityIssue.status = "Resolved";
        await highPriorityIssue.save();
        console.log("✅ Issue marked as Resolved.");

        // 6. Site Engineer effectively requests completion
        task.completionRequested = false;
        await task.save();
        await TaskService.requestCompletion(task._id, user._id, "Finally done!");
        console.log("✅ Site Engineer successfully requested completion after Issue resolution.");

        // 7. PM approves completion
        const completedTask = await TaskService.approveCompletion(task._id, user._id, "Looks good.");
        console.log("✅ Project Manager successfully completed the task.");
        console.log(`Final Task Status: ${completedTask.status} (${completedTask.percentComplete}%)`);

        console.log("--- PHASE 3: HIGH PRIORITY ISSUE BLOCKING VERY SUCCESSFULLY PASSED E2E TESTING ---");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
verifyHighPriorityBlocker();
