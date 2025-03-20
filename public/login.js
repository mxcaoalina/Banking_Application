function Login() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [status, setStatus] = React.useState('');
    const { login } = React.useContext(UserContext);

    function handle() {
        fetch(`${window.API_URL}/account/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                login(data.user);
                setStatus('Login successful!');
            } else {
                setStatus(data.error || 'Login failed');
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            setStatus('Error: Unable to login');
        });
    }

    return (
        <div className="card">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            {status && <div className="alert alert-info">{status}</div>}
            
            <div className="space-y-4">
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
                    className="btn btn-light w-full"
                    onClick={handle}
                >
                    Login
                </button>
            </div>
        </div>
    );
}

function LoginMsg(props){
  return(<>
    <h5>Success</h5>
    <button type="submit" 
      className="btn btn-light" 
      onClick={() => props.setShow(true)}>
        Logout
    </button>
  </>);
}

function LoginForm({ setShow, setStatus, handleGoogleLogin }){
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  function handle(){
    fetch(`${window.API_URL}/account/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setStatus('');
        setShow(false);
        console.log('Login successful:', data);
      } else {
        setStatus(data.message || 'Login failed');
        console.log('Login failed:', data);
      }
    })
    .catch(error => {
      console.error('Login error:', error);
      setStatus('Error: Unable to login');
    });
  }
  

  return (<>

    Email<br/>
    <input type="input" 
      className="form-control" 
      placeholder="Enter email" 
      value={email} 
      onChange={e => setEmail(e.currentTarget.value)}/><br/>

    Password<br/>
    <input type="password" 
      className="form-control" 
      placeholder="Enter password" 
      value={password} 
      onChange={e => setPassword(e.currentTarget.value)}/><br/>

    <button type="submit" className="btn btn-light" onClick={handle}>Login</button>
    <button type="button" className="btn btn-light" onClick={handleGoogleLogin}>Login with Google</button>
  </>);
}