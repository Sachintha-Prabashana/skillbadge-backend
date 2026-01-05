# Skill Badge Platform Backend

> A comprehensive backend system for skill verification, badge management, and professional development tracking with AI-powered features and OAuth integration.

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

[🚀 Demo](https://your-demo-link.com) | [📖 API Docs](https://your-api-docs.com) | [🐛 Report Bug](https://github.com/your-repo/issues) | [✨ Request Feature](https://github.com/your-repo/issues)

---

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Database Seeding](#database-seeding)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## 🎯 Overview

The **Skill Badge Platform Backend** is a robust, scalable Node.js application built with TypeScript that powers a comprehensive skill verification and badge management system. It enables organizations and individuals to create, manage, and verify professional skills through digital badges, with features including AI-powered content generation, real-time discussions, OAuth authentication, and cloud-based media management.

### Key Capabilities

- **Multi-provider OAuth Authentication** (Google, GitHub)
- **AI-Powered Content Generation** using OpenRouter integration
- **Real-time Discussion Forums** for skill-based communities
- **Cloud Media Management** via Cloudinary
- **Email Notifications** for user engagement
- **Role-Based Access Control** (RBAC)
- **Badge Verification System** with cryptographic proof
- **RESTful API** with comprehensive endpoints

---

## 🏗️ System Architecture

The platform follows a **modular, layered architecture** designed for scalability and maintainability:

```
┌─────────────────────────────────────────────────┐
│           Client Applications (Web/Mobile)       │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│         Express.js REST API Layer               │
│  (Routes → Controllers → Services → Models)     │
└───────────────────┬─────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   ┌────────┐  ┌────────┐  ┌─────────┐
   │MongoDB │  │Cloudinary│ │OpenRouter│
   │Database│  │ (Media) │  │  (AI)   │
   └────────┘  └────────┘  └─────────┘
```

### Design Principles

- **Separation of Concerns**: Clear boundaries between routes, controllers, services, and data models
- **Dependency Injection**: Loose coupling between components
- **Error Handling**: Centralized error management with custom error classes
- **Security First**: JWT authentication, input validation, and sanitization
- **Scalability**: Stateless design supporting horizontal scaling

---

## ✨ Features

### Authentication & Authorization

- 🔐 JWT-based authentication with refresh tokens
- 🌐 OAuth 2.0 integration (Google, GitHub)
- 👥 Role-based access control (Admin, Instructor, Student)
- 📧 Email verification and password reset
- 🔄 Token refresh mechanism

### Badge Management

- 🏅 Create and manage skill badges
- ✅ Badge verification system
- 📊 Badge analytics and tracking
- 🎨 Custom badge designs with Cloudinary
- 📜 Badge issuance history

### AI Integration

- 🤖 AI-powered content generation
- 💬 Intelligent badge descriptions
- 📝 Automated skill assessments
- 🔍 Smart recommendation engine

### Communication & Collaboration

- 💬 Discussion forums for each badge
- 🔔 Real-time notifications
- 📧 Email notification system
- 🗨️ Comment and reply functionality

### Media Management

- ☁️ Cloud storage integration (Cloudinary)
- 🖼️ Image upload and optimization
- 📦 File organization and retrieval
- 🔒 Secure media access control

### Admin Features

- 👨‍💼 User management dashboard
- 📊 Platform analytics
- 🛠️ System configuration
- 📋 Content moderation tools

---

## 🛠️ Tech Stack

### Core Technologies

- **Runtime**: Node.js (≥18.0.0)
- **Language**: TypeScript (5.0+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM

### Authentication & Security

- **JWT**: JSON Web Tokens
- **Passport.js**: OAuth strategies
- **bcrypt**: Password hashing
- **express-validator**: Input validation

### Cloud Services

- **Cloudinary**: Media storage and optimization
- **OpenRouter**: AI/LLM integration

### Email & Communication

- **Nodemailer**: Email delivery
- **SMTP**: Email protocol

### Development Tools

- **ts-node**: TypeScript execution
- **nodemon**: Development auto-reload
- **dotenv**: Environment configuration
- **ESLint**: Code linting
- **Prettier**: Code formatting

---

## 📁 Project Structure

```
skill-badge-platform-backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── cloudinary.ts    # Cloudinary setup
│   │   ├── database.ts      # MongoDB connection
│   │   ├── email.ts         # Email service config
│   │   ├── passport.ts      # OAuth strategies
│   │
│   ├── controllers/         # Request handlers
│   │   ├── admin/           # Admin specific controllers
│   │   ├── auth.controller.ts
│   │   ├── challenge.controller.ts
│   │   ├── daily.challenge.controller.ts
│   │   ├── discuss.controller.ts
│   │   └── user.controller.ts
│   │
│   ├── middleware/          # Custom middleware
│   │   ├── auth.ts          # Authentication middleware
│   │   ├── role.ts          # Role-based access control
│   │   └── upload.ts        # File upload handling
│   │
│   ├── models/              # Mongoose schemas
│   │   ├── badge.model.ts
│   │   ├── challenge.model.ts
│   │   ├── comment.model.ts
│   │   ├── contest.model.ts
│   │   ├── dailyChallenge.model.ts
│   │   ├── post.model.ts
│   │   ├── submission.model.ts
│   │   ├── user.model.ts
│   │   └── view.model.ts
│   │
│   ├── routes/              # API route definitions
│   │   ├── admin.routes.ts
│   │   ├── auth.ts
│   │   ├── challenge.ts
│   │   └── discuss.ts
│   │
│   ├── scripts/             # Utility scripts
│   │   ├── seedAdmin.ts     # Admin user seeding
│   │   └── seedBadges.ts    # Badge seeding
│   │
│   ├── service/             # Business logic layer
│   │   ├── ai.service.ts    # AI integration service
│   │   └── badge.service.ts # Badge management service
│   │
│   ├── utils/               # Utility functions
│   │   ├── ai.ts
│   │   ├── cloudinary.ts
│   │   ├── piston.ts
│   │   ├── SendMailUtil.ts
│   │   └── tokens.ts
│   │
│   ├── index.ts             # Application entry point
│   └── ...
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn**
- **MongoDB** (v5.0 or higher)
  - Local installation OR MongoDB Atlas account
- **Git** for version control

### External Service Accounts

You'll need accounts and API keys for:

1. **Google OAuth**: [Google Cloud Console](https://console.cloud.google.com/)
2. **GitHub OAuth**: [GitHub Developer Settings](https://github.com/settings/developers)
3. **Cloudinary**: [Cloudinary Console](https://cloudinary.com/)
4. **OpenRouter**: [OpenRouter Dashboard](https://openrouter.ai/)
5. **SMTP Service**: Gmail, SendGrid, or similar

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Sachintha-Prabashana/skillbadge-backend.git
cd skillbadge-backend
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration (see [Configuration](#configuration) section below).

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following variables:

#### Server Configuration

```env
# Server Port
PORT=5000

# Node Environment (development | production | test)
NODE_ENV=development
```

#### Database Configuration

```env
# MongoDB Connection URI
MONGO_URI=mongodb://localhost:27017/skill-badge-platform
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority
```

#### JWT Configuration

```env
# JWT Secret Keys (Generate strong random strings)
JWT_SECRET=your-super-secure-jwt-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secure-refresh-token-secret-key

# Token Expiration
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
```

#### Google OAuth Configuration

```env
# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
```

**Setup Instructions for Google OAuth:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs

#### GitHub OAuth Configuration

```env
# GitHub OAuth App Credentials
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/v1/auth/github/callback
```

**Setup Instructions for GitHub OAuth:**

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL
4. Copy Client ID and generate Client Secret

#### Cloudinary Configuration

```env
# Cloudinary Cloud Storage
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

**Setup Instructions for Cloudinary:**

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Navigate to Dashboard
3. Copy Cloud name, API Key, and API Secret

#### Email Configuration (SMTP)

```env
# SMTP Server Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password

# Email From Details
FROM_NAME=Skill Badge Platform
FROM_EMAIL=noreply@skillbadge.com
```

**Setup Instructions for Gmail SMTP:**

1. Enable 2-Factor Authentication on your Google Account
2. Generate an App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Use the generated password in `SMTP_PASSWORD`

#### AI Configuration (OpenRouter)

```env
# OpenRouter API for AI Features
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-api-key
```

**Setup Instructions for OpenRouter:**

1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Navigate to API Keys section
3. Create a new API key
4. Copy the key to your `.env` file

#### Optional Configuration

```env
# File Upload Limits
MAX_FILE_SIZE=5242880  # 5MB in bytes

# Rate Limiting
RATE_LIMIT_WINDOW=15   # minutes
RATE_LIMIT_MAX=100     # requests per window

# CORS Origins (comma-separated)
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### Security Best Practices

- **Never commit `.env` files** to version control
- Use **strong, unique secrets** for JWT tokens (minimum 32 characters)
- **Rotate API keys** regularly
- Use **environment-specific** `.env` files (`.env.development`, `.env.production`)
- Store production secrets in **secure vaults** (AWS Secrets Manager, HashiCorp Vault)

---

## 🏃‍♂️ Running the Application

### Development Mode

Run with hot-reload enabled:

```bash
npm run dev
```

The server will start on `http://localhost:5000` (or your configured PORT).

### Production Mode

1. **Build the TypeScript code:**

```bash
npm run build
```

2. **Start the production server:**

```bash
npm start
```

### Available Scripts

```bash
# Development with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Seed admin user
npm run seed:admin
```

---

## 🌱 Database Seeding

### Create Admin User

To create an initial admin user for the platform:

```bash
npm run seed:admin
```

**Default Admin Credentials:**

- Email: `admin@skillbadge.com`
- Password: `Admin@123`

**⚠️ Important:** Change the default password immediately after first login in production environments.

### Custom Seeding

You can modify the `src/scripts/seedAdmin.ts` file to customize the admin user details.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💬 Support

### Get Help

- 📧 Email: sachinthaprabhashana2003@gmail.com.com
  
## 🙏 Acknowledgments

- Express.js community
- MongoDB team
- All contributors who helped shape this project

---

<div align="center">

Made with ❤️ by the Skill Badge Platform Team

[⬆ Back to Top](#skill-badge-platform-backend)

</div>
