document.getElementById("submit-password").addEventListener("click", async () => {
    const password = document.getElementById("admin-password").value;

    try {
        const response = await fetch("/admin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ password }),
        });


        if (response.ok) {
            document.getElementById("password-section").style.display = "none";
            document.getElementById("admin-panel").style.display = "block";
        } else {
            document.getElementById("password-error").style.display = "block";
        }
    } catch (error) {
        console.error("Error:", error);
    }
});

document.getElementById("lookup-email").addEventListener("click", async () => {
    const email = document.getElementById("email-search").value;

    try {
            const response = await fetch("/lookup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });
        
            if (!response.ok) {
                console.error("Error fetching user data");
                const userDataDiv = document.getElementById("user-data");
                userDataDiv.style.display = "none";
                return;
            }
        
            const userData = await response.json();
        
            // HTML-Inhalte aktualisieren
            document.getElementById("username").textContent = `Name: ${userData.username}`;
            document.getElementById("email").textContent = `Email: ${userData.email}`;
            document.getElementById("userid").textContent = `User ID: ${userData.userid}`;
            document.getElementById("country").textContent = `Country: ${userData.country}`;
            document.getElementById("coins").textContent = `Coins: ${userData.coins}`;
            document.getElementById("registerdate").textContent = `Register-day: ${userData.registerday}`;
            document.getElementById("banned").textContent = `Banned: ${userData.banned ? "Yes" : "No"}`;
            const userDataDiv = document.getElementById("user-data");
            userDataDiv.style.display = "block";
    } catch (error) {
        console.error("Error:", error);
    }

});


