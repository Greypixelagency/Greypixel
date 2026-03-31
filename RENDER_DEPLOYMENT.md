# Render Deployment Guide for GreyPixel Portal

## Prerequisites
- GitHub account with your repository pushed
- Render account (render.com)

## Step-by-Step Deployment

### 1. Push Your Code to GitHub
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Connect to Render
1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click "New +" → "Web Service"
3. Select your repository (greypixel-portal)
4. Configure the following:
   - **Name:** greypixel-portal
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node server.js`
   - **Plan:** Free (or Paid as needed)

### 3. Add Environment Variables
In the Render dashboard, add these environment variables:
- `VITE_SUPABASE_URL` = Your Supabase URL
- `VITE_SUPABASE_ANON_KEY` = Your Supabase Anon Key

### 4. Deploy
Click "Create Web Service" and Render will automatically build and deploy your app.

## What's Included for Deployment

- **render.yaml**: Blueprint for Render infrastructure
- **Procfile**: Specifies how to run your app
- **server.js**: Express server to serve your built React app
- **Updated package.json**: Added `start` script for production

## Important Notes

1. **Build Output**: The build process creates a `dist/` folder with your optimized React app
2. **Environment Variables**: Must be set in Render dashboard (not in .env.local)
3. **Static Serving**: The Express server serves your built app from the `dist/` folder
4. **SPA Routing**: All routes are handled by serving index.html (proper SPA behavior)

## Post-Deployment Checks

- Verify your app loads at: `https://greypixel-portal.onrender.com`
- Check console for any errors
- Test all main features work with your Supabase connection

## Troubleshooting

If deployment fails:
1. Check Render logs in dashboard
2. Verify environment variables are set correctly
3. Ensure your GitHub repo has all files committed
4. Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are valid

## Local Testing Before Deploy

```bash
npm run build
npm run start
```

Visit `http://localhost:3000` to test the production build locally.
