function Balance() {
  const [show, setShow] = React.useState(true);
  const [status, setStatus] = React.useState('');
  const [balance, setBalance] = React.useState(''); // Add balance state

  return (
    <Card
      bgcolor="info"
      header="Balance"
      status={status}
      body={show ? 
        <BalanceForm setShow={setShow} setStatus={setStatus} setBalance={setBalance} /> : // Pass setBalance down
        <BalanceMsg setShow={setShow} setStatus={setStatus} balance={balance} />} // Pass balance down
    />
  );
}

function BalanceMsg(props) {
  return (
    <>
      <h5>Balance: ${props.balance}</h5> {/* Display balance */}
      <button type="submit"
        className="btn btn-light"
        onClick={() => {
          props.setShow(true);
          props.setStatus('');
          props.setBalance(''); // Optionally reset balance if needed
        }}>
        Check balance again
      </button>
    </>
  );
}

function BalanceForm(props) {
  const [email, setEmail] = React.useState('');

  function handle() {
    fetch(`/account/findOne/${email}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.balance !== undefined) {
          props.setBalance(data.balance); // Update balance in parent's state
         // props.setStatus(`Balance: $${data.balance}`); // Optionally set a status message
        } else {
          props.setStatus('Account not found or error retrieving balance');
        }
        props.setShow(false);
        console.log('JSON:', data);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        props.setStatus('Error fetching account details');
      });
  }

  return (
    <>
      Email<br/>
      <input type="input"
        className="form-control"
        placeholder="Enter email"
        value={email}
        onChange={e => setEmail(e.currentTarget.value)} /><br/>

      <button type="submit"
        className="btn btn-light"
        onClick={handle}>
        Check Balance
      </button>
    </>
  );
}