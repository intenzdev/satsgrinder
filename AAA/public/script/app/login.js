document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const authToken = getCookie("auth");
    if (authToken) {
        window.location.href='/app-home';
        return;
    }

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const hcaptchaResponse = hcaptcha.getResponse();
    if (!hcaptchaResponse) {
        await showNotification("bad", 'Please do the Captcha first!');
        return;
      }
    

    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, hcaptchaResponse }),
    });
    if (response.status === 408) {
        await showNotification("bad", 'Invalid Password!');
        return;
    }
    if (response.status === 409) {
        await showNotification("bad", 'There is no account with this email! Go Signup first!');
        return;
    }
    if (!response.ok) {
        console.error('Error during login.');
        await showNotification("bad", 'Error during your login');
        return;
    }
    if (response.ok) {
        const authToken = await response.json();
        await showNotification("good", 'Successfully logged into your account!');
        setCookie("auth", authToken)
        window.location.href = "/app-home";
    }

    
});
