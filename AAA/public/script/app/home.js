window.onload = async function() {
    const authToken = getCookie("auth"); 

    if (!authToken) {
        await showNotification("bad", "No authToken found, please login");
        window.location.href='/signup';
        return;
    }

    async function fetchUserInfo() {
        try {
            const response = await fetch("/api/userinfo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ authToken }),
            });
    
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
    
            const data = await response.json();
    
            document.getElementById("sats").textContent = `${data.sats} SATS`;
    
            const cashoutsContainer = document.getElementById("cashouts");
            cashoutsContainer.innerHTML = "";
    
            if (data.cashouts && Array.isArray(data.cashouts)) {
                const latestCashouts = data.cashouts.slice(-3);
    
                latestCashouts.forEach((cashout) => {
                    const cashoutElement = document.createElement("div");
                    cashoutElement.innerHTML = `
                        <div class="withdraw-box">
                            <i class="fas fa-wallet"></i>
                            <div class="left-side">
                                <h3>Cashout</h3>
                                <p>${cashout.date}</p>
                            </div>
                            <span>${cashout.amount} sats</span>
                        </div>
                    `;
                    cashoutsContainer.appendChild(cashoutElement);
                });
            } else {
                cashoutsContainer.textContent = "No Cashouts yet.";
            }
        } catch (error) {
            console.error("Error with API-Request:", error);
        }
    }
    
    setInterval(fetchUserInfo, 10000);
    fetchUserInfo();
};
