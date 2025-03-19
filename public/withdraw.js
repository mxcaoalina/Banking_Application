function Withdraw() {
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
            <p>You must be logged in to make withdrawals.</p>
            <a href="#/login" className="btn btn-light">Go to Login</a>
          </div>
        }
      />
    );
  }

  return (
    <Card
      bgcolor="success"
      header="Withdraw"
      status={status}
      body={show ? 
        <WithdrawForm setShow={setShow} setStatus={setStatus} setBalance={setBalance} email={currentUser.email}/> : 
        <WithdrawMsg setShow={setShow} setStatus={setStatus} balance={balance}/>
      }
    />
  );
}

function WithdrawMsg(props) {
  return (
    <>
      <h5>Current Balance: ${props.balance}</h5>
      <button type="submit" 
        className="btn btn-light" 
        onClick={() => {
          props.setShow(true);
          props.setStatus('');
        }}>
          Withdraw again
      </button>
    </>
  );
}

function WithdrawForm(props) {
  const [amount, setAmount] = React.useState('');

  function handle() {
    fetch(`/account/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            email: props.email,
            amount: -parseFloat(amount)
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Withdraw response:', data);
        if (data.success) {
            console.log('Withdraw successful, new balance:', data.balance);
            props.setStatus('Withdraw success!');
            props.setBalance(data.balance);
            props.setShow(false);
        } else {
            console.log('Withdraw failed:', data.message);
            props.setStatus(data.message || 'Withdraw failed');
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        props.setStatus('Error: Unable to complete the withdraw');
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
        onClick={handle}>Withdraw</button>
    </>
  );
}
