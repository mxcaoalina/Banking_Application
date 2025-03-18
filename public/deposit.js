function Deposit() {
  const [show, setShow] = React.useState(true);
  const [status, setStatus] = React.useState('');
  const [balance, setBalance] = React.useState(0);
  const { isAuthenticated, currentUser } = React.useContext(UserContext);

  if (!isAuthenticated) {
    return (
      <Card
        bgcolor="danger"
        header="Access Denied"
        status="Please login to access this feature"
        body={
          <div>
            <p>You must be logged in to make deposits.</p>
            <a href="#/login" className="btn btn-light">Go to Login</a>
          </div>
        }
      />
    );
  }

  return (
    <Card
      bgcolor="success"
      header="Deposit"
      status={status}
      body={show ? 
        <DepositForm setShow={setShow} setStatus={setStatus} setBalance={setBalance} email={currentUser.email}/> : 
        <DepositMsg setShow={setShow} setStatus={setStatus} balance={balance}/>
      }
    />
  );
}

function DepositMsg(props) {
  return (
    <>
      <h5>Current Balance: ${props.balance}</h5>
      <button type="submit" 
        className="btn btn-light" 
        onClick={() => {
          props.setShow(true);
          props.setStatus('');
        }}>
          Deposit again
      </button>
    </>
  );
}

function DepositForm(props) {
  const [amount, setAmount] = React.useState('');

  function handle() {
    fetch(`/account/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            email: props.email,
            amount: parseFloat(amount)
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Deposit response:', data);
        if (data.success && data.value) {
            console.log('Deposit successful, new balance:', data.value.balance);
            props.setStatus('Deposit success!');
            props.setBalance(data.value.balance);
            props.setShow(false);
        } else {
            console.log('Deposit failed:', data.message);
            props.setStatus(data.message || 'Deposit failed');
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        props.setStatus('Error: Unable to complete the deposit');
    });
  }

  return (
    <>
      Amount<br/>
      <input type="number"
        className="form-control"
        placeholder="Enter amount"
        value={amount}
        onChange={e => setAmount(e.currentTarget.value)}/><br/>

      <button type="submit"
        className="btn btn-light"
        onClick={handle}>Deposit</button>
    </>
  );
}
