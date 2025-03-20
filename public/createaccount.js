function CreateAccount() {
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [status, setStatus] = React.useState('');
    const { currentUser, setCurrentUser } = React.useContext(UserContext);

    function handle() {
        fetch(`${window.API_URL}/account/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                setStatus('Account created successfully!');
                setCurrentUser(data.user);
                window.location.hash = '#/deposit/';
            } else {
                setStatus(data.message || 'Failed to create account');
            }
        })
        .catch(error => {
            console.error('Create account error:', error);
            setStatus('Error: Unable to create account');
        });
    }

    return (
        <div className="card">
            <h2 className="text-2xl font-bold mb-4">Create Account</h2>
            {status && <div className="alert alert-info">{status}</div>}
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter name"
                        value={name}
                        onChange={e => setName(e.currentTarget.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        placeholder="Enter email"
                        value={email}
                        onChange={e => setEmail(e.currentTarget.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Enter password"
                        value={password}
                        onChange={e => setPassword(e.currentTarget.value)}
                    />
                </div>

                <button
                    className="btn btn-primary w-full"
                    onClick={handle}
                >
                    Create Account
                </button>
            </div>
        </div>
    );
}