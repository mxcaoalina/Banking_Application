//import React, { useContext } from 'react';
//import { UserContext } from './context';

function NavBar() {
    const { currentUser, logout } = React.useContext(UserContext);
    const [isOpen, setIsOpen] = React.useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
                <a className="navbar-brand" href="#">BadBank</a>
                <button className="navbar-toggler" type="button" onClick={toggleMenu}>
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}>
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        {!currentUser ? (
                            <>
                                <li className="nav-item">
                                    <a className="nav-link" href="#/CreateAccount/">Create Account</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="#/login/">Login</a>
                                </li>
                            </>
                        ) : currentUser.role === 'admin' ? (
                            <>
                                <li className="nav-item">
                                    <a className="nav-link" href="#/alldata/">All Data</a>
                                </li>
                                <li className="nav-item">
                                    <button className="nav-link btn btn-link" onClick={logout}>Logout</button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <a className="nav-link" href="#/deposit/">Deposit</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="#/withdraw/">Withdraw</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="#/balance/">Balance</a>
                                </li>
                                <li className="nav-item">
                                    <button className="nav-link btn btn-link" onClick={logout}>Logout</button>
                                </li>
                            </>
                        )}
                    </ul>
                    {currentUser && (
                        <span className="navbar-text">
                            {currentUser.role === 'admin' ? 'Admin' : currentUser.email}
                        </span>
                    )}
                </div>
            </div>
        </nav>
    );
}