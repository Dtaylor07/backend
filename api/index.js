import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { createServer } from 'http';
import { parse } from 'url';

dotenv.config();

const app = express();

app.get('/login', (req, res) => {
  const clientId = process.env.CLIENT_ID;
  const redirectUri = process.env.REDIRECT_URI;

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:packages,write:packages`;

  res.redirect(githubAuthUrl);
});

app.get('/github/callback', async (req, res) => {
  const code = req.query.code;

  if (!code) return res.status(400).send('Missing code in callback');

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

// Export as serverless function
export default function handler(req, res) {
  const parsedUrl = parse(req.url, true);
  app.handle(req, res, parsedUrl);
}
