window.onload = async function() {
    const authToken = getCookie("auth"); 

    if (!authToken) {
        await showNotification("bad", "No authToken found, please login");
        window.location.href='/signup';
        return;
    }

    
    try {
        const response = await fetch("/api/userinfo", {
            method: "POST", 
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ authToken }),
        });

        if (!response.ok) {
            throw new Error(`Fehler: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json(); 

        
        document.getElementById("username").textContent = `${data.username}`;
        document.getElementById("sats").textContent = `${data.sats} SATS`;
        document.getElementById("withdrawed_sats").textContent = `${data.totalcashout} SATS`;
        document.getElementById("faucet_claims").textContent = `${data.totalclaims} CLAIMS`;


        
    } catch (error) {
        console.error("Erros with API-Request:", error);
    }
};
