function AllData() {
    const [data, setData] = React.useState([]); // Initialize as an empty array

    React.useEffect(() => {
        fetch('/account/all')
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setData(data);
                } else {
                    console.error('Fetched data is not an array:', data);
                    setData([]); // Fallback to an empty array
                }
            })
            .catch(error => console.error('Fetching error:', error));
    }, []);

    return (
        <>
            <h5>All Data in Store:</h5>
            <div className="card bg-dark text-white">
                <div className="card-header">ALL DATA</div>
                <div className="card-body">
                    <table className="table table-dark">
                        <thead>
                            <tr>
                                <th scope="col">Name</th>
                                <th scope="col">Email</th>
                                <th scope="col">Password</th>
                                <th scope="col">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((user, index) => (
                                <tr key={index}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.password}</td>
                                    <td>${user.balance}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}