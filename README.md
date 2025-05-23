# Bad Bank - Enterprise Banking Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://github.com/yourusername/bad-bank/actions/workflows/node.js.yml/badge.svg)](https://github.com/yourusername/bad-bank/actions/workflows/node.js.yml)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-%23000000.svg?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)

## Overview
Bad Bank is a production-grade banking application implementing industry-standard security practices and modern web development patterns. The application provides a secure platform for user account management, financial transactions, and administrative operations.

### Live Demo
Production environment is available at [https://badbank-full-stack-capstone-844c728b4974.herokuapp.com/#/](https://badbank-full-stack-capstone-844c728b4974.herokuapp.com/#/) with API documentation at [https://badbank-full-stack-capstone-844c728b4974.herokuapp.com/api-docs](https://badbank-full-stack-capstone-844c728b4974.herokuapp.com/api-docs)

## Key Features
The application implements comprehensive security measures including secure authentication with bcrypt, JWT, and Google OAuth 2.0 integration. All sensitive financial data is protected using AES-256-GCM encryption. The system provides real-time account management and transaction processing capabilities, supported by a role-based access control system and comprehensive admin dashboard.

The technical implementation features a RESTful API architecture with Swagger documentation, responsive design, and an automated testing pipeline ensuring reliability and performance.

## Tech Stack
### Backend
The backend is built on Node.js (v18.x) with Express.js, utilizing MongoDB with Mongoose ODM for data persistence. Security is implemented through bcrypt for password hashing, crypto for AES-256-GCM encryption, helmet for security headers, and rate-limiter-flexible for API protection. The application uses Jest and Supertest for testing, with Swagger/OpenAPI for documentation.

### Frontend
The frontend is developed using React.js with Context API for state management. The user interface is built with Bootstrap 5 components, form handling is managed through Formik with Yup validation, and HTTP requests are handled via Axios.

## Security Implementation

### Password Security
- bcrypt with 10 salt rounds
- Automatic salt generation and storage
- Protection against rainbow table attacks
- Password complexity requirements
- Account lockout after failed attempts

### Data Encryption
- AES-256-GCM for sensitive data
- Unique IV per encryption
- Key derivation via scrypt
- Authentication tags for data integrity
- Regular key rotation

### Additional Security Measures
The application implements multiple layers of security including JWT-based session management and rate limiting for brute force protection. All user inputs are validated and sanitized, with protection against common web vulnerabilities such as XSS, CSRF, and SQL injection.

## API Documentation

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | User authentication |
| POST | `/api/auth/google` | Google OAuth authentication |
| POST | `/api/auth/refresh` | Refresh JWT token |
| POST | `/api/auth/logout` | User logout |

### Banking Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transactions/deposit` | Process deposit |
| POST | `/api/transactions/withdraw` | Process withdrawal |
| GET | `/api/transactions/history` | Get transaction history |
| GET | `/api/account/balance` | Get current balance |
| GET | `/api/account/statement` | Get account statement |

### Admin Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users (Admin only) |
| PUT | `/api/admin/users/:id/role` | Update user role (Admin only) |
| GET | `/api/admin/transactions` | View all transactions (Admin only) |
| GET | `/api/admin/analytics` | View system analytics (Admin only) |

## Getting Started

### Prerequisites
The application requires Node.js (v18+), MongoDB (v4.4+), and npm/yarn package manager. Docker is optional but recommended for containerized deployment.

### Quick Start
1. Clone and install:
```bash
git clone https://github.com/yourusername/bad-bank.git
cd bad-bank
npm install
```

2. Configure environment variables in `.env`:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
BCRYPT_SALT_ROUNDS=10
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

3. Start the application:
```bash
npm run dev    # Development
npm start      # Production
```

### Docker Deployment
```bash
docker-compose up --build
```

## Development
Common development commands:
```bash
npm test              # Run tests
npm run test:coverage # Test coverage
npm run migrate:up    # Run migrations
```

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
Special thanks to the MIT xPRO Full Stack Development Program, MongoDB Atlas, Heroku, and Vercel for their hosting services, and all contributors and maintainers who have helped shape this project.