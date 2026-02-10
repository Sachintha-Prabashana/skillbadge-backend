# Skill Badge Platform Backend

> A comprehensive backend system for skill verification, badge management, and professional development tracking with AI-powered features and OAuth integration.

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

| **🚀 Live Application** | 🟢 Up | [**Visit Frontend App**](https://skillbadge-frontend.vercel.app) |
| **📡 Backend API** | 🟢 Up | [**Base API URL**](https://controlled-karina-spsolutions-ea693d09.koyeb.app/) |
| **💻 Frontend Repo** | 📂 Code | [**View Frontend Source**](https://github.com/Sachintha-Prabashana/skillbadge-frontend) |

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
- [Getting Started](#getting-started)
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

### Challenges & Programming

- 💻 Create and manage coding challenges
- 🔧 Support for multiple programming languages (Python, JavaScript, Java, C++, etc.)
- ⚡ Real-time code execution using Piston API
- 🎯 Challenge categorization by difficulty (EASY, MEDIUM, HARD)
- 🏆 Submission tracking and validation
- 💡 AI-powered hint generation
- 🎮 Random unsolved challenge suggestions

### Daily Challenge System

- 📅 Daily randomized challenge selection
- 🎁 Daily challenge motivation system
- ⚙️ Lazy-loading daily challenge creation
- 🔄 One challenge per day rotation

### AI-Powered Interview System

- 🤖 Multi-stream technical interview simulation (Frontend, Backend, Full-stack)
- 🎓 Difficulty levels (Beginner, Intermediate, Advanced)
- 💬 AI-powered conversational interviews with Gemini
- 📊 10-question per interview with final feedback report
- 🎯 Interview status tracking (ACTIVE, COMPLETED)
- ⏱️ Message history and conversation logging
- 📋 Automated scoring system (0-100)

### Coding Contests

- 🏅 Multi-problem contest management
- ⏱️ Time-limited contest events
- 🎯 Variable point distribution (10, 20, 30, 40 points)
- 👥 Participant tracking and leaderboards
- 📊 Contest-based competitive programming

### Discussion & Collaboration

- 💬 Real-time discussion forums per challenge/badge
- 👥 Comment and reply functionality
- 🔔 Socket.io real-time notifications
- 📝 Post management and moderation
- 👁️ View tracking per post (unique users and guests)
- 📊 View analytics with auto-expiry (24-hour)

### Badge Management

- 🏅 Create and manage skill badges
- ✅ Badge verification system
- 📊 Badge analytics and tracking
- 🎨 Custom badge designs with Cloudinary
- 📜 Badge issuance history
- 🎖️ Badge-specific discussion forums

### Media Management

- ☁️ Cloud storage integration (Cloudinary)
- 🖼️ Image upload and optimization
- 📦 File organization and retrieval
- 🔒 Secure media access control

### Admin Dashboard & Analytics

- 👨‍💼 Comprehensive user management
- 📊 Platform analytics and insights
- 🛠️ Challenge creation and management
- 🎯 Contest management and monitoring
- 📋 Content moderation tools
- 🔧 System configuration and settings

---

## 🛠️ Tech Stack

### Core Technologies

- **Runtime**: Node.js (≥18.0.0)
- **Language**: TypeScript (5.0+)
- **Framework**: Express.js (5.0+)
- **Database**: MongoDB (v5.0+) with Mongoose ODM

### Authentication & Security

- **JWT**: JSON Web Tokens for stateless authentication
- **Passport.js**: OAuth strategies (Google, GitHub)
- **bcryptjs**: Password hashing and security

### Real-time Communication

- **Socket.io**: Real-time bidirectional communication for discussions
- **HTTP**: RESTful API endpoints

### Code Execution & AI

- **Piston API**: Remote code execution for 50+ programming languages
- **Google Gemini AI**: Conversational AI for technical interviews
- **OpenRouter**: LLM integration for AI-powered features
- **OpenAI**: AI content generation

### Cloud Services

- **Cloudinary**: Media storage, optimization, and transformation
- **SMTP**: Email delivery service (Gmail, SendGrid compatible)

### File Management

- **Multer**: Multipart form data handling for file uploads
- **Streamifier**: Stream-based file conversion

### Development & DevOps Tools

- **ts-node**: TypeScript execution without compilation
- **ts-node-dev**: Development server with auto-reload
- **dotenv**: Environment configuration management
- **TypeScript**: Strict type checking and modern JavaScript features

### Libraries & Utilities

- **Mongoose**: MongoDB object modeling
- **Axios**: HTTP client
- **Nodemailer**: Email sending
- **jsonwebtoken**: JWT creation and verification
- **cors**: Cross-Origin Resource Sharing
- **express-validator**: Input validation

---

## 📁 Project Structure

```
skill-badge-platform-backend/
├── src/
│   ├── config/                          # Configuration files
│   │   ├── cloudinary.ts                # Cloudinary setup
│   │   ├── passport.ts                  # OAuth strategies
│   │   └── seeds/
│   │       └── badgeManifest.ts         # Badge seed data
│   │
│   ├── controllers/                     # Request handlers
│   │   ├── admin/                       # Admin-specific controllers
│   │   │   ├── admin.analytics.controller.ts
│   │   │   ├── admin.Challenge.controller.ts
│   │   │   ├── admin.contest.controller.ts
│   │   │   ├── admin.dashboard.controller.ts
│   │   │   ├── admin.setting.controller.ts
│   │   │   └── admin.user.controller.ts
│   │   ├── auth.controller.ts           # Authentication logic
│   │   ├── challenge.controller.ts      # Challenge CRUD & logic
│   │   ├── daily.challenge.controller.ts # Daily challenge logic
│   │   ├── discuss.controller.ts        # Discussion/posts logic
│   │   ├── interview.controller.ts      # Interview system logic
│   │   ├── submission.controller.ts     # Code submission & execution
│   │   └── user.controller.ts           # User profile management
│   │
│   ├── middleware/                      # Custom middleware
│   │   ├── auth.ts                      # JWT authentication middleware
│   │   ├── role.ts                      # Role-based access control
│   │   └── upload.ts                    # Multer file upload handling
│   │
│   ├── models/                          # Mongoose schemas
│   │   ├── badge.model.ts               # Badge schema
│   │   ├── challenge.model.ts           # Challenge schema
│   │   ├── comment.model.ts             # Comment schema
│   │   ├── contest.model.ts             # Contest schema
│   │   ├── dailyChallenge.model.ts      # Daily challenge tracking
│   │   ├── interview.model.ts           # Interview session schema
│   │   ├── post.model.ts                # Discussion post schema
│   │   ├── submission.model.ts          # Code submission schema
│   │   ├── user.model.ts                # User schema
│   │   └── view.model.ts                # Post view tracking schema
│   │
│   ├── routes/                          # API route definitions
│   │   ├── admin.routes.ts              # Admin routes
│   │   ├── auth.ts                      # Authentication routes
│   │   ├── challenge.ts                 # Challenge routes
│   │   ├── discuss.ts                   # Discussion routes
│   │   ├── interview.ts                 # Interview routes
│   │   └── user.ts                      # User routes
│   │
│   ├── scripts/                         # Utility scripts
│   │   ├── seedAdmin.ts                 # Admin user seeding
│   │   └── seedBadges.ts                # Badge seeding
│   │
│   ├── service/                         # Business logic layer
│   │   ├── ai.service.ts                # AI integration service
│   │   └── badge.service.ts             # Badge management service
│   │
│   ├── utils/                           # Utility functions
│   │   ├── ai.ts                        # AI prompt templates
│   │   ├── cloudinary.ts                # Cloudinary utilities
│   │   ├── openrouter.ts                # OpenRouter API wrapper
│   │   ├── piston.ts                    # Piston code execution API
│   │   ├── SendMailUtil.ts              # Email utility
│   │   └── tokens.ts                    # JWT token utilities
│   │
│   └── index.ts                         # Application entry point
│
├── dist/                                # Compiled JavaScript (generated)
├── node_modules/                        # Dependencies
├── package.json                         # Project metadata & dependencies
├── tsconfig.json                        # TypeScript configuration
├── test.js                              # Test file
└── README.md                            # This file
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

## 🚀 Getting Started

### Quick Setup (5 minutes)

1. **Clone and install dependencies:**
```bash
git clone https://github.com/Sachintha-Prabashana/skillbadge-backend.git
cd skillbadge-backend
npm install
```

2. **Create `.env` file with essential variables:**
```bash
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/skill-badge-platform
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
OPENROUTER_API_KEY=your-openrouter-api-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Create admin user:**
```bash
npm run seed:admin
```

5. **Test the API:**
```bash
curl http://localhost:5000/api/v1/challenges
```

### Minimum Requirements for Basic Testing

You need at minimum:
- MongoDB (local or Atlas)
- Node.js 18+
- One OAuth provider (Google or GitHub) OR local JWT testing
- Optional: Cloudinary for media features

For full features:
- Google/GitHub OAuth accounts
- Cloudinary account
- OpenRouter API key (for AI interviews)
- SMTP email service

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

## 📡 API Documentation

### Base URL

```
https://controlled-karina-spsolutions-ea693d09.koyeb.app/api/v1
```

### Authentication Endpoints

#### Login / Register

```http
POST /auth/login
POST /auth/register
POST /auth/logout
POST /auth/refresh-token
```

#### OAuth

```http
GET /auth/google
GET /auth/google/callback
GET /auth/github
GET /auth/github/callback
```

### Challenge Endpoints

#### Get All Challenges

```http
GET /challenges
Headers: Authorization: Bearer <token>
```

**Response:**
```json
{
  "challenges": [
    {
      "_id": "123abc",
      "title": "Two Sum",
      "difficulty": "EASY",
      "description": "Find two numbers that add up to target",
      "languages": ["python", "javascript"],
      "testCases": [...],
      "solved": true
    }
  ],
  "totalPages": 5,
  "currentPage": 1
}
```

#### Get Challenge by ID

```http
GET /challenges/:id
Headers: Authorization: Bearer <token>
```

#### Submit Challenge Solution

```http
POST /challenges/submit
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "challengeId": "123abc",
  "code": "def twoSum(nums, target):\n  ...",
  "language": "python"
}
```

#### Run Code (Piston Execution)

```http
POST /challenges/run
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "challengeId": "123abc",
  "code": "print('Hello')",
  "language": "python"
}
```

**Response:**
```json
{
  "results": [
    {
      "output": "Hello",
      "expected": "Hello",
      "passed": true
    }
  ],
  "allPassed": true
}
```

#### Get Challenge Hint

```http
POST /challenges/:id/hint
Headers: Authorization: Bearer <token>
```

#### Get Random Unsolved Challenge

```http
GET /challenges/random
Headers: Authorization: Bearer <token>
```

### Daily Challenge Endpoints

#### Get Today's Daily Challenge ID

```http
GET /challenges/daily/id
Headers: Authorization: Bearer <token>
```

**Response:**
```json
{
  "challengeId": "65a4f8c9d1e2f3g4h5i6j7k8"
}
```

### Interview Endpoints

#### Start Technical Interview

```http
POST /interview/start
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "stream": "Frontend",
  "difficulty": "Intermediate"
}
```

**Response:**
```json
{
  "interviewId": "int_123abc",
  "stream": "Frontend",
  "difficulty": "Intermediate",
  "message": "What is the Virtual DOM and how does it work?"
}
```

#### Chat Interview (Answer Question)

```http
POST /interview/chat
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "interviewId": "int_123abc",
  "userAnswer": "The Virtual DOM is a lightweight JavaScript representation of the real DOM..."
}
```

**Response:**
```json
{
  "message": "Great explanation! Now, can you explain React hooks?",
  "questionCount": 2,
  "isCompleted": false
}
```

**Final Response (10th question):**
```json
{
  "message": "Interview Completed.\n\nFinal Feedback Report:\nScore: 85/100\nStrengths: Good understanding of React fundamentals\nWeaknesses: Need more practice with advanced patterns",
  "questionCount": 10,
  "isCompleted": true
}
```

### Discussion Endpoints

#### Get All Posts

```http
GET /discuss
Headers: Authorization: Bearer <token>
```

#### Create Post

```http
POST /discuss
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Need help with recursion",
  "content": "I'm struggling with implementing binary search...",
  "challengeId": "123abc",
  "tags": ["recursion", "arrays"]
}
```

#### Add Comment

```http
POST /discuss/:postId/comment
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "You can use two pointers approach..."
}
```

#### Track Post View

```http
POST /discuss/:postId/view
Headers: Authorization: Bearer <token>
```

**Real-time Socket.io Events:**
```javascript
// Client-side
socket.emit('join_post', postId);
socket.on('new_comment', (comment) => {
  // Handle new comment
});
```

### User Endpoints

#### Get User Profile

```http
GET /users/profile
Headers: Authorization: Bearer <token>
```

#### Update User Profile

```http
PUT /users/profile
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Full-stack developer"
}
```

#### Get User Statistics

```http
GET /users/stats
Headers: Authorization: Bearer <token>
```

**Response:**
```json
{
  "challengesSolved": 25,
  "badges": 5,
  "interviewsCompleted": 3,
  "totalPoints": 450,
  "level": "Gold"
}
```

### Admin Endpoints

#### User Management

```http
GET /admin/users                    # List all users
GET /admin/users/:id               # Get user details
PUT /admin/users/:id               # Update user
DELETE /admin/users/:id            # Delete user
```

#### Challenge Management

```http
POST /admin/challenges             # Create challenge
PUT /admin/challenges/:id          # Update challenge
DELETE /admin/challenges/:id       # Delete challenge
```

#### Contest Management

```http
POST /admin/contests               # Create contest
GET /admin/contests                # List contests
PUT /admin/contests/:id            # Update contest
GET /admin/contests/:id/stats      # Contest statistics
```

#### Analytics

```http
GET /admin/analytics/dashboard     # Platform overview
GET /admin/analytics/users         # User statistics
GET /admin/analytics/challenges    # Challenge statistics
GET /admin/analytics/contests      # Contest statistics
```

---

## 💻 Development

### Code Standards

- **Language**: TypeScript with strict type checking
- **Style**: Follow Express.js and Node.js best practices
- **Patterns**: MVC architecture with controllers, services, and models
- **Error Handling**: Centralized error handling middleware
- **Validation**: Input validation on all endpoints

### Development Workflow

1. **Create a feature branch:**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes:**
   - Write clean, documented code
   - Follow TypeScript conventions
   - Use meaningful variable and function names

3. **Test your changes:**
```bash
npm run dev
# Test endpoints with Postman or curl
```

4. **Build before commit:**
```bash
npm run build
```

5. **Commit with descriptive messages:**
```bash
git commit -m "feat: add new interview feature"
git push origin feature/your-feature-name
```

### Useful Development Commands

```bash
# Development with auto-reload
npm run dev

# Build TypeScript
npm run build

# Seed database
npm run seed:admin

# Check for TypeScript errors
npx tsc --noEmit
```

### File Upload Guide

File uploads are handled through Cloudinary. The `upload.ts` middleware manages:
- File validation
- Size restrictions
- Format checking
- Security scanning

### Real-time Features

The platform uses Socket.io for:
- Real-time discussion comments
- Live notification delivery
- Post view count updates

Socket rooms are managed by Post ID for targeted updates.

---

## 🧪 Testing

### Manual Testing

Use tools like [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/) to test API endpoints.

### Unit Testing

```bash
npm test
```

### Integration Testing

Test complete workflows:
- User registration → Login → Challenge submission
- Interview creation → Answer questions → Get feedback
- Discussion post → Comments → Notifications

---

## 🚀 Deployment

### Deployment Platforms

The backend can be deployed to:
- **Koyeb** (Current deployment)
- **Heroku**
- **Railway**
- **Render**
- **AWS Elastic Beanstalk**
- **DigitalOcean App Platform**

### Pre-deployment Checklist

- [ ] Update all environment variables
- [ ] Run `npm run build` successfully
- [ ] Test all OAuth callbacks are correct
- [ ] Verify Cloudinary credentials
- [ ] Check MongoDB Atlas connection
- [ ] Update CORS origins
- [ ] Set NODE_ENV=production
- [ ] Review security headers
- [ ] Test error handling

### Environment-Specific Configuration

**Development (.env.development):**
```env
NODE_ENV=development
DEBUG=true
```

**Production (.env.production):**
```env
NODE_ENV=production
DEBUG=false
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines

- Write clear commit messages
- Update documentation for new features
- Test your changes thoroughly
- Follow existing code style
- Add comments for complex logic

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

---

## 💬 Support

### Get Help

- 📧 **Email**: sachinthaprabhashana2003@gmail.com
- 🐙 **GitHub Issues**: [Report a bug](https://github.com/Sachintha-Prabashana/skillbadge-backend/issues)
- 📚 **Documentation**: Check README and API docs above
- 💻 **Frontend Repo**: [skillbadge-frontend](https://github.com/Sachintha-Prabashana/skillbadge-frontend)

### Common Issues

**MongoDB Connection Error:**
- Verify MONGO_URI is correct
- Check MongoDB service is running
- Ensure network access is allowed (Atlas)

**OAuth Not Working:**
- Verify callback URLs match exactly
- Check client ID and secret are correct
- Clear browser cache and cookies

**Email Not Sending:**
- Enable "Less secure apps" (Gmail) or use App Password
- Verify SMTP credentials
- Check email quota not exceeded

**Code Execution Errors:**
- Verify Piston API is accessible
- Check language is supported
- Test with simple code first

---

## 🙏 Acknowledgments

### Technologies & Services

- **[Express.js](https://expressjs.com/)** - Web application framework
- **[MongoDB](https://www.mongodb.com/)** - NoSQL database
- **[Mongoose](https://mongoosejs.com/)** - MongoDB object modeling
- **[Socket.io](https://socket.io/)** - Real-time communication
- **[Passport.js](https://www.passportjs.org/)** - Authentication middleware
- **[Cloudinary](https://cloudinary.com/)** - Cloud media management
- **[Google Gemini](https://ai.google.dev/)** - AI/ML capabilities
- **[OpenRouter](https://openrouter.ai/)** - LLM API aggregation
- **[Piston](https://piston.readthedocs.io/)** - Code execution engine
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript

### Contributors

Special thanks to all contributors who have helped improve this project.

### Inspiration

Built with inspiration from modern coding platforms like:
- LeetCode
- HackerRank
- CodeSignal
- InterviewBit

### Community

- Express.js community
- MongoDB team
- Node.js developers worldwide
- Open-source contributors

---

## 📞 Contact & Social

- 📧 Email: sachinthaprabhashana2003@gmail.com
- 🐙 GitHub: [@Sachintha-Prabashana](https://github.com/Sachintha-Prabashana)
- 🌐 Portfolio: [Visit My Site](https://skillbadge-frontend.vercel.app)

---

## 📝 Changelog

### Version 1.0.0 (Current)

**Features:**
- ✅ Authentication (JWT + OAuth)
- ✅ Challenge management with code execution
- ✅ Daily challenge system
- ✅ AI-powered technical interviews
- ✅ Coding contests
- ✅ Real-time discussions
- ✅ Badge system
- ✅ Admin dashboard with analytics
- ✅ Media management (Cloudinary)
- ✅ Socket.io real-time updates

---

<div align="center">

### Made with ❤️ by the Skill Badge Platform Team

**[⬆ Back to Top](#skill-badge-platform-backend)**

**Star this repository if you find it useful! ⭐**

© 2025 Skill Badge Platform. All rights reserved.

</div>
