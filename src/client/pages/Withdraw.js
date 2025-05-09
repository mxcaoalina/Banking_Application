function Withdraw() {
    const [amount, setAmount] = React.useState('');
    const [status, setStatus] = React.useState('');
    const [balance, setBalance] = React.useState(null);
    const { currentUser } = React.useContext(UserContext);

    const quickAmounts = [10, 20, 50, 100, 200];

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
            setStatus('Please log in to make a withdrawal');
            return;
        }

        const withdrawAmount = parseFloat(amount);
        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            setStatus('Please enter a valid positive amount');
            return;
        }

        if (withdrawAmount > balance) {
            setStatus('Insufficient funds. Please enter a smaller amount.');
            return;
        }

        fetch(`${window.API_URL}/account/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email: currentUser.email,
                amount: -withdrawAmount
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                setStatus('Withdrawal successful!');
                setAmount('');
                fetchBalance();
            } else {
                setStatus(data.message || 'Failed to withdraw');
            }
        })
        .catch(error => {
            console.error('Withdrawal error:', error);
            setStatus('Error: Unable to process withdrawal');
        });
    }

    function handleQuickAmount(amount) {
        setAmount(amount.toString());
    }

    return (
        <div className="card">
            <h2 className="text-2xl font-bold mb-4">Make a Withdrawal</h2>
            {status && <div className="alert alert-info">{status}</div>}
            
            <div className="space-y-4">
                {balance !== null && (
                    <div className="text-center mb-4">
                        <p className="text-sm text-gray-600">Current Balance</p>
                        <p className="text-2xl font-bold text-primary">${balance.toFixed(2)}</p>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quick Withdraw</label>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {quickAmounts.map((amount) => (
                            <button
                                key={amount}
                                className="btn btn-outline"
                                onClick={() => handleQuickAmount(amount)}
                                disabled={amount > balance}
                            >
                                ${amount}
                            </button>
                        ))}
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Custom Amount</label>
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
                    {currentUser ? 'Withdraw' : 'Please Log In'}
                </button>
            </div>
        </div>
    );
}
