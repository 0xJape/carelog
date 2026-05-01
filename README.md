# CareLog - School Clinic Management System

A simple and efficient School Clinic Management System that uses QR code technology to provide quick healthcare access at educational institutions. CareLog is designed specifically for emergency situations where time, accuracy, and immediate access to student information are crucial.

## 🚀 Features

- **QR Code Student Identification** - Instant access to student medical records
- **Emergency Contact Management** - Quick access to parent/guardian information
- **Clinic Visit Tracking** - Complete visit history and documentation
- **Staff Management** - Role-based access control (Admin, Doctor, Nurse, Staff)
- **Email Notifications** - Automated parent notifications via SMTP
- **Real-time Dashboard** - Visit statistics and severity tracking

## 🛠️ Tech Stack

- **Frontend**: SvelteKit 2.x with Svelte 5
- **Database**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM
- **Authentication**: Session-based with secure cookies
- **Email**: Nodemailer with SMTP
- **Styling**: Tailwind CSS
- **UI Components**: shadcn-svelte

## 📦 Deployment on Vercel

### Prerequisites

1. A Vercel account
2. A PostgreSQL database (Supabase recommended)
3. SMTP credentials for email notifications

### Step 1: Import from GitHub

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository: `https://github.com/0xJape/carelog.git`

### Step 2: Configure Environment Variables

Add the following environment variables in Vercel:

```env
DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
SMTP_HOST=mail.smtp2go.com
SMTP_PORT=2525
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@yourschool.edu
PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

### Step 3: Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be live at `https://your-project.vercel.app`

### Step 4: Initialize Database

After deployment, visit `/init` to create your first admin user.

## 🔧 Local Development

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

### Database Setup

The project uses Drizzle ORM with PostgreSQL. To set up the database:

```bash
# Push schema to database
pnpm db:push

# Generate migrations (optional)
pnpm db:generate

# Open Drizzle Studio to view/edit data
pnpm db:studio
```

## 👥 Default Credentials

After deployment, create your first admin user through the initialization page at `/init`.

New staff members are created with the default password: `Welcome123!`

**⚠️ Important**: Users should change their password on first login.

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `SMTP_HOST` | SMTP server hostname | ✅ |
| `SMTP_PORT` | SMTP server port | ✅ |
| `SMTP_USER` | SMTP username | ✅ |
| `SMTP_PASS` | SMTP password | ✅ |
| `SMTP_FROM` | Email sender address | ✅ |
| `PUBLIC_SUPABASE_URL` | Supabase project URL | ❌ |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key | ❌ |

## 🔒 Security Features

- Session-based authentication with secure cookies
- Password hashing with Argon2
- Role-based access control
- SQL injection prevention via Drizzle ORM
- CSRF protection

## 📱 Emergency Visit Workflow

1. **Student Arrival** - Scan QR code on student ID
2. **Critical Information Display** - View medical history, allergies, medications
3. **Quick Assessment** - Record symptoms and vital signs
4. **Treatment Documentation** - Log care provided
5. **Parent Notification** - Automated SMS/email alerts
6. **Visit Resolution** - Document outcome and follow-up

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

**CareLog** - Simple, fast, and reliable school clinic management for emergency care.

_Designed for simplicity and speed when every second counts._
