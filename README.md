# 📅 Calendly Clone — by Mankirat Kaur

A full-stack, production-grade scheduling application that replicates Calendly's core functionality. Create event types, set your weekly availability, share a public booking link, and automatically notify invitees via email — all without any third-party auth.

---

## ✨ Features

### 🗓️ Event Type Management
- **Create, Read, Update & Delete** event types from the dashboard
- Customise **name, slug, duration, description, and colour**
- Toggle event types on/off with a single click
- Each event type gets a **shareable public booking URL** (e.g. `/mankirat/30min`)
- **Copy link** button for instant clipboard sharing
- Per-event **Buffer Before / Buffer After** settings to prevent back-to-back meetings

### 📆 Availability Settings
- Set **weekly recurring availability** per day of the week (day on/off, start & end time)
- Override availability for specific dates with **Date Overrides**
- Smart **slot generation** that respects availability windows and buffer times

### 🌐 Public Booking Page
- A clean, fully public booking page accessible via `/mankirat/<slug>` — no login required
- Interactive **calendar date picker** that only shows available days
- Dynamic **time slot grid** generated from the host's availability and existing bookings
- **Double-booking prevention** — slots occupied by existing confirmed bookings are hidden
- Buffer-aware conflict detection ensures breathing room between meetings

### ✅ Booking Confirmation Page
- Beautiful **"You are scheduled"** confirmation screen post-booking
- Displays meeting name, host name, time, timezone, and conferencing note
- **Add to Google Calendar** one-click link
- **Outlook / iCal** export button
- "Schedule another event" quick-link back to the event types page

### 📧 Automated Email Notifications *(Powered by Nodemailer + Gmail SMTP)*
> **Email is fully live and sending real messages!**

- **Booking Confirmation Email** — sent automatically to the invitee's email address the moment a meeting is booked. Contains the event name, host, and meeting time in a clean HTML template.
- **Cancellation Notification Email** — sent instantly when a meeting is cancelled from the Meetings page. Notifies the invitee with a styled red-highlighted email.
- Uses **Gmail SMTP** with an App Password for secure, authenticated sending.
- Falls back gracefully to **Ethereal Email** (test inbox with preview URL) if no SMTP credentials are configured.
- Email dispatch is **non-blocking** — the API responds immediately while the email sends in the background.

### 📋 Meetings Dashboard
- View **Upcoming** and **Past** meetings in separate tabs with date range filtering
- Colour-coded booking status badges: ✓ Confirmed / Cancelled
- **Show Buffers** toggle — when enabled, displays buffer before/after on each booking card
- **Cancel** meetings with a confirmation modal (triggers cancellation email)
- **Reschedule** flow — copies the booking link to clipboard to share with the invitee

### 📊 Meeting Polls
- Create meeting polls to crowdsource a suitable time across multiple participants
- Configure poll name, duration, location, description, and time selections
- Toggle "Reserve Times" and "Show Votes" options
- Real-time poll status tracking (Created / Active / Closed)
- Share unique poll links with participants

### 🎨 UI / UX
- **Pixel-perfect Calendly-inspired design** with a clean sidebar layout
- Responsive for desktop and mobile screens
- Smooth **hover effects, micro-animations, and transitions** throughout
- **Toast notifications** for every user action (success and error states)
- **Loading skeletons** on all async data sections
- **Glassmorphism dropdown** user menu with profile info, account settings, and resources
- Modern typography and a consistent blue (`#006bff`) colour accent

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 18+ | Runtime |
| **Express.js** | 4.18.2 | REST API framework |
| **Prisma ORM** | 5.x | Database access layer |
| **PostgreSQL** | 15+ | Relational database |
| **Nodemailer** | 6.x | Email sending (SMTP / Ethereal) |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.2.0 | UI library |
| **Vite** | 5.0.0 | Build tool & dev server |
| **React Router DOM** | 6.20.0 | Client-side routing |
| **TanStack React Query** | 5.x | Server state management & caching |
| **Axios** | 1.6.0 | HTTP client |
| **Tailwind CSS** | 3.3.0 | Utility-first styling |
| **Lucide React** | latest | Icon set |
| **React Hot Toast** | 2.4.0 | Toast notification system |

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833) for real email sending

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Calendly
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# PostgreSQL connection
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/calendly_clone"

# Gmail SMTP (use an App Password, NOT your regular password)
SMTP_USER=your.email@gmail.com
SMTP_PASS=your_app_password_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```
> **Tip:** If you leave `SMTP_USER` / `SMTP_PASS` blank, emails fall back to Ethereal and you'll see a preview URL in the terminal console instead of a real delivery.

### 4. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed with default event types and availability
npm run db:seed
```

### 5. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 6. Start Development Servers
Open **two** terminal windows:

**Terminal 1 — Backend API (port 3007)**
```bash
cd /path/to/Calendly
npm run dev
```

**Terminal 2 — Frontend (port 5173)**
```bash
cd /path/to/Calendly/client
npm run dev
```

Then visit: **http://localhost:5173**

---

## 🗂️ Project Structure

```
Calendly/
├── routes/
│   ├── bookings.js        # Booking CRUD + email dispatch
│   ├── eventTypes.js      # Event type CRUD
│   ├── availability.js    # Availability settings
│   ├── slots.js           # Available time slot generation
│   └── polls.js           # Meeting polls
├── utils/
│   └── mailer.js          # Nodemailer transporter + email templates
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Default user, event types & availability
├── client/
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx          # Event types dashboard
│       │   ├── EventTypeForm.jsx      # Create / edit event type
│       │   ├── Availability.jsx       # Availability editor
│       │   ├── Meetings.jsx           # Meetings list & modals
│       │   ├── MeetingPolls.jsx       # Polls management
│       │   ├── PublicBookingPage.jsx  # Public booking calendar
│       │   └── BookingConfirmed.jsx   # Post-booking confirmation
│       ├── layouts/
│       │   └── AdminLayout.jsx        # Sidebar + header shell
│       └── api/
│           └── index.js               # Axios API client
├── server.js              # Express app entry point
└── .env                   # Environment variables (not committed)
```

---

## 📡 API Endpoints

### Event Types
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/event-types` | List all event types |
| `POST` | `/api/event-types` | Create a new event type |
| `PUT` | `/api/event-types/:id` | Update an event type |
| `DELETE` | `/api/event-types/:id` | Delete an event type |

### Availability
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/availability` | Get weekly availability |
| `PUT` | `/api/availability` | Update availability for a day |

### Slots
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/slots?eventTypeId=&date=` | Get available time slots for a date |

### Bookings
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/bookings?filter=upcoming\|past` | List bookings |
| `POST` | `/api/bookings` | Create a booking (sends confirmation email 📧) |
| `PUT` | `/api/bookings/:id/cancel` | Cancel a booking (sends cancellation email 📧) |

### Meeting Polls
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/polls` | List all polls |
| `POST` | `/api/polls` | Create a new poll |
| `DELETE` | `/api/polls/:id` | Delete a poll |

---

## 🗄️ Database Schema

Five core models with the following relationships:

```
User ──< EventType ──< Booking
User ──< Availability
User ──< DateOverride
User ──< MeetingPoll
```

| Model | Key Fields |
|---|---|
| **User** | id, name, email, username (unique), timezone |
| **EventType** | id, userId, name, slug, durationMinutes, color, bufferBefore, bufferAfter, isActive |
| **Availability** | id, userId, dayOfWeek (0–6), startTime, endTime, isAvailable |
| **Booking** | id, eventTypeId, inviteeName, inviteeEmail, startTime, endTime, status (CONFIRMED/CANCELLED) |
| **DateOverride** | id, userId, date, startTime, endTime, isBlocked |
| **MeetingPoll** | id, userId, name, duration, location, link (unique), status, votes, selections |

---

## 📬 Email System Details

Emails are sent using **Nodemailer** via Gmail SMTP. Two email types are implemented:

### Booking Confirmation
- **Trigger:** `POST /api/bookings` (a new booking is created)
- **Recipient:** Invitee's email address
- **Content:** Event name, host name, confirmed start & end time (HTML formatted)
- **Subject:** `Confirmed: <Event Name> with <Host Name>`

### Cancellation Notification
- **Trigger:** `PUT /api/bookings/:id/cancel`
- **Recipient:** Invitee's email address
- **Content:** Event name, host name, original meeting time with a red-highlighted panel
- **Subject:** `Canceled: <Event Name> with <Host Name>`

> Emails are dispatched **asynchronously** — the API response is never blocked waiting for email delivery.

---

## ✅ Feature Checklist

| Feature | Status |
|---|---|
| Event type CRUD | ✅ |
| Buffer before/after per event | ✅ |
| Weekly availability editor | ✅ |
| Date override support | ✅ |
| Public booking page with calendar | ✅ |
| Smart time slot generation | ✅ |
| Double-booking prevention | ✅ |
| Buffer-aware conflict detection | ✅ |
| Booking confirmation page | ✅ |
| Google Calendar add link | ✅ |
| Automated booking confirmation email | ✅ 📧 |
| Automated cancellation email | ✅ 📧 |
| Meeting management (upcoming / past) | ✅ |
| Show Buffers toggle on meetings | ✅ |
| Cancel meeting with modal | ✅ |
| Reschedule flow (copy + share link) | ✅ |
| Meeting Polls creation & management | ✅ |
| Responsive design (desktop + mobile) | ✅ |
| Toast notifications | ✅ |
| Loading skeletons | ✅ |

---

## 📄 License

MIT License