const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require("fs");
const axios = require("axios");
const crypto = require('crypto');
const path = require('path');
const https = require('https');
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
require('dotenv').config(); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.json());
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

const secretKey = process.env.secret_key;
const secretcrypt = process.env.secret;
const hcaptcha_secret_key = process.env.hcaptcha_secret_key;
const ADMIN_PASSWORD = process.env.admin_password;
const blinkapiKey = process.env.blinkapiKey;
const blinkapiUrl = process.env.blinkapiUrl;



async function withdraw(address, amount) {
    try {
        const blinkwalletId = "74e24bc0-7aad-4bab-94aa-3f7fa8929f64";

        const query = {
            query: `
                mutation LnAddressPaymentSend($input: LnAddressPaymentSendInput!) {
                    lnAddressPaymentSend(input: $input) {
                        status
                        errors {
                            code
                            message
                            path
                        }
                    }
                }
            `,
            variables: {
                input: {
                    walletId: blinkwalletId,
                    amount: amount,
                    lnAddress: address
                }
            }
        };

        const response = await fetch(blinkapiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': blinkapiKey
            },
            body: JSON.stringify(query)
        });

        const result = await response.json();

        if (!response.ok || !result.data || result.data.lnAddressPaymentSend.errors.length > 0) {
            return false;
        }

        return true
    } catch (error) {
        return false;
    }
}



const secret = crypto.createHash('sha256').update(secretcrypt).digest(); 

// Verschlüsselungs
function encryptData(data) {
    const cipher = crypto.createCipheriv('aes-256-cbc', secret, Buffer.alloc(16, 0)); 
    let encrypted = cipher.update(data, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}


const loginfile =  path.join("login.json");

async function loadlogin() {
    if (!fs.existsSync(loginfile)) {
        fs.writeFileSync(loginfile, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(loginfile));
}
function savelogin(data) {
    fs.writeFileSync(loginfile, JSON.stringify(data, null, 2));
}



const codefile =  path.join("codes.json");

async function loadcode() {
    if (!fs.existsSync(codefile)) {
        fs.writeFileSync(codefile, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(codefile));
}
function savecode(data) {
    fs.writeFileSync(codefile, JSON.stringify(data, null, 2));
}



let code = {}; 

let login = {}; 

async function loadLogin() {
    login = await loadlogin();
    code = await loadcode();
}
setInterval(loadLogin, 500); 




async function genuserid() { 
    const randomNumbers = Array.from({ length: 5 }, () =>
        Math.floor(Math.random() * 10) 
    ).join('');

    
    const timestamp = Date.now();    
    return randomNumbers + timestamp;
}

async function generateAuthToken(email, userid, secretKey) {

    const payload = {
        email: email,
        userId: userid,
        createdAt: new Date().toISOString(),
    };

    const token = jwt.sign(payload, secretKey, { algorithm: 'HS256' });
    return token;
}



async function decodeAuthToken(token) {
    try {
        const decoded = jwt.verify(token, secretKey);
        return decoded;
    } catch (err) {
        console.error("Invalid Token:", err.message);
        return null;
    }
}
async function getEmailFromAuthToken(token) {
    const decoded = await decodeAuthToken(token);
    if (decoded && decoded.email) {
        return decoded.email;
    } else {
        console.error("Email not found in token payload.");
        return null;
    }
}

async function IpCountry(ip) {
    try {
        const response = await axios.get(`http://ip-api.com/json/${ip}`);
        if (response.data && response.data.status === 'success') {
            return response.data.country || 'Unknown';
        }
    } catch (error) {
        console.error(`Error while fetching country:`, error.message);
    }
    return 'Unknown';
}


const ipmap = new Map();

async function saveAndCheck(text) {
    if (ipmap.has(text)) {
        return true; 
    } else {
        ipmap.set(text);
        return false;
    }
}

async function checkCaptcha(token){
    try {
        const data = {
        secret: hcaptcha_secret_key,
        response: token,
        };

        const response = await axios.post("https://api.hcaptcha.com/siteverify", new URLSearchParams(data));

        const success = response.data.success;

        if (success) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
        
    }
}


async function checkTempmail(email) {
    const URL = 'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/main/disposable_email_blocklist.conf';

    const fetchDisposableEmailDomains = () => {
        return new Promise((resolve, reject) => {
            https.get(URL, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    const domains = data.split('\n').map(domain => domain.trim()).filter(domain => domain !== '');
                    resolve(domains);
                });

            }).on('error', (err) => {
                reject(err);
            });
        });
    };

    const disposableEmailDomains = await fetchDisposableEmailDomains();

    const domain = email.split('@')[1];
    return disposableEmailDomains.some(tempDomain => tempDomain === domain);
}


async function addCashout(email, amount) {
    const datecode = Date.now();
    const date = new Date(datecode).toLocaleDateString("de-DE");
    if (login[email]) {
        if (!login[email].cashouts) {
            login[email].cashouts = [];
        }

        if (login[email].cashouts.length >= 3) {
            login[email].cashouts.shift(); 
        }

        login[email].cashouts.push({ amount, date });
        savelogin(login);
    } else {
        console.error("user not found");
    }
}

async function userdata(email) {
    const username = login[email]?.username;
    const sats = login[email]?.sats;
    const cashouts = login[email].cashouts;
    const totalcashout = login[email].totalcashout;
    const totalclaims = login[email].totalclaims;

    return {
        email: email.toLowerCase(),
        username,
        sats,
        cashouts,
        totalcashout,
        totalclaims,
    };
}
const redeemCodeCooldown = new Map();
app.post("/api/redeem-code", async (req, res) => {
    const { authToken } = req.body;
    const codee = req.body.codee?.toLowerCase();
    const email = await getEmailFromAuthToken(authToken);
    if (redeemCodeCooldown.has(email)) {
        setTimeout(() => redeemCodeCooldown.delete(email), 5000);
        return res.status(410).send();
        
    }
    redeemCodeCooldown.set(email, Date.now());
    
    if (!login[email]) {
        return res.status(400).send({ error: 'No account with that email!' }); 
    }
    if (!code[codee]) {
        return res.status(411).send({ error: 'Invalid Code!' }); 
    }
    if (code[codee].codesleft === 0) {
        return res.status(409).send({ error: 'Max code usage reached!' }); 
    }
    if (code[codee].usedemails.some(item => item === email)) {
        return res.status(410).send({ error: 'Code already used!' }); 
    }

    const codesats = code[codee].rewardsats;

    login[email].sats += codesats;
    savelogin(login);
    code[codee].usedemails.push({email});
    code[codee].codesleft -= 1;
    savecode(code);
    
    return res.status(200).send();

});



const withdrawCooldowns = new Map();
app.post("/api/withdraw", async (req, res) => {

    
    const { authToken, ldaddress } = req.body;
    const email = await getEmailFromAuthToken(authToken);
    if (withdrawCooldowns.has(email)) {
        return;
    }
    withdrawCooldowns.set(email, Date.now());
    if (!login[email]) {
        return res.status(409).send({ error: 'No account with that email!' }); 
    }
    if (login[email].banned) {
        return res.status(410).send({ error: 'Your account has been banned and you can not withdraw' }); 
    }

    const sats = login[email].sats;
    if (sats < 10) {
        return res.status(411).send({ error: 'Minimum withdrawl is 10sats' }); 
    }

    const fee = Math.ceil(sats * 0.02); 
    const amount = sats - fee -1;


    if(await withdraw(ldaddress, amount )){
        login[email].sats -= sats;
        savelogin(login);
        login[email].totalcashout += sats;
        savelogin(login);
        await addCashout(email, sats);
        setTimeout(() => withdrawCooldowns.delete(email), 5000)
        return res.status(200).send();
    }
    return res.status(400).send();
});


app.post("/api/userinfo", async (req, res) => {
    const { authToken } = req.body;
    const email = await getEmailFromAuthToken(authToken);
    if (!login[email]) {
        return res.status(409).send({ error: 'No account with that email!' }); 
    }
    const data = await userdata(email);
    res.json(data);
});

app.post('/api/faucet', async (req, res) => {
    const { authToken } = req.body;
    const email = await getEmailFromAuthToken(authToken);

    if (!login[email]) {
        return res.status(409).send({ error: 'No account with that email!' }); 
    }

    const lastFaucetClaim = login[email].last_faucet_claim;
    const now = Date.now();

    if (lastFaucetClaim) {
        const timeElapsed = now - lastFaucetClaim;
        const timeRemaining = 60 * 60 * 1000 - timeElapsed;

        if (timeRemaining > 0) {
            const minutes = Math.floor(timeRemaining / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
            return res.status(200).send({
                status: 'not_ready',
                timeRemaining: { minutes, seconds }
            });
        } else {
            return res.status(200).send({ status: 'ready' });
        }
    } else {
        return res.status(200).send({ status: 'ready' });
    }
});
app.post('/api/claim', async (req, res) => {
    const { authToken } = req.body;
    const email = await getEmailFromAuthToken(authToken);
    if (!login[email]) {
        return res.status(409).send({ error: 'No account with that email!' });
    }
    const now = Date.now();
    const lastFaucetClaim = login[email].last_faucet_claim;

    if (!lastFaucetClaim || now - lastFaucetClaim >= 60 * 60 * 1000) {
        login[email].last_faucet_claim = now;
        login[email].sats = (login[email].sats || 0) + 1;
        login[email].totalclaims += 1;
        savelogin(login);
        login = loadLogin();

        return res.status(200).send();
    }

    const timeElapsed = now - lastFaucetClaim;
    const timeRemaining = 60 * 60 * 1000 - timeElapsed;
    const minutes = Math.floor(timeRemaining / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    return res.status(429).send({
        error: 'Claim not ready yet.',
        timeRemaining: { minutes, seconds },
    });
});


app.post('/api/login', async (req, res) => {
    const { password, hcaptchaResponse } = req.body;
    const email = req.body.email?.toLowerCase();
    
    if (!hcaptchaResponse) {
        return res.status(400).json();
    }
    if (!await checkCaptcha(hcaptchaResponse)) {
        return res.status(400).json();
    }
    
    if (!login[email]) {
        return res.status(409).send({ error: 'No account with that email!' }); 
    }
    const userid = login[email].userid;
    const emailpassword = login[email].password;
    if (emailpassword !== encryptData(password)) {
        return res.status(408).send({ error: 'Invalid Password' }); 
    }
    const authToken = await generateAuthToken(email, userid, secretKey);
    return res.status(200).json(authToken);
  });



app.post('/api/register', async (req, res) => {
    const { username, password, ip, hcaptchaResponse } = req.body;
    const email = req.body.email?.toLowerCase();
    
    if (!hcaptchaResponse) {
        return res.status(400).json();
    }
    if (!await checkCaptcha(hcaptchaResponse)) {
        return res.status(400).json();
    }
    if (await checkTempmail(email)) {
        return res.status(408).send({ error: 'No TempMails allowed' }); 
    }
    
    if (login[email]) {
        return res.status(409).send({ error: 'Email already registered.' }); 
    }
    if (await saveAndCheck(ip)) {
        return res.status(410).send({ error: 'Ip already linked to an account.' }); 
    }
    const country = await IpCountry(ip);
    const userid = await genuserid();
    const encrypted = encryptData(password);
    login[email] = { password: `${encrypted}`, username: username, userid: userid, country: country, registerdate: Date.now(), banned: false, sats: 0, last_faucet_claim: 0, totalcashout: 0, totalclaims: 0, cashouts: []};
    savelogin(login);
    login = loadLogin()
    return res.status(200).send();
});


 
async function userinfo(email) {
    const username = login[email]?.username;
    const userid = login[email]?.userid;
    const coins = login[email]?.sats;
    const country = login[email]?.country;
    const registerdate = login[email]?.registerdate;
    const banned = login[email]?.banned;

    if (!username || !userid || !country || !registerdate) {
        console.log("User data is incomplete.");
        return;
    }
    
    const registerday = new Date(registerdate).toLocaleDateString("de-DE");
    return {
        email: email.toLowerCase(),
        username,
        userid,
        coins,
        country,
        registerday,
        banned
    };
}



app.post("/admin", (req, res) => {
    const { password } = req.body;

    if (password === ADMIN_PASSWORD) {
        return res.status(200).send(); 
    } else {
        return res.status(401).json({ error: "Unauthorized" });
    }
});

app.post("/lookup", async (req, res) => {
    try {
        const email = req.body.email?.toLowerCase();
        console.log(email);

        if (login[email]) {
            const data = await userinfo(email);
            return res.json(data);
        } else {
            return res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        console.error("Fehler beim Verarbeiten der Anfrage:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/signup', (req, res) => { 
    res.sendFile(__dirname + '/public/signup.html');
});
app.get('/login', (req, res) => { 
    res.sendFile(__dirname + '/public/login.html');
});
app.get('/app-home', (req, res) => { 
    res.sendFile(__dirname + '/public/app-home.html');
});
app.get('/app-faucet', (req, res) => { 
    res.sendFile(__dirname + '/public/app-faucet.html');
});
app.get('/app-withdraw', (req, res) => { 
    res.sendFile(__dirname + '/public/app-withdraw.html');
});
app.get('/app-profile', (req, res) => { 
    res.sendFile(__dirname + '/public/app-profile.html');
});
app.get('/adminpanel', (req, res) => { 
    res.sendFile(__dirname + '/public/admin.html');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
