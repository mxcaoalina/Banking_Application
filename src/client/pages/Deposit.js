function Deposit() {
    const [amount, setAmount] = React.useState('');
    const [status, setStatus] = React.useState('');
    const [balance, setBalance] = React.useState(null);
    const { currentUser } = React.useContext(UserContext);

    function fetchBalance() {
        if (!currentUser) return;
        fetch(`${window.API_URL}/account/balance/${currentUser.email}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setBalance(data.balance);
                }
            })
            .catch(error => console.error('Error fetching balance:', error));
    }

    React.useEffect(() => {
        fetchBalance();
    }, [currentUser]);

    function handle() {
        if (!currentUser) {
            setStatus('Please log in to make a deposit');
            return;
        }

        const depositAmount = parseFloat(amount);
        if (isNaN(depositAmount) || depositAmount <= 0) {
            setStatus('Please enter a valid positive amount');
            return;
        }

        fetch(`${window.API_URL}/account/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email: currentUser.email,
                amount: depositAmount
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                setStatus('Deposit successful!');
                setAmount('');
                fetchBalance();
            } else {
                setStatus(data.message || 'Failed to deposit');
            }
        })
        .catch(error => {
            console.error('Deposit error:', error);
            setStatus('Error: Unable to process deposit');
        });
    }

    return (
        <div className="card">
            <h2 className="text-2xl font-bold mb-4">Make a Deposit</h2>
            {status && <div className="alert alert-info">{status}</div>}
            
            <div className="space-y-4">
                {balance !== null && (
                    <div className="text-center mb-4">
                        <p className="text-sm text-gray-600">Current Balance</p>
                        <p className="text-2xl font-bold text-primary">${balance.toFixed(2)}</p>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                        type="number"
                        className="form-control"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={e => setAmount(e.currentTarget.value)}
                        min="0"
                        step="0.01"
                    />
                </div>

                <button
                    className="btn btn-primary w-full"
                    onClick={handle}
                    disabled={!currentUser}
                >
                    {currentUser ? 'Deposit' : 'Please Log In'}
                </button>
            </div>
        </div>
    );
}
