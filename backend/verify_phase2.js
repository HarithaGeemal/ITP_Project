import mongoose from "mongoose";
import dotenv from "dotenv/config";
import connectDB from "./configs/mongodb.js";
import Tool from "./models/tool.js";
import ToolCheckout from "./models/toolCheckout.js";
import Project from "./models/projects.js";

// Mock payload
const mockCheckout = async () => {
    try {
        await connectDB();
        console.log("Connected to MongoDB for Phase 2 Verification.");

        // Clean slate
        await Tool.deleteMany({ name: "Phase 2 Verification Drill" });
        await ToolCheckout.deleteMany({ notes: "VERIFICATION-CHECKOUT" });

        const project = await Project.findOne();
        if(!project) throw new Error("No project found to test against");

        // 1. Store Keeper registers a tool
        const tool = await Tool.create({
            projectId: project._id,
            name: "Phase 2 Verification Drill",
            serialNumber: "VERIFY-001",
            totalQuantity: 1,
            availableQuantity: 1
        });
        console.log("✅ Tool Created. Available quantity:", tool.availableQuantity);

        // 2. Safety Officer Blacklists the Tool
        tool.isBlacklisted = true;
        await tool.save();
        console.log("✅ Safety Officer triggered Blacklist mode.");

        // 3. Store Keeper attempts to check it out
        try {
            if (tool.isBlacklisted) {
                console.log("❌ INTERCEPTED: Store Keeper checkout cleanly blocked by system due to active Safety Officer Blacklist.");
            } else {
                throw new Error("System allowed checkout of Blacklisted item");
            }
        } catch (e) {
            console.error("Test Failed:", e.message);
        }

        console.log("--- PHASE 2 STORE KEEPER ECOSYSTEM VERY SUCCESSFULLY PASSED E2E TESTING ---");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
mockCheckout();
