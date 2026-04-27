async function run() {
    try {
        const resLogin = await fetch("http://localhost:5000/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "geemalharitha631@gmail.com", password: "Geemal@2003" })
        });
        const loginData = await resLogin.json();
        const token = loginData.token;
        console.log("Login Success");

        // 1. Check Available Users
        const resAvail = await fetch("http://localhost:5000/api/pm/available-users", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const availData = await resAvail.json();
        console.log("AVAILABLE USERS ERROR MESSAGE:", availData.message);

        // 2. Try deleting a project (Fetch first)
        const resProj = await fetch("http://localhost:5000/api/pm/projects", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const projData = await resProj.json();
        if (projData.projects && projData.projects.length > 0) {
            const pid = projData.projects[0]._id;
            console.log("Attempting to delete project:", pid);
            const resDel = await fetch(`http://localhost:5000/api/projects/${pid}`, {
                method: "DELETE",
                headers: { 
                    Authorization: `Bearer ${token}`, 
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({ reason: "Testing Deletion" })
            });
            const delData = await resDel.json();
            console.log("DELETE PROJ RESULT:", delData);
        } else {
            console.log("No projects found to delete.");
        }

    } catch (e) {
        console.error("ERROR:", e);
    }
}
run();
