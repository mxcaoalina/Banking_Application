function Withdraw() {
    const [amount, setAmount] = React.useState('');
    const [status, setStatus] = React.useState('');
    const { currentUser } = React.useContext(UserContext);

    function handle() {
        if (!currentUser) {
            setStatus('Please log in to make a withdrawal');
            return;
        }

        fetch(`${window.API_URL}/account/withdraw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: currentUser.email, amount: parseFloat(amount) })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                setStatus('Withdrawal successful!');
                setAmount('');
            } else {
                setStatus(data.error || 'Failed to withdraw');
            }
        })
        .catch(error => {
            console.error('Withdrawal error:', error);
            setStatus('Error: Unable to process withdrawal');
        });
    }

    return (
        <div className="card">
            <h2 className="text-2xl font-bold mb-4">Make a Withdrawal</h2>
            {status && <div className="alert alert-info">{status}</div>}
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                        type="number"
                        className="form-control"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={e => setAmount(e.currentTarget.value)}
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
