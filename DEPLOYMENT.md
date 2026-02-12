# Deployment Guide - Finca M&M Booking System

## Frontend (Web App) - Netlify

### Option 1: Deploy via Netlify CLI (Recommended)

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Build the web app:
```bash
npm run build:web
```

3. Deploy to Netlify:
```bash
netlify deploy --prod
```

Follow the prompts to create a new site or link to an existing one.

### Option 2: Deploy via Netlify Website

1. Push your code to GitHub
2. Go to https://app.netlify.com
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Build settings:
   - Build command: `npm run build:web`
   - Publish directory: `dist`
6. Click "Deploy site"

### Environment Variables (Netlify)

After deployment, you'll need to update the API URL:

1. Go to Site settings → Environment variables
2. Add: `EXPO_PUBLIC_API_URL` = `https://your-api-url.onrender.com/api`

Then update `src/api/config.ts`:
```typescript
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  // ...
};
```

---

## Backend (API) - Render

### Deploy via Render Website

1. Push your code to GitHub

2. Go to https://render.com and sign up/login

3. Click "New +" → "Web Service"

4. Connect your GitHub repository

5. Configure the service:
   - Name: `finca-mm-api`
   - Root Directory: `server`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Free

6. Click "Create Web Service"

7. Once deployed, copy your API URL (e.g., `https://finca-mm-api.onrender.com`)

8. Update the frontend API config with this URL

### Alternative: Railway

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set root directory to `server`
5. Railway will auto-detect and deploy

---

## Quick Start (Tunnel for Testing)

For immediate sharing without deployment:

```bash
npx expo start --tunnel
```

Share the generated URL with anyone - they can access it via Expo Go app or web browser.

---

## Post-Deployment Checklist

- [ ] API deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] API URL updated in frontend config
- [ ] Test booking flow end-to-end
- [ ] Check CORS settings if needed
- [ ] Set up custom domain (optional)

---

## Costs

- **Netlify**: Free tier (100GB bandwidth/month)
- **Render**: Free tier (750 hours/month, sleeps after inactivity)
- **Railway**: $5 credit/month on free tier
- **Expo Tunnel**: Free

---

## Notes

- Free tier APIs may sleep after inactivity (30s cold start)
- Consider upgrading for production use
- Set up monitoring and error tracking
- Add database for persistent bookings (currently in-memory)
