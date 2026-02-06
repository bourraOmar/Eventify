# Eventify - Event Management Platform

[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/Eventify/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/YOUR_USERNAME/Eventify/actions)
[![JIRA Integration](https://github.com/YOUR_USERNAME/Eventify/workflows/JIRA%20Integration/badge.svg)](https://github.com/YOUR_USERNAME/Eventify/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> A comprehensive event management system with role-based access control, reservations, and automated ticketing.

## 🚀 Features

### For Administrators
- ✅ **Event Management**: Create, update, publish, and cancel events
- ✅ **Reservation Control**: Confirm or refuse participant reservations
- ✅ **Dashboard**: View all events and reservations with filtering
- ✅ **Capacity Management**: Automatic tracking of available places

### For Participants
- ✅ **Event Catalog**: Browse published events
- ✅ **Reservations**: Request event reservations
- ✅ **Ticket Generation**: Download PDF tickets for confirmed reservations
- ✅ **Reservation History**: View and manage your reservations

### Technical Features
- 🔐 **JWT Authentication**: Secure login and registration
- 👥 **Role-Based Access Control**: Admin and Participant roles
- 📊 **MongoDB Database**: Scalable NoSQL storage
- 🎫 **PDF Generation**: Automated ticket creation
- 🔄 **CI/CD Pipeline**: Automated testing and deployment
- 🎯 **JIRA Integration**: Automatic ticket tracking

## 📋 Project Structure

```
Eventify/
├── backend/                 # NestJS Backend API
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── events/         # Events management
│   │   ├── reservations/   # Reservations & tickets
│   │   └── users/          # User management
│   ├── test/               # E2E tests
│   └── package.json
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities
│   └── package.json
├── .github/
│   ├── workflows/         # GitHub Actions workflows
│   └── WORKFLOWS_SETUP.md # CI/CD documentation
└── docker-compose.yml     # Docker services
```

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with Passport
- **Validation**: class-validator, class-transformer
- **PDF Generation**: PDFKit
- **Testing**: Jest

### Frontend
- **Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS
- **State Management**: React Context / Zustand
- **HTTP Client**: Axios
- **Forms**: React Hook Form

### DevOps
- **CI/CD**: GitHub Actions
- **Containerization**: Docker
- **Deployment**: Vercel (Frontend), Docker/SSH (Backend)
- **Project Management**: JIRA

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB 6.0+
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/Eventify.git
cd Eventify
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Run development server
npm run start:dev
```

Backend will run on `http://localhost:4000`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your API URL

# Run development server
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Using Docker Compose
```bash
# Start all services (MongoDB, Backend, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📚 API Documentation

### Authentication Endpoints
```
POST /auth/register    # Register new user
POST /auth/login       # Login and get JWT token
```

### Events Endpoints (Public)
```
GET  /events           # List all published events
GET  /events/:id       # Get event details
```

### Events Endpoints (Admin Only)
```
POST   /events         # Create new event
PATCH  /events/:id     # Update event
DELETE /events/:id     # Delete event
GET    /events/admin/all  # Get all events (including drafts)
```

### Reservations Endpoints (Participant)
```
POST   /reservations           # Create reservation
GET    /reservations/my        # Get my reservations
DELETE /reservations/:id/cancel # Cancel my reservation
GET    /reservations/:id/ticket # Download PDF ticket
```

### Reservations Endpoints (Admin)
```
GET   /reservations              # Get all reservations
PATCH /reservations/:id/status   # Confirm/Refuse reservation
```

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests
```bash
cd frontend

# Run tests
npm test

# Test coverage
npm run test:coverage
```

## 🔄 CI/CD Workflows

This project uses GitHub Actions for automated testing and deployment.

### Workflows:
1. **CI/CD Pipeline** - Runs on every push and PR
   - Linting (Backend & Frontend)
   - Testing (Backend)
   - Building (Backend & Frontend)
   - Docker image creation

2. **JIRA Integration** - Automatic ticket tracking
   - Extracts JIRA ticket IDs from commits
   - Adds comments to JIRA tickets
   - Transitions tickets on merge

3. **Deployment** - Deploys to production
   - Backend: Docker + SSH
   - Frontend: Vercel
   - Creates GitHub releases

📖 **[View detailed CI/CD setup guide](.github/WORKFLOWS_SETUP.md)**

## 📝 Commit Message Format

All commits must reference a JIRA ticket:

```bash
git commit -m "SC2-3: Implement JWT authentication"
git commit -m "SC2-5: Add event CRUD endpoints"
git commit -m "SC2-7: Fix reservation capacity validation"
```

## 🎯 JIRA Project Structure

### EPIC 1: Initialization & Planning
- SC2-1: Initialize project
- SC2-2: Link JIRA and GitHub

### EPIC 2: Authentication & Authorization
- SC2-3: JWT Authentication
- SC2-4: Role Management

### EPIC 3: Event Management
- SC2-5: CRUD Events (Admin)
- SC2-6: Public Event Catalog

### EPIC 4: Reservation Management
- SC2-7: Event Reservation
- SC2-8: Reservation Lifecycle

## 🔐 Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb://localhost:27017/eventify
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=1d
PORT=4000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 📦 Deployment

### Production Deployment
```bash
# Tag a release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# GitHub Actions will automatically:
# 1. Run all tests
# 2. Build Docker images
# 3. Deploy to production
# 4. Create GitHub release
```

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/SC2-XX-description`
2. Make your changes
3. Commit with JIRA reference: `git commit -m "SC2-XX: Description"`
4. Push and create a Pull Request
5. Wait for CI checks to pass
6. Request review

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Backend Development**: NestJS, MongoDB, JWT
- **Frontend Development**: Next.js, React, Tailwind
- **DevOps**: Docker, GitHub Actions, CI/CD

## 🆘 Support

- 📖 [CI/CD Setup Guide](.github/WORKFLOWS_SETUP.md)
- 📋 [JIRA Files Mapping](JIRA_FILES_MAPPING.md)
- 🐛 [Issue Tracker](https://github.com/YOUR_USERNAME/Eventify/issues)

---

**Built with ❤️ using NestJS and Next.js**
