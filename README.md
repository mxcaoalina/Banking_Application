# Bad Bank - Full Stack Banking Application

## Description
A full-stack banking application that allows users to create accounts, make deposits, withdrawals, and view their transaction history. The application is deployed globally and uses MongoDB Atlas for data persistence.

## Live Demo
The application is deployed and accessible at:
[BadBank Application](https://badbank-full-stack-capstone-844c728b4974.herokuapp.com/#/)


## Features

- 🔐 Secure user authentication with password hashing
- 💰 Account balance management with encryption
- 👥 User roles (Admin/User)
- 🔑 Google OAuth integration
- 📱 Responsive design
- 🔒 AES-256-GCM encryption for sensitive data
- 📊 Transaction logging
- 🛡️ Security best practices

## Key Security Features

### 1. Password Security
#### bcrypt (10 salt rounds):
- Automatically handles salt generation and storage
- Resistant to rainbow table attacks
- Computationally expensive for brute-force attempts
- Standard library support makes it straightforward and reliable


### 2. Balance Encryption
#### AES-256-GCM (Galois/Counter Mode):
- Ensures confidentiality (data is unreadable if intercepted)
- Provides authenticity through authentication tags (protects against tampering)
- Uses a unique IV (Initialization Vector) per encryption to prevent replay attacks
- Key derivation via scrypt for added security against brute force on encryption keys

### 3. Error Handling
#### Graceful fallback:
- If encryption/decryption fails, system avoids disclosing sensitive details to the end-user
#### Secure error messages:
- Logs errors for debugging while preventing information leaks
#### Input validation:
- Sanitizes and validates user inputs to protect against injection or malformed data

### 4. Environment Variables
#### Sensitive keys stored securely in environment variables:
- Keeps credentials and encryption keys out of source control
#### Separate keys for different environments (development, production):
- Reduces risk of accidental key exposure
#### Fallback values in development:
- Ensures local testing remains easy without leaking production secrets


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

## Installation for Local Development
1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file with the following variables:
```
MONGODB_URI=your_mongodb_atlas_connection_string
SECRET_KEY=your_secret_key
```

4. Start the application:
```bash
npm start
```

## Deployment
The application is deployed on Heroku and uses MongoDB Atlas for the database. This means:
- Data persistence across sessions
- Global accessibility
- Scalable database solution
- Reliable cloud hosting

## API Endpoints

- `POST /account/create` - Create a new account
- `POST /account/login` - User login
- `POST /account/deposit` - Deposit money
- `POST /account/withdraw` - Withdraw money
- `GET /account/balance` - Get account balance
- `GET /account/all` - Get all users (Admin only)
- `POST /account/updateRole` - Update user role (Admin only)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- MIT xPRO Full Stack Development Course
- MongoDB Atlas for database hosting
- Heroku for backend deployment
- Vercel for frontend deployment
