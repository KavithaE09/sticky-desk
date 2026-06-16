# StickyDesk — Setup Guide

## 📁 Folder Structure
```
stickydesk-product/
├── webapp/        ← Next.js app (deploy to Vercel)
└── extension/     ← Chrome Extension
```

---

## 🚀 Step 1: Free Database Setup (Neon.tech)

1. Go to https://neon.tech → Sign up free
2. Create a new project → "stickydesk"
3. Copy the **Connection String** (looks like):
   `postgresql://user:pass@host/dbname?sslmode=require`

---

## 🔧 Step 2: Setup Webapp

```bash
# 1. Go to webapp folder
cd stickydesk-product/webapp

# 2. Install packages
npm install

# 3. Create .env file
copy .env.example .env
```

**Edit .env file:**
```
DATABASE_URL="paste your neon.tech connection string here"
NEXTAUTH_SECRET="any-random-string-like-abc123xyz789"
NEXTAUTH_URL="http://localhost:3000"
```

```bash
# 4. Setup database tables
npx prisma db push

# 5. Run locally
npm run dev
```

Open http://localhost:3000 → You should see StickyDesk! ✅

---

## ☁️ Step 3: Deploy to Vercel (Free)

1. Go to https://vercel.com → Sign up with GitHub
2. Push your webapp folder to GitHub
3. Import project in Vercel
4. Add Environment Variables (same as .env):
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` = https://your-app.vercel.app
5. Deploy!

---

## 🔌 Step 4: Setup Chrome Extension

**After Vercel deploy:**

1. Open `extension/background.js`
   - Change: `const API_BASE = "https://your-app.vercel.app"`
   - To your actual Vercel URL

2. Open `extension/popup.js`
   - Same change: `const API_BASE = "https://your-app.vercel.app"`

3. Open `extension/manifest.json`
   - Change `host_permissions` URL to your Vercel URL

**Install in Chrome:**
1. Go to `chrome://extensions/`
2. Turn ON "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension/` folder
5. Done! ✅

---

## 🎯 How it works for users

1. User visits your website → Signs up
2. Installs Chrome Extension (once)
3. Opens YouTube / Claude / any site
4. Clicks extension icon → Adds notes
5. Notes appear every time they visit that page!

---

## 💰 Free Plan Limits
- 50 notes max
- To change: edit `/src/app/api/notes/route.js` → change `50`

---

## 🆘 Common Issues

**"Cannot connect to database"**
→ Check DATABASE_URL in .env

**"Unauthorized" in extension**
→ Make sure you're logged in at your Vercel URL first

**Extension not showing notes**
→ Check that API_BASE in extension files matches your Vercel URL
