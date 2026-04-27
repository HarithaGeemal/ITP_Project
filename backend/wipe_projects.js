import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import ProjectMembership from './models/projectMembership.js';
import Project from './models/projects.js';
import Task from './models/task.js';
import TaskAssignment from './models/taskAssignment.js';
import Issue from './models/issue.js';

async function run() {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "sitenex" });
    
    console.log("Wiping all projects and memberships for a clean slate...");
    
    await Project.deleteMany({});
    await ProjectMembership.deleteMany({});
    await Task.deleteMany({});
    await TaskAssignment.deleteMany({});
    await Issue.deleteMany({});
    
    console.log("Database wiped clean of projects! Store Keepers are now fully available.");
    
    process.exit(0);
}

run();
