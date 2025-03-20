async function checkFaucetStatus() {
    const authToken = getCookie("auth");
    if (!authToken) {
        await showNotification("bad", "No authToken found, please login");
        window.location.href='/signup';
        return;
    }
    const response = await fetch('/api/faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authToken })
    });

    const data = await response.json();
    const claimButton = document.getElementById("claimButton");

    if (data.status === "ready") {
        claimButton.disabled = false;
        claimButton.textContent = "Claim now!";
    } else if (data.status === "not_ready") {
        claimButton.disabled = true;
        const { minutes, seconds } = data.timeRemaining;
        claimButton.textContent = `Claim in ${minutes}m:${seconds}s`;

        let totalSeconds = minutes * 60 + seconds;

        const interval = setInterval(() => {
            totalSeconds -= 1;

            const remainingMinutes = Math.floor(totalSeconds / 60);
            const remainingSeconds = totalSeconds % 60;

            if (totalSeconds <= 0) {
                clearInterval(interval);
                checkFaucetStatus();
            } else {
                claimButton.textContent = `Claim in ${remainingMinutes}m:${remainingSeconds}s`;
            }
        }, 1000);
    }
}

document.getElementById("claimButton").addEventListener("click", async () => {
    const authToken = getCookie("auth");
    const response = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authToken })
    });

    if (response.ok) {
        showNotification("good", "Claim successful!");
        checkFaucetStatus();
    } else {
        showNotification("bad", "Error during the claim process!");
    }
});

document.getElementById('redeemForm').addEventListener('submit', async (e) => {
    const redeemButton = document.getElementById("redeemButton");
    redeemButton.disabled = true;
    
    e.preventDefault();
    const authToken = getCookie("auth");
    const codee = document.getElementById("codeInput").value;
    
    const response = await fetch('/api/redeem-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authToken, codee })
    });

    if (response.ok) {
        await showNotification("good", "Code redemption successful!");
        redeemButton.disabled = false;
        return;
    } if (response.status === 410) {
        await showNotification("bad", "Code already used!");
        redeemButton.disabled = false;
        return;
    } if (response.status === 409) {
        await showNotification("bad", "Max code usage reached!");
        redeemButton.disabled = false;
        return;
    } if (response.status === 411) {
        await showNotification("bad", "Invalid code!");
        redeemButton.disabled = false;
        return;
    } else {
        await showNotification("bad", "Error during the redemption process!");
        redeemButton.disabled = false;
        return;
    }
});


checkFaucetStatus();
