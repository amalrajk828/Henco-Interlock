# Henco Interlock - Premium Paving & Landscaping Website (MERN Stack)

A modern, highly responsive, and full-featured MERN Stack (MongoDB, Express.js, React.js, Node.js) web application built for **Henco Interlock**, a premium manufacturing enterprise specializing in interlocking bricks, paving blocks, designer floor tiles, and kerbstones.

---

## 📂 Repository Directory Structure

```text
Henco Interloacks/
├── backend/
│   ├── config/              # MongoDB and Seeding Configurations
│   ├── controllers/         # Authentication, Inquiries, Products, Projects, Settings
│   ├── middleware/          # Authorization Guards, Upload Limits, Exceptions Interceptors
│   ├── models/              # Mongoose Data Schemas definitions
│   ├── routes/              # Express API Endpoint mappings
│   ├── utils/               # Nodemailer Services
│   ├── uploads/             # Locally uploaded product and portfolio images
│   ├── .env.example         # System settings template
│   ├── package.json         # Backend runtime configurations
│   └── server.js            # Main bootstrap entry point
├── frontend/
│   ├── src/
│   │   ├── components/      # Responsive Navbars, Footers, Admin Layout structures
│   │   ├── context/         # Auth, Theme (Light/Dark), and settings providers
│   │   ├── pages/
│   │   │   ├── user/        # Home, Products catalog, Gallery comparators, Tracker
│   │   │   └── admin/       # Login gate, Metrics dashboard, Editors sheets
│   │   ├── services/        # Centralized Axios API connections
│   │   ├── App.jsx          # React Router mappings
│   │   ├── index.css        # Tailwind configurations and micro-interactions keyframes
│   │   └── main.jsx         # React application starter
│   ├── index.html           # SEO-optimized metadata anchors
│   ├── package.json         # Frontend styling & compilation libraries
│   ├── tailwind.config.js   # Tailored terracotta & charcoal themes
│   └── vite.config.js       # Vite bundle setups
├── task.md                  # Development checklist tracking logs
└── README.md                # Project documentation overview
```

---

## ⚙️ Setting Up Environment Variables

### Backend Configuration (`backend/.env`)
Create a `.env` file inside the `backend` directory based on the following template:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/henco-interlock
JWT_SECRET=henco_interlock_jwt_secure_secret_2026_key
JWT_EXPIRES_IN=7d

# Nodemailer SMTP Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
COMPANY_EMAIL=sales@hencointerlock.com

# Frontend CORS URL
FRONTEND_URL=http://localhost:5173
```

### Frontend Configuration (`frontend/.env`)
Create a `.env` file inside the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Running the Application Locally

Make sure you have MongoDB running locally (or have configured a MongoDB Atlas URI inside `backend/.env`).

### 1. Launch the Backend API Service
```bash
cd backend
npm install
npm run dev
```
> [!TIP]
> On server bootstrap, the database seeding script will auto-execute, generating standard categories, settings configurations, and seeding a default administrator credential if they do not exist:
> - **Admin Email**: `admin@hencointerlock.com`
> - **Admin Password**: `HencoAdmin2026!`

### 2. Launch the Frontend React Client
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📝 Documented API Endpoints Maps

### 🔐 Administrative Authentication
- `POST /api/auth/login` - Public login page credentials check.
- `GET /api/auth/profile` - Private admin profile retrieval (Guarded by JWT).
- `GET /api/auth/logs` - Fetch dashboard administration event tracks (Guarded by JWT).

### 🧱 Product Categories
- `GET /api/categories` - Fetch all category categories.
- `POST /api/categories` - Create new category classification (Guarded by JWT).
- `PUT /api/categories/:id` - Modify category title / descriptions (Guarded by JWT).
- `DELETE /api/categories/:id` - Delete empty category from system (Guarded by JWT).

### 🛒 Product Catalog
- `GET /api/products` - Catalog querying supporting text search, category filters, stock toggles, sorting, and pagination.
- `GET /api/products/slug/:slug` - Product detailed spec view (Bumps popularity hit counter).
- `POST /api/products` - Create new product with multiple image uploads (Guarded by JWT + Multer).
- `PUT /api/products/:id` - Modify specifications and update image file listings (Guarded by JWT + Multer).
- `DELETE /api/products/:id` - Remove product item from database (Guarded by JWT).

### ✉️ Inquiry and Quotes System
- `POST /api/inquiries` - Public submission of inquiries (Generates tracking ID and launches Nodemailer customer alerts and corporate notification emails).
- `GET /api/inquiries` - Filter inquiries list with paging (Guarded by JWT).
- `GET /api/inquiries/track/:trackingId` - Public status lookup by ID (e.g. `HN-2026-XXXXXX`).
- `PUT /api/inquiries/:id` - Update status and save reply comments (Guarded by JWT).
- `GET /api/inquiries/export/excel` - Generate and download inquiries in spreadsheet format (Guarded by JWT).
- `GET /api/inquiries/export/pdf` - Stream and download summary reports in PDF (Guarded by JWT).

### 📐 Completed Installations Gallery
- `GET /api/projects` - Public listing of projects (with category selectors).
- `POST /api/projects` - Post project showcasing photos, descriptions, and separate before/after slots (Guarded by JWT + Multer).
- `PUT /api/projects/:id` - Modify portfolio parameters and upload changes (Guarded by JWT + Multer).
- `DELETE /api/projects/:id` - Delete portfolio items from database (Guarded by JWT).

### ⚙️ Global Website Settings
- `GET /api/settings` - Public fetch of homepage contents, coordinates, and WhatsApp links.
- `PUT /api/settings` - Administrative modifications to website copy (Guarded by JWT).
- `GET /api/settings/stats` - Fetch total products, inquiries, stock metrics, category allocations, and monthly graphs data (Guarded by JWT).

---

## 🎨 Premium UX and Aesthetic Specifications
- **Harmonious Palette**: Earthy clay oranges (`#c2410c`), sandy ambers, and charcoal matte black themes.
- **Micro-animations**: Floating pulsing elements, glowing hover card transitions, and slide-in panels.
- **Dark Mode Switch**: class-based dark mode persisting in localStorage and matching system preferences.
- **Local Images uploads**: Configured Multer filters to support multi-images and before/after comparisons natively without third-party APIs.
- **Inquiry Status Tracker**: Real-time status lookup by tracking code.
"# Henco-Interlock" 
