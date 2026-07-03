import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environmental parameters
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static frontend assets cleanly
app.use(express.static('./'));

// Target Secure Proxy route mapping
app.post('/api/interview', async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "Server error: API key missing configuration parameters." });
        }

        const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;
        
        const aiResponse = await fetch(targetUrl, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey
    },
    body: JSON.stringify(req.body)
});

        const responsePayload = await aiResponse.json();

if (!aiResponse.ok) {
    console.error(responsePayload);
    return res.status(aiResponse.status).json(responsePayload);
}

res.json(responsePayload);
    } catch (error) {
        console.error("Backend Proxy Routing Error:", error);
        res.status(500).json({ error: "Internal Gateway error handling remote execution models." });
    }
});
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: './' });
});

app.listen(PORT, () => {
    console.log(`🚀 Security server runtime live at: http://localhost:${PORT}`);
});