# Smart Campus Print — Self-Service Kiosk & Print Management System

> A complete, responsive, touchscreen-first full-stack **MERN** web application designed for college campuses, faculty, and student centers. Built as a rapid prototyping software demonstration for a Design Thinking laboratory experiment.

---

## 🌟 Overview & Highlights

Smart Campus Print solves long lines, manual USB thumb drive risks, ambiguous pricing, and document privacy issues by providing:
1. **Touchscreen Student Kiosk:** 9-step intuitive workflow from upload to collection.
2. **Mobile QR Transfer Experience:** Scan-and-upload directly from iOS or Android smartphones without installing any apps.
3. **Protected Admin Management Hub:** Real-time queue monitoring, hardware levels (paper tray & toner), dynamic pricing configuration, and usage analytics.
4. **Authoritative Backend Pricing Engine:** Server-validated tariffs distinguishing printed sides from physical sheets, with eco-friendly duplex discounts.
5. **Zero-Trace Privacy Architecture:** Automatic, verified server-side deletion of temporary files upon collection confirmation or session expiry.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS v3, React Router v6, Lucide React, Axios, Context API, Canvas-Confetti |
| **Backend** | Node.js, Express.js 4, MongoDB with Mongoose 8, JWT, bcryptjs, Multer, Helmet, Morgan, Express-Rate-Limit, QRCode, PDF-Parse |
| **Database** | MongoDB (supports MongoDB Atlas, local MongoDB `127.0.0.1:27017`, and built-in `mongodb-memory-server` fallback for zero-config evaluation) |
| **Testing** | Jest, Supertest (19 unit & integration tests covering pricing, auth, upload, and cleanup) |

---

## 📁 Project Structure

```text
smart-campus-print/
├── package.json              # Monorepo orchestration scripts
├── .gitignore                # Git ignore rules for node_modules, temp uploads, env
├── README.md                 # Complete documentation & test guide
├── client/                   # Frontend (React + Vite + Tailwind)
│   ├── index.html            # Touchscreen-optimized viewport HTML
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.js        # Vite build configuration
│   ├── tailwind.config.js    # Design tokens, touch button utilities
│   ├── .env.example          # Sample client environment variables
│   └── src/
│       ├── App.jsx           # Routing (/ , /mobile-upload, /admin)
│       ├── main.jsx          # Root mount
│       ├── index.css         # Touch styling (min 48px targets)
│       ├── context/          # KioskContext (9 steps) & AdminAuthContext
│       ├── services/         # Axios API clients (kiosk, session, upload, job, admin)
│       ├── components/       # Header, clock, accessibility toggles
│       ├── features/         # Step features:
│       │   ├── kiosk/        # WelcomeScreen, QRTransferModal
│       │   ├── upload/       # DocumentUploadStep (drag & drop, PDF/JPG/PNG)
│       │   ├── print-settings/ # PrintSettingsStep, PriceQuoteStep
│       │   ├── payments/     # PaymentStep (Simulated UPI & QR)
│       │   └── queue/        # QueueProgressStep, CollectionStep, CompletionStep
│       └── pages/            # KioskPage, MobileUploadPage, AdminPage, NotFoundPage
└── server/                   # Backend API (Node.js + Express + Mongoose)
    ├── package.json          # Backend dependencies & test scripts
    ├── .env.example          # Sample server environment variables
    ├── uploads/              # Isolated directory for temporary upload storage
    ├── src/
    │   ├── app.js            # Express app, security middleware, API router
    │   ├── server.js         # HTTP server, DB connection, background jobs
    │   ├── config/           # config.js, db.js (with in-memory fallback)
    │   ├── models/           # Kiosk, PrintSession, Document, PrintJob, Payment, AdminUser, PricingConfig
    │   ├── routes/           # REST endpoints: auth, kiosks, sessions, uploads, pricing, jobs, admin
    │   ├── controllers/      # Thin controllers mapping HTTP requests to services
    │   ├── middleware/       # JWT auth, session token auth, Multer upload, centralized error handler
    │   ├── services/         # Authoritative pricingService, storageService, cleanupService, paymentService, queueService
    │   ├── jobs/             # printerSimulator (state machine), cleanupCron (periodic purger)
    │   ├── utils/            # logger, tokenGenerator (high-entropy SHA-256 tokens)
    │   └── scripts/seed.js   # Database seeder (kiosks, admin, pricing, demo jobs)
    └── tests/                # Automated test suites
        ├── pricing.test.js   # Calculations, page range parsing, duplex savings
        └── kioskAndJobs.test.js # End-to-end integration tests (auth, upload, payment, collection, cleanup)
```

---

## ⚙️ Environment Variables

### Server (`server/.env`)

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/smart-campus-print
JWT_SECRET=supersecret_jwt_key_smart_campus_print_2026_dev
JWT_EXPIRES_IN=24h
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=25
MAX_FILES_PER_SESSION=10
SESSION_EXPIRY_MINUTES=30
AUTO_CLEANUP_INTERVAL_MINUTES=10
ENABLE_PRINTER_SIMULATION=true
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_KIOSK_ID=KIOSK-LIB-01
VITE_APP_TITLE=Smart Campus Print
```

---

## 🚀 Quickstart & Execution

### 1. Install Dependencies
Run the following from the root repository directory:
```bash
npm run install:all
```

### 2. Seed Database
Seeds 4 sample kiosks across campus, the administrative account, and official tariff rates:
```bash
npm run seed
```
> *Default Admin Credentials:* `admin@campusprint.edu` / `Admin@12345`

### 3. Run Automated Tests
Executes the comprehensive Jest integration test suite:
```bash
npm test
```

### 4. Start Development Servers
Runs both the Express API (port 5000) and the Vite React frontend (port 5173) concurrently:
```bash
npm run dev
```

* Open **Student Touchscreen Kiosk:** [http://localhost:5173](http://localhost:5173)
* Open **Mobile QR Upload Flow:** [http://localhost:5173/mobile-upload](http://localhost:5173/mobile-upload)
* Open **Admin Management Hub:** [http://localhost:5173/admin](http://localhost:5173/admin)
* Backend API Health: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 End-to-End Demonstration Checklist

Follow this 11-step walkthrough to demonstrate the complete design thinking prototype:

1. **Terminal Status & Kiosk Selection (Screen 1):**
   - Open [http://localhost:5173](http://localhost:5173).
   - Observe live paper tray (94%) and toner levels (88% black, 76% color).
   - Switch between campus kiosks (Library, Engineering, Cafeteria) or toggle High-Contrast Accessibility Mode.
2. **Start Session (Screen 2):**
   - Tap **"Start Printing"** (or optionally scan/open the mobile QR code).
   - A unique session ID is generated (e.g. `SES-XXXX-XXXX`) and an expiration timer starts.
3. **Upload Documents (Screen 3):**
   - Drag and drop or browse for a PDF document or test image.
   - The server inspects the PDF structure, extracts the real page count, and validates the file.
4. **Configure Print Settings (Screen 4):**
   - Select **A4** or **A3 Poster**.
   - Choose **Black & White** (₹2/side) or **Full Color** (₹10/side).
   - Adjust copies (e.g. 2 copies).
   - Toggle **Double-Sided (Duplex)** — observe the eco-saving badge and physical sheets count reduction!
   - Try entering an explicit page range (e.g. `1-3`).
5. **Transparent Price Calculation (Screen 5):**
   - Review the itemized tariff breakdown.
   - Observe the server-calculated subtotal, duplex eco discount, and final amount.
6. **Simulated Payment (Screen 6):**
   - Select **UPI Collect** or **Scan UPI QR**.
   - *Test Error Handling:* Check the "Simulate Payment Failure" box or enter `fail@upi` — observe the decline message and retry flow.
   - Uncheck and tap **Pay** to simulate a verified transaction.
7. **Queue & Printer Simulation (Screen 7):**
   - Observe the live job number, assigned queue rank, and waiting time.
   - Watch the animated printer progress bar advance from `QUEUED` ➔ `PRINTING` (35%, 70%, 100%).
   - *(Optional)* Tap **"Fast-Forward Printer (Lab Demo)"** to advance immediately.
8. **Collection & Verification (Screen 8):**
   - The job reaches `READY_FOR_COLLECTION`.
   - A secure 4-digit PIN (e.g. `8492`) is generated for output tray unlocking.
   - Tap **"I Have Collected My Prints"**.
9. **Secure Cleanup (Screen 9):**
   - Confetti celebrates the completed transaction!
   - The backend runs `cleanupService.cleanupSessionDocuments` and deletes all uploaded files from disk.
   - The cleanup audit confirms 0 lingering files remain.
   - An inactivity timer (15 seconds) counts down and resets the terminal to Screen 1 for the next student.

---

## 🔒 Security & Privacy Implementation

- **Strict File Upload Validation:** Multer restricts uploads to `application/pdf`, `image/jpeg`, and `image/png`. Filenames are cryptographically sanitized (`[base]_[randomHex].[ext]`) and path traversal attempts outside the upload folder are rejected.
- **Authoritative Price Engine:** The client never sends price amounts for payment. All totals are calculated and verified server-side based on database rates.
- **Session Isolation & Token Hashing:** Each session receives an unguessable high-entropy token. Only its SHA-256 hash is persisted. Cross-session tampering is prevented.
- **Physical Disk Shredding:** Once collected, files are unlinked from the server's filesystem, preventing sensitive assignment or resume leakage.
- **Role-Based Admin Protection:** Admin endpoints require a signed JWT token with passwords hashed using `bcryptjs` (cost factor 10).

---

## 🔄 Simulated Features vs Future Physical Hardware

| Feature | Prototype Implementation | Future Physical Production Integration |
| :--- | :--- | :--- |
| **Printer Hardware** | Non-blocking backend state machine (`printerSimulator.js`) with progress intervals | CUPS / IPP printer driver protocol, SNMP paper/toner telemetry |
| **Payments** | Simulated UPI Collect and Dynamic QR with mock failure triggers | Razorpay / Cashfree / NPCI Bharat UPI Payment Gateway with signed webhooks |
| **Document Dispenser** | 4-digit collection PIN code verification | Solenoid electromagnetic tray lock with optical page-drop sensor |
| **Card Authentication** | Optional roll number input field | Contactless RFID / MIFARE NFC campus student card reader |

---

## 📄 License
MIT © 2026 Smart Campus Print Team
