function Balance() {
  const [show, setShow] = React.useState(true);
  const [status, setStatus] = React.useState('');
  const [balance, setBalance] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);
  const ctx = React.useContext(UserContext);
  const { currentUser } = ctx;

  const fetchBalance = async () => {
    try {
      console.log('=== Starting balance fetch ===');
      console.log('Auth status:', !!currentUser);
      console.log('Current user:', currentUser);
      console.log('Retry count:', retryCount);
      
      if (!currentUser || !currentUser.email) {
        console.log('No authenticated user or email found');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const email = currentUser.email;
      console.log('Fetching balance for:', email);
      
      const response = await fetch(`/account/balance/${encodeURIComponent(email)}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('Error response data:', errorData);
        
        if (response.status === 404 && retryCount < 3) {
          console.log('User not found, retrying in 1 second...');
          setRetryCount(prev => prev + 1);
          setTimeout(fetchBalance, 1000); // 延迟1秒后重试
          return;
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Balance data:', data);
      
      if (data.success) {
        setBalance(data.balance);
        setStatus('');
      } else {
        setStatus(data.message || 'Failed to fetch balance');
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      setStatus('Error fetching balance');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (currentUser && currentUser.email) {
      fetchBalance();
    } else {
      setIsLoading(false);
    }
  }, [currentUser, retryCount]);

  if (!currentUser) {
    return (
      <Card
        bgcolor="danger"
        header="Access Denied"
        status="Please login to access this feature"
        body={
          <div>
            <p>You must be logged in to view your balance.</p>
            <a href="#/login" className="btn btn-light">Go to Login</a>
          </div>
        }
      />
    );
  }

  return (
    <Card
      bgcolor="info"
      header="Balance"
      status={status}
      body={
        isLoading ? (
          <div className="text-center">
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            Balance<br/>
            <h2>${balance}</h2>
          </>
        )
      }
    />
  );
}

// Export to window object
window.Balance = Balance; 