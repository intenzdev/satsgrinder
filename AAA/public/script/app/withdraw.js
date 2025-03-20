window.onload = async function() {
    const authToken = getCookie("auth"); 

    if (!authToken) {
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

        document.getElementById("sats").textContent = `${data.sats} SATS`;

        const withdrawButton = document.getElementById("withdrawButton");
        if (data.sats < 10) {
            withdrawButton.disabled = true;
        } else {
            withdrawButton.disabled = false;
        }
    } catch (error) {
        
    }
};

document.getElementById('withdrawForm').addEventListener('submit', async (e) => {
    const withdrawButton = document.getElementById("withdrawButton");
    withdrawButton.disabled = true;
    e.preventDefault();
    const authToken = getCookie("auth");
    const ldaddress = document.getElementById("inputlightning").value;
    
    const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authToken, ldaddress })
    });

    if (response.ok) {
        await showNotification("good", "Withdraw successful!");
        document.getElementById("sats").textContent = `0 SATS`;
        return;
    } else {
        await showNotification("bad", "Error during the withdraw process!");
        return;
    }
});
