function Balance() {
  const [balance, setBalance] = React.useState(null);
  const [status, setStatus] = React.useState('');
  const { currentUser } = React.useContext(UserContext);

  React.useEffect(() => {
    if (!currentUser) {
      setStatus('Please log in to view your balance');
      return;
    }

    fetch(`${window.API_URL}/account/balance/${currentUser.email}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setBalance(data.balance);
        } else {
          setStatus(data.error || 'Failed to fetch balance');
        }
      })
      .catch(error => {
        console.error('Balance fetch error:', error);
        setStatus('Error: Unable to fetch balance');
      });
  }, [currentUser]);

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Account Balance</h2>
      {status && <div className="alert alert-info">{status}</div>}
      
      <div className="space-y-4">
        {balance !== null && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Current Balance</p>
            <p className="text-4xl font-bold text-primary">${balance.toFixed(2)}</p>
          </div>
        )}

        {!currentUser && (
          <button
            className="btn btn-primary w-full"
            onClick={() => window.location.hash = '#/login'}
          >
            Log In to View Balance
          </button>
        )}
      </div>
    </div>
  );
}

// Export to window object
window.Balance = Balance; 