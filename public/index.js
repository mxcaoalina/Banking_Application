const React = window.React;
const ReactDOM = window.ReactDOM;
const { HashRouter, Routes, Route } = window.ReactRouterDOM;

// Import components
const UserProvider = window.UserProvider;
const NavBar = window.NavBar;
const Home = window.Home;
const CreateAccount = window.CreateAccount;
const Login = window.Login;
const Deposit = window.Deposit;
const Withdraw = window.Withdraw;
const Balance = window.Balance;
const AllData = window.AllData;

function Spa() {
  return (
    <HashRouter>
      <UserProvider>
        <div>
          <NavBar />
          <div className="container" style={{padding: "20px"}}>
            <Routes>
              <Route path="/" element={<Home/>} />
              <Route path="/CreateAccount" element={<CreateAccount/>} />
              <Route path="/login" element={<Login/>} />
              <Route path="/deposit" element={<Deposit/>} />
              <Route path="/withdraw" element={<Withdraw/>} />
              {/* <Route path="/transactions/" component={Transactions} /> */}
              <Route path="/balance" element={<Balance/>} />
              <Route path="/alldata" element={<AllData/>} />
            </Routes>
          </div>
        </div>
      </UserProvider>
    </HashRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Spa />
  </React.StrictMode>
);
