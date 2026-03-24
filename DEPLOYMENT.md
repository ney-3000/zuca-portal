# Deployment Guide: Football Player Analyzer
Follow these steps to push your new application to GitHub and deploy it live on Vercel.

## 1. Push project to GitHub
First, you need to open your terminal inside the `football-player-analyzer` folder and run these commands to track your files with Git:

```bash
git init
git add .
git commit -m "Initial commit: Football Player Analyzer"
```

Next, log into your GitHub account:
1. Go to github.com and click **New Repository**.
2. Name it `football-player-analyzer`. Leave it public or private. Do not add a README or .gitignore (we did that already!).
3. Copy the URL of your new repository.
4. Go back to your terminal and link your local folder to GitHub:

```bash
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL_HERE
git push -u origin main
```

## 2. Deploy on Vercel
Now that your code is on GitHub, deploying it is fully automatic!

1. Go to [vercel.com](https://vercel.com) and log in using your GitHub account.
2. Click **Add New** > **Project**.
3. In the list, look for your newly created `football-player-analyzer` repository and click **Import**.
4. You don't need to change any build settings (Vercel auto-detects Next.js). Just click **Deploy**.
5. Vercel will build the project (this takes about 1-2 minutes).

## 3. Get your Live URL
Once the deployment finishes:
- 🎉 Vercel will show you a success screen. 
- You will see a button that says **Continue to Dashboard**. Click it.
- On your dashboard, you will prominently see your brand new **Live URL** (e.g., `football-player-analyzer.vercel.app`).
- Click it, and you can share this link with anyone!
