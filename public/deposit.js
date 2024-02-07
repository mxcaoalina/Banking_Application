function Deposit() {
  const [show, setShow] = React.useState(true);
  const [status, setStatus] = React.useState('');
  const [balance, setBalance] = React.useState(0); // Add balance state

  return (
    <Card
      bgcolor="warning"
      header="Deposit"
      status={status}
      body={show ? 
        <DepositForm setShow={setShow} setStatus={setStatus} setBalance={setBalance}/> : // Pass setBalance as prop
        <DepositMsg setShow={setShow} setStatus={setStatus} balance={balance}/> // Pass balance as prop
      }
    />
  );
}


function DepositMsg(props) {
  return (
    <>
      <h5>Current Balance: ${props.balance}</h5> {/* Display the current balance */}
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
  const [email, setEmail] = React.useState('');
  const [amount, setAmount] = React.useState('');

  function handle() {
    fetch(`/account/update/${email}/${parseFloat(amount)}`)
    .then(response => response.json())
    .then(data => {
        if (data.success && data.data && typeof data.data.balance !== 'undefined') {
            props.setStatus(`Deposit successful.`);
            props.setBalance(data.data.balance); // Ensure this property exists
            props.setShow(false);
        } else {
            props.setStatus('Deposit failed or account not found');
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        props.setStatus('Deposit failed due to network or server error');
    });
}

  return (
    <>
      Email<br/>
      <input type="input"
        className="form-control"
        placeholder="Enter email"
        value={email} onChange={e => setEmail(e.currentTarget.value)}/><br/>

      Amount<br/>
      <input type="number"
        className="form-control"
        placeholder="Enter amount"
        value={amount} onChange={e => setAmount(e.currentTarget.value)}/><br/>

      <button type="submit"
        className="btn btn-light"
        onClick={handle}>Deposit</button>
    </>
  );
}
