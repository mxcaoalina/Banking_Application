function Login(){
  const [show, setShow]     = React.useState(true);
  const [status, setStatus] = React.useState('');    

  // Handle Google OAuth response
  React.useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const googleAuth = queryParams.get('googleAuth');

    if (googleAuth === 'success') {
      setStatus('Google authentication successful!');
      setShow(false);
    } else if (googleAuth === 'failure') {
      setStatus('Google authentication failed.');
    }
  }, []);

  function handleGoogleLogin() {
    window.location.href = '/auth/google';
  }

  
  return (
    <Card
      bgcolor="secondary"
      header="Login"
      status={status}
      body={show ? 
        <LoginForm setShow={setShow} setStatus={setStatus} handleGoogleLogin={handleGoogleLogin}/> :
        <LoginMsg setShow={setShow} setStatus={setStatus}/>}
    />
  ) 
};

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