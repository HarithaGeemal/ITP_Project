// WorkerProfile.js
import React, { useState } from 'react';

const WorkerSkills = () => {
    const [skills, setSkills] = useState(['Masonry', 'Plumbing']);
    const [newSkill, setNewSkill] = useState('');

    const addSkill = () => {
        if (newSkill && !skills.includes(newSkill)) {
            setSkills([...skills, newSkill]);
            setNewSkill('');
        }
    };

    return (
        <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold">Worker Skills</h3>
            <ul className="list-disc ml-5">
                {skills.map((skill, index) => <li key={index}>{skill}</li>)}
            </ul>
            <input 
                value={newSkill} 
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skill (e.g. Electrician)"
                className="mt-2 p-1 border rounded"
            />
            <button onClick={addSkill} className="ml-2 bg-blue-500 text-white px-2 py-1 rounded">Add</button>
        </div>
    );
};

export default WorkerSkills;