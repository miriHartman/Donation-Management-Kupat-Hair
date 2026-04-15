# 🚀 Render Cloud Deployment Guide

## שלבים לפרוסה על Render (Cloud)

### 1️⃣ **התחבר ל-Render**
- כנס ל-[https://render.com](https://render.com)
- אם אין לך חשבון, צור חשבון חדש (אפשר להשתמש ב-GitHub)

### ct GitHub Repository**
1. ב-Dashboard, לחץ על "New Service"
2. בחר "Web Service"
3. בחר את הrepo שלך `miriHartman/Donation-Management-Kupat-Hair`

### 3️⃣ **Backend Service (Express Server)**
#### תחילת הגדרה:
- **Name:** `donation-backend-kupat-hair`
- **Runtime:** Node
- **Branch:** `main`
- **Build Command:** `cd server && npm install`
- **Start Command:** `node src/app.js`
- **Plan:** Free (או Paid לפרודקשן אמיתי)

#### Environment Variables (Backend):
הוסף את כל ה-variables מה-`server/.env`:
```
PORT = (Render יגדיר זאת בעצמו - 3000)
JWT_SECRET = my_secret_key_for_jwt_besa"d_every_time
HOST = bxwrlqsqovxxehmmliip-mysql.services.clever-cloud.com
USER = u5cgeo20ueytmpmf
PASSWORD = 4DHByDxI5ribXiljBBCh
DATABASE = bxwrlqsqovxxehmmliip
BANK_RATES_API_KEY = https://edge.boi.gov.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/EXR/1.0/?c%5BSERIES_CODE%5D=RER_USD_ILS,RER_EUR_ILS&lastNObservations=1&format=sdmx-json
FRONTEND_URL = https://donation-management-kupat-hair.onrender.com
```

### 4️⃣ **Frontend Service (React App)**
#### תחילת הגדרה:
- **Name:** `donation-management-kupat-hair`
- **Runtime:** Node
- **Branch:** `main`
- **Build Command:** `cd client && npm install && npm run build`
- **Start Command:** `cd client && npm run preview`
- **Plan:** Free (או Paid לפרודקשן אמיתי)

#### Environment Variables (Frontend):
```
REACT_APP_API_URL = https://donation-backend-kupat-hair.onrender.com/api
REACT_APP_API_TIMEOUT = 10000
```

### 5️⃣ **Deploy**
1. אחרי ההגדרה של שני ה-Services, לחץ על "Create Web Service"
2. Render יתחיל את ה-Build ו-Deploy

### 6️⃣ **Verify Deployment**
כשה-Deploy הסתיים:
- **Frontend URL:** `https://donation-management-kupat-hair.onrender.com`
- **Backend URL:** `https://donation-backend-kupat-hair.onrender.com`

בחן את אתר ה-Frontend - צריך שיתחבר בהצלחה ל-Backend! ✅

---

## 📝 אם יש בעיות:

### ❌ "Network Error" או "Connection Refused"
**פתרון:** וודא שה-Backend URL בפרונטנד תואם את שם ה-Service של Backend
- עדכן את `REACT_APP_API_URL` עם ה-URL של Backend Service מ-Render

### ❌ "Database Connection Failed"
**פתרון:** תקן את ה-Database Credentials בserver/.env
- וודא ש-HOST, USER, PASSWORD נכונים ל-Clever Cloud

### ❌ Build Failures
**פתרון:**
1. לחץ "Visit Logs" בDashboard
2. קרא את ה-Error Messages בזהירות
3. עדכן את קובץ ה-env או package.json כנדרש

---

## 🔄 Upload Changes
```bash
git add .
git commit -m "Configure cloud deployment for Render"
git push
```

Render יתחיל את ה-Build בעצמו אחרי ה-Push!

---

## 📚 שימושי Resources:
- [Render Documentation](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/deploy-node-express-app)
- [Environment Variables](https://render.com/docs/environment-variables)
