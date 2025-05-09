function AllData() {
    const [data, setData] = React.useState([]);
    const [error, setError] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(true);
    const { currentUser } = React.useContext(UserContext);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError('');
                
                if (!currentUser) {
                    setError('Please login first');
                    return;
                }

                const response = await fetch(`/account/all?email=${encodeURIComponent(currentUser.email)}`, {
                    headers: {
                        'x-user-email': currentUser.email
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch data');
                }

                const result = await response.json();
                if (Array.isArray(result)) {
                    setData(result);
                } else {
                    throw new Error('Invalid data format');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    if (!currentUser) {
        return (
            <Card
                bgcolor="danger"
                header="Access Denied"
                status="Please login first"
                body={
                    <div>
                        <p>You need to login to access this feature.</p>
                        <a href="#/login" className="btn btn-light">Go to Login</a>
                    </div>
                }
            />
        );
    }

    if (error) {
        return (
            <Card
                bgcolor="danger"
                header="Error"
                status={error}
                body={
                    <div>
                        <p>Unable to load data. Please ensure you have permission to access this page.</p>
                        <a href="#/" className="btn btn-light">Return to Home</a>
                    </div>
                }
            />
        );
    }

    return (
        <>
            <h5>User Account Overview</h5>
            {isLoading ? (
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="card bg-dark text-white">
                    <div className="card-header">Account Summary</div>
                    <div className="card-body">
                        <table className="table table-dark">
                            <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Account Status</th>
                                    <th scope="col">Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((user, index) => (
                                    <tr key={index}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.balance >= 0 ? 'Active' : 'Overdrawn'}</td>
                                        <td>{new Date(user.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
}