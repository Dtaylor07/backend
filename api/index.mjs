import express from 'express';
import fetch from 'node-fetch';
import qs from 'querystring';

const app = express();

// OAuth login route
app.get('/login', (req, res) => {
  const clientId = process.env.CLIENT_ID;
  const redirectUri = process.env.REDIRECT_URI;

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:packages,write:packages`;

  res.redirect(githubAuthUrl);
});

// OAuth callback route
app.get('/github/callback', async (req, res) => {
  const code = req.query.code;

  if (!code) return res.status(400).send('Missing code in callback');

  try {
    // GitHub expects the data to be URL-encoded, not JSON
    const body = qs.stringify({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code,
    });

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded', // GitHub expects this content type
      },
      body: body,
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json(data);
    }

    res.json({
      message: 'User access token retrieved successfully!',
      access_token: data.access_token,
      expires_in: data.expires_in,
      refresh_token: data.refresh_token,
    });
  } catch (err) {
    console.error('Error during GitHub callback:', err);
    res.status(500).send('Server error');
  }
});

// ✅ Export wrapped express app for Vercel
export default (req, res) => app(req, res);
