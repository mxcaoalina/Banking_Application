function Login() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [status, setStatus] = React.useState('');
    const { login } = React.useContext(UserContext);

    function handle() {
        fetch(`/account/login`, {
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
        <Card
            bgcolor="secondary"
            header="Login"
            status={status}
            body={
                <>
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

                    <button type="submit"
                        className="btn btn-light"
                        onClick={handle}>Login</button>
                </>
            }
        />
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
    fetch(`/account/login/${email}/${password}`)
      .then(response => response.text())
      .then(text => {
        try {
          const data = JSON.parse(text);
          setStatus('');
          setShow(false);
          console.log('JSON:', data);
        } catch(err) {
          setStatus(text);
          console.log('err:', text);
        }
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