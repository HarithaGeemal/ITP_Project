import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "./models/users.js";

dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sitenex");
        console.log("DB Connected");

        // Find PM User
        const pm = await User.findOne();
        if (!pm) return console.log("NO USERS FOUND IN DB");
        console.log("USING USER ID:", pm._id);

        // Generate Token
        const JWT_SECRET = process.env.JWT_SECRET || "sitenex_jwt_secret_key_2026";
        const token = jwt.sign({ id: pm._id }, JWT_SECRET, { expiresIn: "7d" });

        // 1. Fetch available users
        const resAvail = await fetch("http://localhost:5000/api/pm/available-users", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const availData = await resAvail.json();
        console.log("AVAILABILITY ENDPOINT:", JSON.stringify(availData, null, 2));

        // 2. Fetch Projects and attempt delete
        const resProj = await fetch("http://localhost:5000/api/pm/projects", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const projData = await resProj.json();
        
        if (projData.projects && projData.projects.length >= 0) { // get all projects
             console.log(`Found ${projData.projects.length} projects`);
             if (projData.projects.length > 0) {
                 const testId = projData.projects[0]._id || projData.projects[0].id;
                 const resDel = await fetch(`http://localhost:5000/api/projects/${testId}`, {
                     method: "DELETE",
                     headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                     body: JSON.stringify({ reason: "Diagnostic Deletion" })
                 });
                 console.log("DELETE PROJECT PAYLOAD:", await resDel.json());
             }
        } else {
             console.log("PROJECT FETCH FAILED:", projData);
        }

        // 3. Try Task Deletion
        const resTask = await fetch("http://localhost:5000/api/pm/tasks", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const taskData = await resTask.json();
        if (taskData.tasks && taskData.tasks.length > 0) {
            const taskId = taskData.tasks[0]._id || taskData.tasks[0].id;
            const projectId = taskData.tasks[0].projectId._id || taskData.tasks[0].projectId;
            
            const resTDel = await fetch(`http://localhost:5000/api/projects/${projectId}/tasks/${taskId}/cancel`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ reason: "Test Task Cancel" })
            });
            console.log("DELETE TASK PAYLOAD:", await resTDel.json());
        }

    } catch(e) {
        console.error("DIAGNOSTIC CRASH:", e);
    } finally {
        mongoose.connection.close();
    }
}

run();
