// /api/github.js
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

export default async function handler(req, res) {
  const { pathname, query } = new URL(req.url, `http://${req.headers.host}`);

  if (pathname === '/api/login') {
    const clientId = process.env.CLIENT_ID;
    const redirectUri = process.env.REDIRECT_URI;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:packages,write:packages`;

    return res.writeHead(302, { Location: githubAuthUrl }).end();
  }

  if (pathname === '/api/github/callback') {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const code = url.searchParams.get('code');

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

      return res.status(200).json({
        message: 'User access token retrieved successfully!',
        access_token: data.access_token,
        expires_in: data.expires_in,
        refresh_token: data.refresh_token,
      });
    } catch (err) {
      console.error('GitHub OAuth callback error:', err);
      return res.status(500).send('Server error');
    }
  }

  res.status(404).send('Not found');
}
