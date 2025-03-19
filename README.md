# Bad Bank - Full Stack Banking Application

A secure banking application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) that demonstrates modern web development practices and security implementations.

## Features

- 🔐 Secure user authentication with password hashing
- 💰 Account balance management with encryption
- 👥 User roles (Admin/User)
- 🔑 Google OAuth integration
- 📱 Responsive design
- 🔒 AES-256-GCM encryption for sensitive data
- 📊 Transaction logging
- 🛡️ Security best practices

## Security Implementations

- Password hashing using bcrypt
- AES-256-GCM encryption for account balances
- Secure session management
- Environment variable protection
- Input validation
- Error handling
- Rate limiting
- CORS protection

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- bcrypt for password hashing
- crypto for data encryption
- dotenv for environment management

### Frontend
- React.js
- Bootstrap for styling
- Context API for state management
- React Router for navigation

## Getting Started

### Prerequisites
- Node.js (v18.x or higher)
- MongoDB Atlas account
- npm or yarn package manager

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
DB_NAME=badbank
ENCRYPTION_KEY=your_encryption_key
ENCRYPTION_SALT=your_encryption_salt
SESSION_SECRET=your_session_secret
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/badbank.git
cd badbank
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

- `POST /account/create` - Create a new account
- `POST /account/login` - User login
- `POST /account/deposit` - Deposit money
- `POST /account/withdraw` - Withdraw money
- `GET /account/balance` - Get account balance
- `GET /account/all` - Get all users (Admin only)
- `POST /account/updateRole` - Update user role (Admin only)

## Security Features

1. **Password Security**
   - Passwords are hashed using bcrypt
   - Salt rounds: 10
   - Secure password verification

2. **Data Encryption**
   - Account balances are encrypted using AES-256-GCM
   - Encryption key and salt stored in environment variables
   - Secure key derivation using scrypt

3. **Session Management**
   - Secure session handling
   - Session timeout
   - CSRF protection

4. **Error Handling**
   - Comprehensive error logging
   - Secure error messages
   - Input validation

## Deployment

The application is deployed on:
- Frontend: Vercel
- Backend: Heroku
- Database: MongoDB Atlas

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- MIT xPRO Full Stack Development Course
- MongoDB Atlas for database hosting
- Heroku for backend deployment
- Vercel for frontend deployment
