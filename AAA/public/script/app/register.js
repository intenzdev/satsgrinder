document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const authToken = getCookie("auth");
    if (authToken) {
        window.location.href='/app-home';
        return;
    }
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const hcaptchaResponse = hcaptcha.getResponse();
    if (!hcaptchaResponse) {
        await showNotification("bad", 'Please do the Captcha first!');
        return;
      }
    
    try {
        
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const ip = ipData.ip;

        
        
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, ip, hcaptchaResponse }),
        });
        if (response.status === 410) {
            await showNotification("bad", 'You already have an account connected to your device. Please login instead!');
            return;
        }
        if (response.status === 409) {
            await showNotification("bad", 'This Email is already registered');
            return;
        }
        if (response.status === 409) {
            await showNotification("bad", 'This Email is not allowed');
            return;
        }
        if (!response.ok) {
            console.error('Error during registration.');
            await showNotification("bad", 'Error during your Registration');
            return;
        }
        if (response.ok) {
            await showNotification("good", 'Successfully registered! You can now login');
            window.location.href = "/login";

        }
        

        
    } catch (err) {
        console.error('Error:', err);
    }
});
