import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; // `npm install node-fetch`

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.get('/login', (req, res) => {
  const clientId = process.env.CLIENT_ID;
  const redirectUri = process.env.REDIRECT_URI;

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:packages,write:packages`;

  res.redirect(githubAuthUrl);
});

app.get('/github/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing code');

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code,
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(400).json(data);

    res.json({
      message: 'Access token retrieved!',
      access_token: data.access_token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ✅ THIS is how to make Express work with Vercel serverless:
export default app;
