const apiConfig = {
  // API version
  version: 'v1',
  
  // Base URL for API endpoints
  baseUrl: '/api',
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  
  // Endpoints
  endpoints: {
    auth: {
      register: '/auth/register',
      login: '/auth/login',
      logout: '/auth/logout'
    },
    account: {
      create: '/account/create',
      update: '/account/update',
      balance: '/account/balance',
      find: '/account/find'
    },
    admin: {
      users: '/admin/users',
      transactions: '/admin/transactions'
    }
  },
  
  // Response messages
  messages: {
    success: {
      accountCreated: 'Account created successfully',
      loginSuccess: 'Login successful',
      balanceUpdated: 'Balance updated successfully'
    },
    error: {
      invalidInput: 'Invalid input data',
      unauthorized: 'Unauthorized access',
      notFound: 'Resource not found',
      serverError: 'Internal server error'
    }
  }
};

module.exports = apiConfig; 