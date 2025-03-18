async function checkFaucetStatus() {
    const authToken = getCookie("auth");
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


checkFaucetStatus();
