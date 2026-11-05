# Local Development Setup Guide
## Windows 11 / 10 with VS Code & PowerShell

This guide provides exact step-by-step instructions to run the entire Kabadiwala Connect system locally.

---

### Prerequisites
- **Node.js**: v18 or v20 LTS
- **Python**: 3.10 or 3.11
- **Git**: Installed
- **VS Code**: Installed
- **Expo Go App**: Installed on physical Android or iOS device from Google Play Store or App Store.

---

### Step 1: Clone & Open in VS Code
Open PowerShell:
```powershell
git clone <repository_url> kabadiwala-connect
cd kabadiwala-connect
code .
```

---

### Step 2: Supabase PostgreSQL Setup
1. Create a free project at [https://supabase.com](https://supabase.com).
2. Open the **SQL Editor** in Supabase Studio.
3. Open `supabase/migrations/001_initial_schema.sql` and run it to create all 19 tables and RLS policies.
4. Open `supabase/seed.sql` and run it to populate demonstration collectors, recyclers, and materials.
5. In Supabase Project Settings → API, copy:
   - `Project URL`
   - `anon public key`
   - `JWT Secret`

---

### Step 3: Run the Central Web Application (Port 3000)
In PowerShell:
```powershell
npm install
npm run dev
```
Open your browser at `http://localhost:3000`. You can instantly switch between:
- 📱 **Collector Mobile Experience** (with voice guidance & price estimator)
- 🏭 **Recycler Web Dashboard** (marketplace, buying rates, handover settlement)
- 🛡️ **Admin Console** (KYC verifications, price manager, audit logs)
- 🔍 **QR Scrap Passport Verifier** (public traceability certificate)

---

### Step 4: Run the FastAPI Backend (Port 8000)
In a new PowerShell terminal:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

### Step 5: Test Collector App on Mobile with Expo Go
In a third PowerShell terminal:
```powershell
cd mobile-app
npm install
npx expo start
```
Open **Expo Go** on your Android or iOS phone and scan the displayed QR code to test the native mobile gestures, camera capture, and voice speech synthesis!
